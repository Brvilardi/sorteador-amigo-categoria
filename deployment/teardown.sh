#!/bin/bash

################################################################################
# Teardown Script for Secret Santa React Application
# 
# This script removes all AWS resources created for the application.
# WARNING: This will delete the S3 bucket and CloudFront distribution!
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

# Confirm deletion
echo ""
log_warn "WARNING: This will delete all AWS resources for the Secret Santa application!"
log_warn "This includes:"
log_warn "  - S3 Bucket and all its contents"
log_warn "  - CloudFront Distribution"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " -r
echo ""

if [[ ! $REPLY =~ ^yes$ ]]; then
    log_info "Teardown cancelled."
    exit 0
fi

# Get bucket name
log_info "Retrieving S3 bucket name..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
    --output text 2>/dev/null || echo "")

if [ -n "$BUCKET_NAME" ]; then
    log_info "Emptying S3 bucket: $BUCKET_NAME"
    aws s3 rm "s3://$BUCKET_NAME" --recursive --region "$REGION" || true
    log_info "S3 bucket emptied"
else
    log_warn "Could not find S3 bucket name. It may have been already deleted."
fi

# Delete CloudFormation stack
log_info "Deleting CloudFormation stack: $STACK_NAME"
aws cloudformation delete-stack \
    --stack-name "$STACK_NAME" \
    --region "$REGION"

log_info "Waiting for stack deletion to complete..."
log_warn "This may take several minutes as CloudFront distributions take time to delete..."

aws cloudformation wait stack-delete-complete \
    --stack-name "$STACK_NAME" \
    --region "$REGION"

echo ""
log_info "=================================="
log_info "Teardown completed successfully!"
log_info "=================================="
echo ""
log_info "All AWS resources have been removed."
echo ""
