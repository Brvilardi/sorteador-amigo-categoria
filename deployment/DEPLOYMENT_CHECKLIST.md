# Deployment Checklist

Use this checklist to ensure successful deployment of the Secret Santa React application to AWS.

## Pre-Deployment Checklist

### ✅ Prerequisites Verification

- [ ] **AWS CLI installed** (v2.0 or higher)
  ```bash
  aws --version
  ```

- [ ] **AWS CLI configured** with valid credentials
  ```bash
  aws sts get-caller-identity
  # Should return your AWS account details
  ```

- [ ] **Node.js installed** (v16 or higher)
  ```bash
  node --version
  ```

- [ ] **npm installed**
  ```bash
  npm --version
  ```

- [ ] **Project dependencies installed**
  ```bash
  npm install
  ```

- [ ] **Local build works**
  ```bash
  npm run build
  # Should create dist/ directory
  ```

### ✅ AWS Permissions Check

Verify your AWS user/role has permissions for:
- [ ] S3 (CreateBucket, PutObject, PutBucketPolicy, PutBucketWebsite)
- [ ] CloudFront (CreateDistribution, CreateInvalidation)
- [ ] CloudFormation (CreateStack, DescribeStacks, UpdateStack)

### ✅ Configuration Review

- [ ] Review `deployment/deploy.sh` configuration:
  - [ ] PROJECT_NAME (default: `secret-santa-app`)
  - [ ] REGION (default: `us-east-1`)
  
- [ ] Ensure CloudFormation template is fixed:
  - [ ] Only CustomOriginConfig present (no S3OriginConfig)
  - [ ] OAI resource removed
  - [ ] S3 website endpoint used

## Deployment Execution

### Step 1: Initial Deployment

```bash
npm run deploy
```

**Expected Duration**: 15-30 minutes (CloudFront takes time to deploy)

**Monitor for:**
- [ ] Dependencies installation completes
- [ ] React build succeeds (dist/ created)
- [ ] CloudFormation stack creates successfully
- [ ] S3 bucket created
- [ ] Files uploaded to S3
- [ ] CloudFront distribution created
- [ ] CloudFront URL provided

**Success Indicators:**
```
[INFO] Deployment completed successfully!
[INFO] ==================================
[INFO] Application URL: https://dXXXXXXXXXXXXX.cloudfront.net
```

### Step 2: Verify Deployment

Wait 5-10 minutes for CloudFront to fully deploy, then:

```bash
npm run deploy:test
```

**Expected Results:**
- [ ] CloudFormation stack: CREATE_COMPLETE or UPDATE_COMPLETE
- [ ] S3 bucket: Contains files including index.html
- [ ] CloudFront distribution: Deployed status
- [ ] Application URL: Returns HTTP 200
- [ ] React app: Contains root element
- [ ] SPA routing: Works correctly (404 → index.html)

**All tests should pass:**
```
Passed: 8
Failed: 0
[INFO] All tests passed! ✓
```

### Step 3: Manual Verification

- [ ] **Open application in browser**
  ```
  https://YOUR-CLOUDFRONT-DOMAIN.cloudfront.net
  ```

- [ ] **Test core functionality:**
  - [ ] Home page loads
  - [ ] Can add participants
  - [ ] Can add categories
  - [ ] Can execute draw
  - [ ] Results page displays
  - [ ] Participant links work

- [ ] **Test routing:**
  - [ ] Navigate to `/admin/results`
  - [ ] Refresh page (should still work)
  - [ ] Try invalid route (should redirect to home)

- [ ] **Test HTTPS:**
  - [ ] HTTPS works
  - [ ] HTTP redirects to HTTPS
  - [ ] No mixed content warnings

- [ ] **Test from multiple devices:**
  - [ ] Desktop browser
  - [ ] Mobile browser
  - [ ] Different browsers (Chrome, Firefox, Safari, Edge)

## Post-Deployment Tasks

### Documentation

- [ ] **Record CloudFront URL**
  ```bash
  # Get from stack outputs:
  aws cloudformation describe-stacks \
    --stack-name secret-santa-app-infrastructure \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" \
    --output text
  ```

- [ ] **Save Stack Information**
  - Stack Name: `secret-santa-app-infrastructure`
  - Region: `us-east-1` (or your chosen region)
  - Bucket Name: `secret-santa-app-<account-id>`
  - CloudFront Distribution ID: (from outputs)

### Monitoring Setup (Optional)

- [ ] **Set up CloudWatch alarms** (if needed)
- [ ] **Enable S3 logging** (for access logs)
- [ ] **Enable CloudFront logging** (for CDN analytics)
- [ ] **Set up cost alerts** in AWS Billing

### Security Review (Optional)

- [ ] Review S3 bucket permissions
- [ ] Consider enabling S3 bucket versioning
- [ ] Review CloudFront security headers
- [ ] Consider adding WAF rules (for advanced protection)

## Update Workflow

When making code changes:

### Quick Updates (Code Only)

```bash
npm run deploy:update
```

- [ ] Code changes committed
- [ ] Local build tested
- [ ] Update script executed
- [ ] CloudFront cache invalidated
- [ ] Changes verified in browser

### Full Redeployment (Infrastructure Changes)

```bash
npm run deploy
```

Use when:
- [ ] CloudFormation template changed
- [ ] Infrastructure configuration changed
- [ ] First deployment failed and needs retry

## Troubleshooting Checklist

### Build Fails

- [ ] Check Node.js version (16+)
- [ ] Delete `node_modules` and reinstall
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- [ ] Check for TypeScript/ESLint errors
- [ ] Review build logs for specific errors

### CloudFormation Fails

- [ ] Check AWS CloudFormation console for error details
- [ ] Verify IAM permissions
- [ ] Check if stack already exists
- [ ] Review CloudFormation events:
  ```bash
  aws cloudformation describe-stack-events \
    --stack-name secret-santa-app-infrastructure \
    --max-items 20
  ```
- [ ] Delete failed stack and retry:
  ```bash
  aws cloudformation delete-stack \
    --stack-name secret-santa-app-infrastructure
  ```

### Files Not Uploading

- [ ] Verify S3 bucket exists
- [ ] Check AWS credentials have S3 permissions
- [ ] Check dist/ directory exists and has files
- [ ] Review upload logs for errors

### Application Returns 403/404

- [ ] Wait 15-20 minutes for CloudFront to fully deploy
- [ ] Check S3 bucket policy allows public read
- [ ] Verify files uploaded to S3:
  ```bash
  aws s3 ls s3://secret-santa-app-<account-id>/ --recursive
  ```
- [ ] Check CloudFront origin configuration

### SPA Routing Doesn't Work

- [ ] Verify CloudFormation template has CustomOriginConfig only
- [ ] Check custom error responses are configured
- [ ] Test directly with CloudFront URL (not S3 URL)
- [ ] Clear browser cache and try again

### Changes Not Appearing

- [ ] Wait for CloudFront invalidation (5-10 minutes)
- [ ] Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Clear browser cache completely
- [ ] Try incognito/private browsing
- [ ] Check invalidation status:
  ```bash
  aws cloudfront list-invalidations \
    --distribution-id <distribution-id>
  ```

## Teardown Checklist

When ready to remove the deployment:

```bash
npm run deploy:teardown
```

- [ ] **Backup any important data** (if needed)
- [ ] **Confirm you want to delete** (type 'yes' when prompted)
- [ ] **Wait for completion** (15-30 minutes)
- [ ] **Verify deletion:**
  ```bash
  # Stack should not exist:
  aws cloudformation describe-stacks \
    --stack-name secret-santa-app-infrastructure
  # Should return error: "Stack with id ... does not exist"
  ```
- [ ] **Check AWS Console** to confirm resources deleted
  - [ ] S3 bucket removed
  - [ ] CloudFront distribution deleted
  - [ ] CloudFormation stack deleted

## Support Resources

### Documentation
- [Complete Deployment Guide](DEPLOYMENT_GUIDE.md)
- [CloudFront Fix Details](CLOUDFRONT_FIX.md)
- [Architecture Overview](ARCHITECTURE.md)

### AWS Resources
- [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation)
- [AWS S3 Console](https://console.aws.amazon.com/s3)
- [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront)

### Useful Commands

```bash
# Get all stack outputs
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].Outputs"

# Check CloudFront distribution status
aws cloudfront get-distribution \
  --id <distribution-id> \
  --query "Distribution.Status"

# List S3 bucket contents
aws s3 ls s3://secret-santa-app-<account-id>/ --recursive --human-readable

# Get CloudFront invalidation status
aws cloudfront get-invalidation \
  --distribution-id <distribution-id> \
  --id <invalidation-id>
```

---

## Quick Reference

| Command | Purpose | Duration |
|---------|---------|----------|
| `npm run deploy` | Full deployment | 15-30 min |
| `npm run deploy:update` | Update code only | 5-10 min |
| `npm run deploy:test` | Test deployment | 1-2 min |
| `npm run deploy:teardown` | Remove all resources | 15-30 min |

---

**Last Updated**: 2025-12-16  
**Status**: Ready for production deployment
