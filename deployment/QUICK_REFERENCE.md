# Quick Reference - AWS Deployment

## 🚀 Quick Start (3 Commands)

```bash
# 1. Deploy
npm run deploy

# 2. Test (wait 5-10 minutes first)
npm run deploy:test

# 3. Access
https://YOUR-CLOUDFRONT-URL.cloudfront.net
```

---

## 📝 Common Commands

### Deployment
```bash
npm run deploy              # Initial deployment (15-30 min)
npm run deploy:update       # Update code only (5-10 min)
npm run deploy:test         # Verify deployment (1-2 min)
npm run deploy:teardown     # Delete everything (15-30 min)
```

### AWS CLI Shortcuts
```bash
# Get CloudFront URL
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionDomain'].OutputValue" \
  --output text

# Get bucket name
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
  --output text

# Get all outputs
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].Outputs"

# Check stack status
aws cloudformation describe-stacks \
  --stack-name secret-santa-app-infrastructure \
  --query "Stacks[0].StackStatus" \
  --output text
```

---

## 🔧 Configuration

### Default Values
- **Stack Name**: `secret-santa-app-infrastructure`
- **Project Name**: `secret-santa-app`
- **Region**: `us-east-1`
- **Bucket Name**: `secret-santa-app-<account-id>`

### Customize (edit `deployment/deploy.sh`)
```bash
PROJECT_NAME="your-name"
REGION="your-region"
```

---

## ✅ Success Indicators

### Deployment Success
```
[INFO] Deployment completed successfully!
[INFO] Application URL: https://dXXXXXXXXXXXXX.cloudfront.net
```

### Test Success
```
Passed: 8
Failed: 0
[INFO] All tests passed! ✓
```

---

## ⚠️ Common Issues

### Issue: "AWS CLI not configured"
```bash
aws configure
# Enter: Access Key, Secret Key, Region, Output format
```

### Issue: "Stack already exists"
```bash
# Delete and retry
aws cloudformation delete-stack --stack-name secret-santa-app-infrastructure
```

### Issue: "403 Forbidden"
**Solution**: Wait 15-20 minutes for CloudFront to fully deploy

### Issue: "Changes not appearing"
```bash
# Hard refresh or clear cache
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Issue: "SPA routing broken"
**Fixed!** The template now uses CustomOriginConfig only (no S3OriginConfig)

---

## 📊 Resource URLs

After deployment, access these AWS Console pages:

- **CloudFormation**: https://console.aws.amazon.com/cloudformation
- **S3 Bucket**: https://console.aws.amazon.com/s3
- **CloudFront**: https://console.aws.amazon.com/cloudfront
- **Cost Explorer**: https://console.aws.amazon.com/cost-management

---

## 💰 Cost Estimate

| Item | Free Tier | After Free Tier |
|------|-----------|-----------------|
| S3 Storage (10 MB) | ✅ Free | $0.01/month |
| S3 Requests | ✅ Free | $0.01/month |
| CloudFront (1 GB) | ✅ Free | $0.09/month |
| **Total** | **$0.00** | **~$0.11/month** |

---

## 🔒 Security Checklist

- [x] HTTPS enabled (automatic)
- [x] HTTP → HTTPS redirect
- [x] Public bucket policy (required for website)
- [x] CloudFormation managed infrastructure
- [x] No hardcoded credentials

---

## 📚 Documentation

- **Complete Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Fix Details**: [CLOUDFRONT_FIX.md](CLOUDFRONT_FIX.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🆘 Support

1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) troubleshooting section
2. Review CloudFormation stack events
3. Check CloudWatch logs
4. Open GitHub issue with error details

---

**Status**: ✅ Fixed and Ready  
**Last Updated**: 2025-12-16
