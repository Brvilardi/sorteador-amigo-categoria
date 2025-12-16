#!/bin/bash

################################################################################
# Deployment Test Script for Secret Santa React Application
# 
# This script tests the deployment to ensure everything is working correctly.
# It performs the following checks:
# 1. Verifies CloudFormation stack is deployed
# 2. Checks S3 bucket exists and contains files
# 3. Verifies CloudFront distribution is enabled
# 4. Tests the application URL responds correctly
# 5. Validates SPA routing works (React Router)
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="secret-santa-app"
STACK_NAME="${PROJECT_NAME}-infrastructure"
REGION="${AWS_REGION:-us-east-1}"

# Test counters
PASSED=0
FAILED=0

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

test_passed() {
    echo -e "${GREEN}✓ PASSED${NC} $1"
    ((PASSED++))
}

test_failed() {
    echo -e "${RED}✗ FAILED${NC} $1"
    ((FAILED++))
}

# Test 1: Check CloudFormation stack
test_cloudformation_stack() {
    log_test "Testing CloudFormation stack..."
    
    STACK_STATUS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].StackStatus" \
        --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$STACK_STATUS" == "CREATE_COMPLETE" ] || [ "$STACK_STATUS" == "UPDATE_COMPLETE" ]; then
        test_passed "CloudFormation stack is deployed (Status: $STACK_STATUS)"
        return 0
    else
        test_failed "CloudFormation stack not found or in wrong state (Status: $STACK_STATUS)"
        return 1
    fi
}

# Test 2: Check S3 bucket
test_s3_bucket() {
    log_test "Testing S3 bucket..."
    
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$BUCKET_NAME" ]; then
        test_failed "Could not retrieve bucket name"
        return 1
    fi
    
    # Check if bucket contains files
    FILE_COUNT=$(aws s3 ls "s3://$BUCKET_NAME/" --recursive --region "$REGION" | wc -l)
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        test_passed "S3 bucket exists and contains $FILE_COUNT files"
        
        # Check for index.html
        if aws s3 ls "s3://$BUCKET_NAME/index.html" --region "$REGION" &>/dev/null; then
            test_passed "index.html found in S3 bucket"
        else
            test_failed "index.html not found in S3 bucket"
        fi
        return 0
    else
        test_failed "S3 bucket is empty"
        return 1
    fi
}

# Test 3: Check CloudFront distribution
test_cloudfront_distribution() {
    log_test "Testing CloudFront distribution..."
    
    DIST_ID=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$DIST_ID" ]; then
        test_failed "Could not retrieve CloudFront distribution ID"
        return 1
    fi
    
    DIST_STATUS=$(aws cloudfront get-distribution \
        --id "$DIST_ID" \
        --query "Distribution.Status" \
        --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$DIST_STATUS" == "Deployed" ]; then
        test_passed "CloudFront distribution is deployed and enabled"
        return 0
    else
        test_warn "CloudFront distribution status: $DIST_STATUS (may still be deploying)"
        return 0
    fi
}

# Test 4: Check application URL
test_application_url() {
    log_test "Testing application URL..."
    
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$CLOUDFRONT_URL" ]; then
        test_failed "Could not retrieve CloudFront URL"
        return 1
    fi
    
    # Test HTTPS endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$CLOUDFRONT_URL" --max-time 30 || echo "000")
    
    if [ "$HTTP_CODE" == "200" ]; then
        test_passed "Application URL responds with HTTP 200 (https://$CLOUDFRONT_URL)"
        
        # Check if content contains React app
        CONTENT=$(curl -s "https://$CLOUDFRONT_URL" --max-time 30)
        if echo "$CONTENT" | grep -q "div id=\"root\""; then
            test_passed "Response contains React app root element"
        else
            test_warn "Response doesn't contain expected React app structure"
        fi
        
        return 0
    else
        test_failed "Application URL returned HTTP $HTTP_CODE"
        log_warn "URL: https://$CLOUDFRONT_URL"
        log_warn "This may be due to CloudFront still deploying. Wait a few minutes and try again."
        return 1
    fi
}

# Test 5: Check SPA routing (error pages redirect to index.html)
test_spa_routing() {
    log_test "Testing SPA routing..."
    
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$CLOUDFRONT_URL" ]; then
        test_failed "Could not retrieve CloudFront URL"
        return 1
    fi
    
    # Test a non-existent route (should return 200 with index.html for SPA)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$CLOUDFRONT_URL/nonexistent-page" --max-time 30 || echo "000")
    
    if [ "$HTTP_CODE" == "200" ]; then
        test_passed "SPA routing works (404 redirects to index.html)"
        return 0
    else
        test_failed "SPA routing may not be configured correctly (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Main test execution
main() {
    echo ""
    log_info "========================================"
    log_info "Starting Deployment Tests"
    log_info "========================================"
    echo ""
    
    # Run all tests
    test_cloudformation_stack
    echo ""
    
    test_s3_bucket
    echo ""
    
    test_cloudfront_distribution
    echo ""
    
    test_application_url
    echo ""
    
    test_spa_routing
    echo ""
    
    # Display results
    log_info "========================================"
    log_info "Test Results"
    log_info "========================================"
    echo ""
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        log_info "All tests passed! ✓"
        log_info "Your application is successfully deployed and working."
        echo ""
        
        # Display the URL
        CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
            --stack-name "$STACK_NAME" \
            --region "$REGION" \
            --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$CLOUDFRONT_URL" ]; then
            log_info "Application URL: https://$CLOUDFRONT_URL"
        fi
        echo ""
        exit 0
    else
        log_error "Some tests failed. Please review the errors above."
        echo ""
        exit 1
    fi
}

# Check for AWS CLI
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v curl &> /dev/null; then
    log_error "curl is not installed. Please install it first."
    exit 1
fi

# Run tests
main
