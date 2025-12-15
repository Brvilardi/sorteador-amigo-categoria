#!/bin/bash

################################################################################
# Quick Update Script for Secret Santa React Application
# 
# This script updates an existing deployment without recreating infrastructure.
# Use this for quick updates after the initial deployment.
################################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="secret-santa-app"
STACK_NAME="${PROJECT_NAME}-infrastructure"
REGION="${AWS_REGION:-us-east-1}"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build the application
log_info "Building React application..."
npm run build

if [ ! -d "dist" ]; then
    log_error "Build failed. 'dist' directory not found."
    exit 1
fi

log_info "Build completed successfully"

# Get bucket name from CloudFormation
log_info "Retrieving S3 bucket name..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
    --output text 2>/dev/null)

if [ -z "$BUCKET_NAME" ]; then
    log_error "Could not find existing deployment. Please run deploy.sh first."
    exit 1
fi

log_info "Uploading to S3 bucket: $BUCKET_NAME"

# Sync static assets with long cache
aws s3 sync dist/ "s3://$BUCKET_NAME/" \
    --region "$REGION" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.html"

# Sync HTML with short cache
aws s3 sync dist/ "s3://$BUCKET_NAME/" \
    --region "$REGION" \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "*.html"

log_info "Files uploaded successfully"

# Get CloudFront distribution ID
CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text)

# Invalidate CloudFront cache
log_info "Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

log_info "CloudFront invalidation created: $INVALIDATION_ID"

# Get CloudFront URL
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
    --output text)

echo ""
log_info "=================================="
log_info "Update completed successfully!"
log_info "=================================="
echo ""
log_info "Application URL: https://$CLOUDFRONT_URL"
echo ""
log_warn "Note: CloudFront cache invalidation may take 5-10 minutes to complete"
echo ""
