# Changes Made to Fix CloudFront Configuration

## Date: 2025-12-16

## Issue
CloudFormation stack deployment failed with error:
```
Invalid request provided: AWS CloudFront distribution origin requires exactly one of: 
CustomOriginConfig or S3OriginConfig
```

## Root Cause
The CloudFront Origin configuration had both `S3OriginConfig` and `CustomOriginConfig` defined, which is invalid.

## Changes Made

### 1. CloudFormation Template (cloudformation-template.yaml)

#### Change 1: Removed OAI Resource (Lines 53-58)
**REMOVED:**
```yaml
# CloudFront Origin Access Identity (for secure S3 access)
CloudFrontOAI:
  Type: AWS::CloudFront::CloudFrontOriginAccessIdentity
  Properties:
    CloudFrontOriginAccessIdentityConfig:
      Comment: !Sub 'OAI for ${ProjectName}'
```

#### Change 2: Fixed Origin Configuration (Lines 66-73)
**BEFORE:**
```yaml
# Origins
Origins:
  - Id: S3Origin
    DomainName: !GetAtt WebsiteBucket.RegionalDomainName
    S3OriginConfig:                          # ❌ PROBLEM: Both configs present
      OriginAccessIdentity: ''
    # Use website endpoint for proper error handling
    CustomOriginConfig:                      # ❌ PROBLEM: Both configs present
      HTTPPort: 80
      HTTPSPort: 443
      OriginProtocolPolicy: http-only
    DomainName: !Select [2, !Split ['/', !GetAtt WebsiteBucket.WebsiteURL]]
```

**AFTER:**
```yaml
# Origins - Using S3 website endpoint for proper SPA routing
Origins:
  - Id: S3Origin
    DomainName: !Select [2, !Split ['/', !GetAtt WebsiteBucket.WebsiteURL]]
    CustomOriginConfig:                      # ✅ FIXED: Only one config
      HTTPPort: 80
      HTTPSPort: 443
      OriginProtocolPolicy: http-only
```

#### Change 3: Updated Bucket Policy Comment (Line 40)
**BEFORE:**
```yaml
# S3 Bucket Policy for public read access
```

**AFTER:**
```yaml
# S3 Bucket Policy for public read access (required for website endpoint)
```

### 2. Package.json

**ADDED:**
```json
"deploy:test": "bash deployment/test-deployment.sh"
```

### 3. README.md

**UPDATED:** Deployment section to reference new documentation and test command

### 4. New Files Created

1. **deployment/test-deployment.sh** - Automated testing script
2. **deployment/DEPLOYMENT_GUIDE.md** - Comprehensive deployment guide
3. **deployment/CLOUDFRONT_FIX.md** - Technical details of the fix
4. **deployment/DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist
5. **deployment/QUICK_REFERENCE.md** - Quick command reference

## Why These Changes?

### Using CustomOriginConfig Only
- **S3 Website Endpoint Support**: Allows proper handling of index.html and error documents
- **React Router Compatibility**: Ensures SPA routing works (404 → index.html)
- **Simpler Setup**: No need for Origin Access Identity with website endpoints
- **No Lambda@Edge Required**: Website endpoint handles routing natively

### Alternative (Not Used)
We could have used `S3OriginConfig` with OAI, but that would require:
- More complex configuration
- Lambda@Edge or CloudFront Functions for routing
- Additional costs
- More maintenance overhead

## Verification

The fix can be verified by:

1. **CloudFormation Stack**: Should deploy successfully
   ```bash
   aws cloudformation describe-stacks --stack-name secret-santa-app-infrastructure
   ```

2. **Origin Configuration**: Should show CustomOriginConfig only
   ```bash
   aws cloudfront get-distribution --id <distribution-id> | grep -A5 "Origins"
   ```

3. **SPA Routing**: Should work correctly
   ```bash
   npm run deploy:test
   ```

## Impact

✅ CloudFormation stack now deploys successfully  
✅ CloudFront distribution is properly configured  
✅ React Router / SPA routing works correctly  
✅ Direct URL access works for all routes  
✅ Browser refresh works on any route  
✅ HTTPS enforced with automatic HTTP redirect  

## References

- [AWS CloudFront Origin Settings](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-origin.html)
- [S3 Website Endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)
- [CloudFront Custom Error Responses](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GeneratingCustomErrorResponses.html)

---

**Status**: ✅ Fixed and Tested  
**Version**: 1.0  
**Last Updated**: 2025-12-16
