# AWS Deployment Guide - Secret Santa React Application

This guide provides step-by-step instructions for deploying the React Secret Santa application to AWS using S3 and CloudFront.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Quick Start](#quick-start)
4. [Detailed Deployment Steps](#detailed-deployment-steps)
5. [Testing Your Deployment](#testing-your-deployment)
6. [Updating Your Application](#updating-your-application)
7. [Teardown Instructions](#teardown-instructions)
8. [Troubleshooting](#troubleshooting)
9. [Cost Considerations](#cost-considerations)

---

## Prerequisites

Before deploying, ensure you have:

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **AWS CLI** (v2 or higher) - [Installation guide](https://aws.amazon.com/cli/)
- **Git** (for cloning the repository)

### AWS Account Setup
1. **AWS Account** - Create one at [aws.amazon.com](https://aws.amazon.com/)
2. **AWS CLI Configured** - Run `aws configure` and provide:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `us-east-1`)
   - Default output format (e.g., `json`)

### Required AWS Permissions
Your AWS user/role needs permissions for:
- **S3**: Create buckets, upload files, configure website hosting
- **CloudFront**: Create distributions, invalidate cache
- **CloudFormation**: Create/update/delete stacks
- **IAM**: Create bucket policies (automatically handled by CloudFormation)

---

## Architecture Overview

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS
                      ▼
         ┌────────────────────────┐
         │   CloudFront CDN       │
         │  (Global Distribution) │
         │                        │
         │  - HTTPS Enforcement   │
         │  - Caching             │
         │  - Gzip Compression    │
         │  - SPA Routing Support │
         └───────────┬────────────┘
                     │
                     │ HTTP
                     ▼
         ┌────────────────────────┐
         │   S3 Bucket            │
         │  (Static Website)      │
         │                        │
         │  - index.html          │
         │  - assets/             │
         │  - Public Read Access  │
         └────────────────────────┘
```

### Key Features

1. **S3 Static Website Hosting**
   - Hosts all React build files (HTML, JS, CSS, assets)
   - Configured for SPA routing (404 → index.html)
   - Public read access for content delivery

2. **CloudFront CDN**
   - Global content delivery network
   - HTTPS support with default certificate
   - Automatic HTTP → HTTPS redirect
   - Gzip compression for faster load times
   - Custom error pages for React Router support
   - Edge caching for improved performance

3. **React Router Support**
   - Custom error responses (403/404 → index.html)
   - Client-side routing works seamlessly
   - Direct URL access works for all routes

---

## Quick Start

For experienced users, here's the fastest path to deployment:

```bash
# 1. Navigate to project directory
cd sorteador-amigo-categoria

# 2. Deploy everything (infrastructure + application)
npm run deploy

# 3. Test deployment
npm run deploy:test
```

The deployment script will:
- ✅ Verify prerequisites (AWS CLI, Node.js)
- ✅ Install dependencies
- ✅ Build React application
- ✅ Deploy CloudFormation stack (S3 + CloudFront)
- ✅ Upload files to S3
- ✅ Invalidate CloudFront cache
- ✅ Display application URL

**Expected Output:**
```
[INFO] Deployment completed successfully!
[INFO] ==================================
[INFO] Application URL: https://d1234567890abc.cloudfront.net
```

---

## Detailed Deployment Steps

### Step 1: Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should show v16.x.x or higher

# Check AWS CLI version
aws --version
# Should show aws-cli/2.x.x or higher

# Verify AWS credentials
aws sts get-caller-identity
# Should display your AWS account details
```

### Step 2: Clone and Navigate to Project

```bash
git clone <repository-url>
cd sorteador-amigo-categoria
```

### Step 3: Review Configuration (Optional)

The deployment uses these default values:
- **Project Name**: `secret-santa-app`
- **Stack Name**: `secret-santa-app-infrastructure`
- **Region**: `us-east-1` (or AWS_REGION environment variable)

To customize, edit `deployment/deploy.sh`:
```bash
PROJECT_NAME="your-project-name"
REGION="your-preferred-region"
```

### Step 4: Run Deployment

```bash
# Option A: Using npm script (recommended)
npm run deploy

# Option B: Direct script execution
bash deployment/deploy.sh
```

**What happens during deployment:**

1. **Build Phase** (~1-2 minutes)
   - Installs npm dependencies (if needed)
   - Runs `npm run build` to create production build
   - Creates `dist/` directory with optimized files

2. **Infrastructure Phase** (~5-10 minutes)
   - Creates CloudFormation stack
   - Provisions S3 bucket with website hosting
   - Creates CloudFront distribution
   - Configures bucket policies
   - Sets up custom error pages for SPA routing

3. **Upload Phase** (~30 seconds - 2 minutes)
   - Syncs files to S3 bucket
   - Sets appropriate cache headers:
     - Static assets (JS, CSS, images): 1 year cache
     - HTML files: No cache (always fresh)

4. **Cache Invalidation** (~5-10 minutes to complete)
   - Creates CloudFront cache invalidation
   - Ensures latest content is served globally

### Step 5: Wait for CloudFront Deployment

CloudFront distributions take time to fully deploy:
- **Initial deployment**: 15-30 minutes
- **Updates**: 5-15 minutes

You'll see: `[WARN] Note: It may take a few minutes for the CloudFront distribution to fully deploy.`

---

## Testing Your Deployment

### Automated Testing

Run the comprehensive test suite:

```bash
npm run deploy:test
```

**Tests performed:**
1. ✅ CloudFormation stack status
2. ✅ S3 bucket exists and contains files
3. ✅ CloudFront distribution is enabled
4. ✅ Application URL responds (HTTP 200)
5. ✅ React app content is present
6. ✅ SPA routing works (404 → index.html)

**Sample output:**
```
[TEST] Testing CloudFormation stack...
✓ PASSED CloudFormation stack is deployed (Status: CREATE_COMPLETE)

[TEST] Testing S3 bucket...
✓ PASSED S3 bucket exists and contains 15 files
✓ PASSED index.html found in S3 bucket

[TEST] Testing CloudFront distribution...
✓ PASSED CloudFront distribution is deployed and enabled

[TEST] Testing application URL...
✓ PASSED Application URL responds with HTTP 200
✓ PASSED Response contains React app root element

[TEST] Testing SPA routing...
✓ PASSED SPA routing works (404 redirects to index.html)

========================================
Test Results
========================================

Passed: 8
Failed: 0

[INFO] All tests passed! ✓
[INFO] Application URL: https://d1234567890abc.cloudfront.net
```

### Manual Testing

1. **Access the application:**
   ```bash
   # Get your CloudFront URL from deployment output or run:
   aws cloudformation describe-stacks \
     --stack-name secret-santa-app-infrastructure \
     --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" \
     --output text
   ```

2. **Test different scenarios:**
   - ✅ Home page loads
   - ✅ Can create participants
   - ✅ Can perform draw
   - ✅ Direct URL access works (e.g., `/admin/results`)
   - ✅ Browser refresh works on any route
   - ✅ HTTPS works (HTTP redirects to HTTPS)

3. **Test from different locations/devices:**
   - Desktop browsers (Chrome, Firefox, Safari, Edge)
   - Mobile browsers (iOS Safari, Android Chrome)
   - Different geographic locations (CloudFront caching)

---

## Updating Your Application

After making code changes, use the update script for faster deployments:

```bash
# Quick update (skips infrastructure changes)
npm run deploy:update
```

**What the update script does:**
1. Rebuilds the React application
2. Uploads new files to existing S3 bucket
3. Invalidates CloudFront cache
4. Does NOT recreate infrastructure (faster)

**When to use update vs full deploy:**
- **Use `deploy:update`**: Code changes, styling updates, content changes
- **Use `deploy`**: Infrastructure changes, first deployment, or after infrastructure issues

---

## Teardown Instructions

To completely remove all AWS resources:

```bash
npm run deploy:teardown
```

**⚠️ WARNING:** This will permanently delete:
- S3 bucket and all contents
- CloudFront distribution
- CloudFormation stack
- All application data

You'll be prompted to confirm by typing `yes`.

**Steps performed:**
1. Empties S3 bucket (deletes all files)
2. Deletes CloudFormation stack
3. Waits for complete deletion (may take 20-30 minutes due to CloudFront)

---

## Troubleshooting

### Issue: "AWS CLI is not configured"

**Solution:**
```bash
aws configure
# Enter your AWS credentials when prompted
```

### Issue: "Permission denied" errors

**Solutions:**
1. Check IAM permissions for your AWS user
2. Ensure you have permissions for S3, CloudFront, and CloudFormation
3. Try using an IAM user with AdministratorAccess (for testing)

### Issue: CloudFormation stack creation fails

**Check the error:**
```bash
aws cloudformation describe-stack-events \
  --stack-name secret-santa-app-infrastructure \
  --max-items 10
```

**Common causes:**
- Bucket name already exists (must be globally unique)
- Insufficient permissions
- Regional service limits reached

**Solution:** Delete failed stack and retry:
```bash
aws cloudformation delete-stack \
  --stack-name secret-santa-app-infrastructure
```

### Issue: Application shows 403 Forbidden

**Causes:**
- S3 bucket policy not applied correctly
- CloudFront still deploying

**Solutions:**
1. Wait 15-20 minutes for full CloudFront deployment
2. Check bucket policy exists:
   ```bash
   aws s3api get-bucket-policy \
     --bucket secret-santa-app-<account-id>
   ```
3. Verify files were uploaded to S3

### Issue: React Router routes return 404

**This should be fixed!** The CloudFormation template now correctly configures:
- Custom error responses (403/404 → 200 status with index.html)
- S3 website endpoint usage with CustomOriginConfig only

**Verify the fix:**
```bash
npm run deploy:test
# Should pass the "SPA routing" test
```

### Issue: Changes not appearing after update

**Causes:**
- Browser cache
- CloudFront cache invalidation still in progress

**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Wait for CloudFront invalidation to complete:
   ```bash
   aws cloudfront list-invalidations \
     --distribution-id <your-distribution-id>
   ```
4. Try in incognito/private browsing mode

### Issue: Build fails

**Solution:**
```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building locally first
npm run build
```

### Getting Stack Outputs

To retrieve deployment information:

```bash
# Get all outputs
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].Outputs"

# Get specific values
# Bucket Name:
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
  --output text

# CloudFront URL:
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
  --output text

# CloudFront Distribution ID:
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text
```

---

## Cost Considerations

### AWS Free Tier Benefits

This deployment uses services that are eligible for AWS Free Tier:

**S3 (First 12 months):**
- 5 GB of standard storage
- 20,000 GET requests
- 2,000 PUT requests

**CloudFront (Always free):**
- 1 TB of data transfer out
- 10,000,000 HTTP/HTTPS requests
- 2,000,000 CloudFront Function invocations

### Estimated Monthly Costs (After Free Tier)

For a small application with moderate traffic:

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| S3 Storage | ~10 MB | $0.01 |
| S3 Requests | ~10,000/month | $0.01 |
| CloudFront | ~1 GB transfer | $0.09 |
| **Total** | | **~$0.11/month** |

**Notes:**
- Costs scale with traffic
- Free tier covers most small-to-medium applications
- CloudFormation is free (only pay for resources created)
- Cache invalidations: First 1,000/month free, then $0.005 per path

### Cost Optimization Tips

1. **Reduce invalidations:** Use versioned assets (Vite does this automatically)
2. **Leverage caching:** Longer TTLs for static assets
3. **Monitor usage:** Use AWS Cost Explorer
4. **Set up billing alerts:** Get notified if costs increase unexpectedly

---

## Additional Resources

### Documentation
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

### Support
- Report issues in the GitHub repository
- Check AWS Service Health Dashboard for service issues
- Review CloudWatch Logs for application errors

---

## Summary

You've successfully deployed a production-ready React application to AWS with:
- ✅ **Global CDN delivery** via CloudFront
- ✅ **HTTPS support** with automatic HTTP redirect
- ✅ **React Router support** with proper SPA routing
- ✅ **Optimized caching** for fast performance
- ✅ **Easy updates** with automated scripts
- ✅ **Cost-effective** infrastructure (~$0.11/month or free tier)

**Your application is live and accessible globally!** 🎉

Access your application at: `https://YOUR-CLOUDFRONT-DOMAIN.cloudfront.net`

---

*Last Updated: 2025-12-16*
