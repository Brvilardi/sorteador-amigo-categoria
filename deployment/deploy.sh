#!/bin/bash

################################################################################
# AWS S3 + CloudFront Deployment Script for Secret Santa React Application
# 
# This script automates the deployment of the React application to AWS S3
# with CloudFront CDN distribution.
#
# Prerequisites:
# - AWS CLI installed and configured (aws configure)
# - Node.js and npm installed
# - Appropriate AWS permissions for S3, CloudFront, and CloudFormation
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="secret-santa-app"
STACK_NAME="${PROJECT_NAME}-infrastructure"
REGION="${AWS_REGION:-us-east-1}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        log_info "Visit: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI is not configured. Run 'aws configure' first."
        exit 1
    fi
    
    log_info "AWS CLI configured successfully"
}

check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    log_info "Node.js $(node --version) detected"
}

build_application() {
    log_info "Building React application..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm install
    fi
    
    # Build the production version
    npm run build
    
    if [ ! -d "dist" ]; then
        log_error "Build failed. 'dist' directory not found."
        exit 1
    fi
    
    log_info "Build completed successfully"
}

deploy_infrastructure() {
    log_info "Deploying AWS infrastructure (S3 + CloudFront)..."
    
    aws cloudformation deploy \
        --template-file deployment/cloudformation-template.yaml \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --capabilities CAPABILITY_IAM \
        --parameter-overrides ProjectName="$PROJECT_NAME" \
        --no-fail-on-empty-changeset
    
    if [ $? -eq 0 ]; then
        log_info "Infrastructure deployed successfully"
    else
        log_error "Infrastructure deployment failed"
        exit 1
    fi
}

get_bucket_name() {
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
        --output text)
    
    if [ -z "$BUCKET_NAME" ]; then
        log_error "Could not retrieve bucket name from CloudFormation stack"
        exit 1
    fi
    
    echo "$BUCKET_NAME"
}

get_cloudfront_url() {
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
        --output text)
    
    echo "$CLOUDFRONT_URL"
}

get_cloudfront_id() {
    CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
        --output text)
    
    echo "$CLOUDFRONT_ID"
}

sync_to_s3() {
    local bucket_name=$1
    
    log_info "Syncing files to S3 bucket: $bucket_name..."
    
    # Sync build files to S3 with appropriate cache headers
    aws s3 sync dist/ "s3://$bucket_name/" \
        --region "$REGION" \
        --delete \
        --cache-control "public, max-age=31536000" \
        --exclude "index.html" \
        --exclude "*.html"
    
    # Upload HTML files with shorter cache time
    aws s3 sync dist/ "s3://$bucket_name/" \
        --region "$REGION" \
        --cache-control "public, max-age=0, must-revalidate" \
        --exclude "*" \
        --include "*.html"
    
    log_info "Files synced successfully"
}

invalidate_cloudfront() {
    local distribution_id=$1
    
    log_info "Invalidating CloudFront cache..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$distribution_id" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    log_info "CloudFront invalidation created: $INVALIDATION_ID"
    log_warn "Cache invalidation may take 5-10 minutes to complete"
}

display_urls() {
    local cloudfront_url=$1
    
    echo ""
    log_info "=================================="
    log_info "Deployment completed successfully!"
    log_info "=================================="
    echo ""
    log_info "Application URL: https://$cloudfront_url"
    echo ""
    log_info "You can now access your Secret Santa application at the URL above."
    log_info "Note: It may take a few minutes for the CloudFront distribution to fully deploy."
    echo ""
}

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    
    # Check prerequisites
    check_aws_cli
    check_node
    
    # Build the application
    build_application
    
    # Deploy infrastructure
    deploy_infrastructure
    
    # Get infrastructure details
    BUCKET_NAME=$(get_bucket_name)
    CLOUDFRONT_URL=$(get_cloudfront_url)
    CLOUDFRONT_ID=$(get_cloudfront_id)
    
    # Sync files to S3
    sync_to_s3 "$BUCKET_NAME"
    
    # Invalidate CloudFront cache
    invalidate_cloudfront "$CLOUDFRONT_ID"
    
    # Display final URLs
    display_urls "$CLOUDFRONT_URL"
}

# Run main function
main
