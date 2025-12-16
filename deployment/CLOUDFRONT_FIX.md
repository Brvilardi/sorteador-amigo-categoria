# CloudFront Origin Configuration Fix

## Problem Description

The CloudFormation template had an error in the CloudFront Origin configuration that prevented successful deployment. The error was:

```
Invalid request provided: AWS CloudFront distribution origin requires exactly one of: 
CustomOriginConfig or S3OriginConfig
```

## Root Cause

In the original `cloudformation-template.yaml`, lines 74-84 defined **both** `S3OriginConfig` and `CustomOriginConfig` for the same origin:

```yaml
Origins:
  - Id: S3Origin
    DomainName: !GetAtt WebsiteBucket.RegionalDomainName
    S3OriginConfig:                          # ❌ First config
      OriginAccessIdentity: ''
    # Use website endpoint for proper error handling
    CustomOriginConfig:                      # ❌ Second config - CONFLICT!
      HTTPPort: 80
      HTTPSPort: 443
      OriginProtocolPolicy: http-only
    DomainName: !Select [2, !Split ['/', !GetAtt WebsiteBucket.WebsiteURL]]
```

CloudFront requires **exactly one** origin configuration type, not both.

## Solution Implemented

### 1. Removed S3OriginConfig

Since we're using the S3 **website endpoint** (not the REST API endpoint) to enable proper SPA routing and error page handling, we use **CustomOriginConfig only**:

```yaml
# Origins - Using S3 website endpoint for proper SPA routing
Origins:
  - Id: S3Origin
    DomainName: !Select [2, !Split ['/', !GetAtt WebsiteBucket.WebsiteURL]]
    CustomOriginConfig:                      # ✅ Only one config
      HTTPPort: 80
      HTTPSPort: 443
      OriginProtocolPolicy: http-only
```

### 2. Removed Unused OAI Resource

The Origin Access Identity (OAI) resource was removed since it's not used with the website endpoint configuration:

```yaml
# Removed this resource (lines 53-58):
# CloudFrontOAI:
#   Type: AWS::CloudFront::CloudFrontOriginAccessIdentity
#   Properties:
#     CloudFrontOriginAccessIdentityConfig:
#       Comment: !Sub 'OAI for ${ProjectName}'
```

### 3. Simplified Bucket Policy

The bucket policy remains public (required for website endpoint access) but with clearer documentation:

```yaml
# S3 Bucket Policy for public read access (required for website endpoint)
WebsiteBucketPolicy:
  Type: AWS::S3::BucketPolicy
  Properties:
    Bucket: !Ref WebsiteBucket
    PolicyDocument:
      Statement:
        - Sid: PublicReadGetObject
          Effect: Allow
          Principal: '*'
          Action: 's3:GetObject'
          Resource: !Sub '${WebsiteBucket.Arn}/*'
```

## Why CustomOriginConfig?

We chose `CustomOriginConfig` over `S3OriginConfig` because:

1. **S3 Website Endpoint Support**: CustomOriginConfig allows us to use the S3 website endpoint, which:
   - Handles error documents (404 → index.html) at the S3 level
   - Supports index document routing
   - Provides better SPA (Single Page Application) support

2. **React Router Compatibility**: React Router requires that all routes return the index.html file:
   - Direct URL access: `https://domain.com/admin/results` works
   - Browser refresh: Works on any route
   - Error pages: 403/404 are mapped to 200 + index.html

3. **Simplified Configuration**: No need for Origin Access Identity with website endpoints

## Testing the Fix

The deployment now includes comprehensive testing:

```bash
# Run automated tests
npm run deploy:test
```

Tests verify:
- ✅ CloudFormation stack deploys successfully
- ✅ S3 bucket is created and populated
- ✅ CloudFront distribution is enabled
- ✅ Application responds with HTTP 200
- ✅ SPA routing works (404 → index.html)

## Alternative Approach: S3OriginConfig with OAI

If you wanted to use `S3OriginConfig` instead (more secure but requires different setup):

```yaml
# Alternative approach (NOT used in this project):
Origins:
  - Id: S3Origin
    DomainName: !GetAtt WebsiteBucket.RegionalDomainName
    S3OriginConfig:
      OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${CloudFrontOAI}'

# Requires:
# 1. CloudFront OAI resource
# 2. S3 bucket policy allowing OAI (not public)
# 3. Lambda@Edge or CloudFront Functions for index.html routing
```

**Why we didn't use this:**
- More complex setup
- Requires Lambda@Edge or CloudFront Functions for SPA routing
- Additional costs for Lambda@Edge
- The website endpoint approach is simpler and sufficient for this use case

## Changes Summary

### Files Modified:
- `deployment/cloudformation-template.yaml` - Fixed Origin configuration

### Files Added:
- `deployment/test-deployment.sh` - Comprehensive deployment testing
- `deployment/DEPLOYMENT_GUIDE.md` - Complete deployment documentation
- `deployment/CLOUDFRONT_FIX.md` - This file

### Files Updated:
- `package.json` - Added `deploy:test` script
- `README.md` - Updated deployment documentation references

## Verification Steps

After deploying with the fixed template:

1. **CloudFormation Stack**: Should complete successfully
   ```bash
   aws cloudformation describe-stacks --stack-name secret-santa-app-infrastructure
   ```

2. **CloudFront Origin**: Check distribution configuration
   ```bash
   aws cloudfront get-distribution --id <distribution-id>
   # Should show CustomOriginConfig only, no S3OriginConfig
   ```

3. **SPA Routing**: Test direct route access
   ```bash
   curl -I https://<cloudfront-url>/admin/results
   # Should return 200 OK
   ```

4. **Application**: Full functional test
   - Open application in browser
   - Navigate to different routes
   - Refresh browser on non-root routes
   - All should work correctly

## Additional Resources

- [AWS CloudFront Origin Settings](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-origin.html)
- [S3 Website Endpoints vs REST Endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)
- [React Router with CloudFront](https://create-react-app.dev/docs/deployment/#s3-and-cloudfront)

---

**Status**: ✅ Fixed and Tested
**Date**: 2025-12-16
**Impact**: CloudFormation stack now deploys successfully with proper CloudFront configuration
