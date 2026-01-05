# AWS Deployment Guide

This directory contains scripts and configuration for deploying the Secret Santa React application to AWS using S3 and CloudFront.

## Architecture Overview

The deployment consists of:

- **AWS S3**: Hosts the static React application files with website hosting enabled
- **AWS CloudFront**: CDN for fast global content delivery, HTTPS support, and edge caching
- **AWS CloudFormation**: Infrastructure as Code for reproducible deployments

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account**: An active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured
   ```bash
   # Install AWS CLI (if not installed)
   # macOS
   brew install awscli
   
   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Windows
   # Download and run the installer from https://aws.amazon.com/cli/
   
   # Configure AWS CLI
   aws configure
   ```
   You'll need to provide:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `us-east-1`)
   - Default output format (e.g., `json`)

3. **Node.js**: Version 14 or higher
4. **npm**: Usually comes with Node.js

5. **Required AWS Permissions**:
   - S3: Create/delete buckets, put/get objects, manage bucket policies
   - CloudFront: Create/delete distributions, create invalidations
   - CloudFormation: Create/update/delete stacks
   - IAM: Create CloudFront Origin Access Identity

## Initial Deployment

To deploy the application for the first time:

```bash
# Navigate to the project root
cd /path/to/sorteador-amigo-categoria

# Run the deployment script
./deployment/deploy.sh
```

The script will:
1. ✅ Check AWS CLI and Node.js prerequisites
2. ✅ Build the React application (`npm run build`)
3. ✅ Deploy AWS infrastructure using CloudFormation
4. ✅ Upload built files to S3 with optimized cache headers
5. ✅ Create CloudFront distribution for CDN
6. ✅ Invalidate CloudFront cache
7. ✅ Display the application URL

### What Gets Created

- **S3 Bucket**: `secret-santa-app-{AWS-ACCOUNT-ID}`
  - Static website hosting enabled
  - Public read access for website content
  - Configured with CORS for API calls
  
- **CloudFront Distribution**:
  - HTTPS enabled by default
  - Global edge locations for fast content delivery
  - Error page routing for React Router support
  - Compression enabled for faster loading

### Environment Variables

You can customize the deployment with environment variables:

```bash
# Use a different AWS region (default: us-east-1)
export AWS_REGION=eu-west-1
./deployment/deploy.sh

# Use a custom AWS profile
export AWS_PROFILE=my-profile
./deployment/deploy.sh
```

## Updating the Application

After making changes to your application code:

```bash
# Quick update (skips infrastructure changes)
./deployment/update.sh
```

The update script:
1. ✅ Builds the latest version
2. ✅ Uploads only changed files to S3
3. ✅ Invalidates CloudFront cache
4. ✅ Much faster than full deployment

**Note**: Cache invalidation takes 5-10 minutes to propagate globally.

## Viewing Deployment Status

Check your deployment status:

```bash
# View CloudFormation stack status
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query 'Stacks[0].StackStatus'

# Get application URL
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query 'Stacks[0].Outputs'

# Check CloudFront distribution status
aws cloudfront list-distributions \
  --query 'DistributionList.Items[?Comment==`CDN for secret-santa-app`].[Id,Status,DomainName]'
```

## Removing the Deployment

To completely remove all AWS resources:

```bash
# Run teardown script (will prompt for confirmation)
./deployment/teardown.sh
```

This will:
1. ⚠️ Empty the S3 bucket
2. ⚠️ Delete the CloudFormation stack
3. ⚠️ Remove the CloudFront distribution
4. ⚠️ Delete all associated resources

**WARNING**: This action is irreversible!

## Troubleshooting

### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### AWS CLI Not Configured

```bash
# Configure AWS CLI
aws configure

# Or use a specific profile
export AWS_PROFILE=my-profile
```

### Permission Errors

Ensure your AWS user/role has the following policies:
- `AmazonS3FullAccess` or custom S3 permissions
- `CloudFrontFullAccess` or custom CloudFront permissions
- `AWSCloudFormationFullAccess` or custom CloudFormation permissions

### CloudFront Changes Not Visible

CloudFront caching can delay updates. To see changes immediately:

```bash
# Force cache invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Stack Already Exists Error

If deployment fails due to existing stack:

```bash
# Update existing stack
aws cloudformation update-stack \
  --stack-name secret-santa-app-infrastructure \
  --template-body file://deployment/cloudformation-template.yaml

# Or delete and recreate
./deployment/teardown.sh
./deployment/deploy.sh
```

## Cost Considerations

AWS resources used and approximate costs:

- **S3 Storage**: ~$0.023 per GB/month
  - Typical React app: <100 MB = ~$0.002/month
  
- **S3 Requests**: 
  - GET: $0.0004 per 1,000 requests
  - PUT: $0.005 per 1,000 requests
  
- **CloudFront**:
  - Data Transfer: $0.085 per GB (first 10TB)
  - Requests: $0.0075 per 10,000 HTTPS requests
  - Free tier: 50GB data transfer + 2M HTTPS requests/month (first 12 months)

- **CloudFormation**: No additional cost

**Estimated Monthly Cost**: $1-5 for low traffic (<10,000 visitors/month)

## Security Best Practices

The deployment includes:

✅ HTTPS enforced via CloudFront
✅ S3 bucket policy restricts access to website content only
✅ No AWS credentials in code
✅ CloudFront compression reduces bandwidth
✅ Secure origin access from CloudFront to S3
✅ CORS configured for secure cross-origin requests

## Custom Domain Setup (Optional)

To use a custom domain (e.g., `santa.yourdomain.com`):

1. Register or use existing domain in Route 53 or other DNS provider
2. Request SSL certificate in AWS Certificate Manager (ACM) for your domain
3. Update CloudFormation template to include:
   ```yaml
   Aliases:
     - santa.yourdomain.com
   ViewerCertificate:
     AcmCertificateArn: arn:aws:acm:us-east-1:xxxxx:certificate/xxxxx
     SslSupportMethod: sni-only
   ```
4. Create DNS CNAME record pointing to CloudFront domain

## Support

For issues or questions:

1. Check AWS CloudWatch logs for errors
2. Review CloudFormation events in AWS Console
3. Verify AWS CLI configuration: `aws sts get-caller-identity`
4. Check repository issues on GitHub

## Additional Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [CloudFormation User Guide](https://docs.aws.amazon.com/cloudformation/)
