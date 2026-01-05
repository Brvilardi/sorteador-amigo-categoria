# AWS Deployment Overview

## 📋 What Was Created

This deployment setup provides a complete, production-ready infrastructure for hosting the Secret Santa React application on AWS with the following components:

### 1. Deployment Scripts

#### `deploy.sh` - Full Deployment Script
- **Purpose**: Initial deployment of the application to AWS
- **What it does**:
  - ✅ Validates AWS CLI and Node.js prerequisites
  - ✅ Installs dependencies and builds the React application
  - ✅ Creates AWS infrastructure using CloudFormation
  - ✅ Uploads built files to S3 bucket
  - ✅ Creates CloudFront distribution for CDN
  - ✅ Invalidates cache for immediate updates
  - ✅ Outputs the application URL
- **Usage**: `./deployment/deploy.sh` or `npm run deploy`

#### `update.sh` - Quick Update Script
- **Purpose**: Fast updates to existing deployment
- **What it does**:
  - ✅ Builds latest version of the application
  - ✅ Uploads only changed files to S3
  - ✅ Invalidates CloudFront cache
  - ✅ Much faster than full deployment
- **Usage**: `./deployment/update.sh` or `npm run deploy:update`

#### `teardown.sh` - Cleanup Script
- **Purpose**: Removes all AWS resources
- **What it does**:
  - ⚠️ Empties S3 bucket
  - ⚠️ Deletes CloudFormation stack
  - ⚠️ Removes CloudFront distribution
  - ⚠️ Cleans up all resources
- **Usage**: `./deployment/teardown.sh` or `npm run deploy:teardown`

### 2. Infrastructure Configuration

#### `cloudformation-template.yaml` - Infrastructure as Code
Defines all AWS resources needed for the application:

**S3 Bucket Resources**:
- Static website hosting enabled
- Public read access for website content
- CORS configuration for API calls
- Proper security policies

**CloudFront Distribution**:
- Global CDN with edge locations worldwide
- HTTPS enforced (redirect HTTP to HTTPS)
- Gzip compression enabled
- Custom error responses for React Router support
- Optimized caching policies
- HTTP/2 support

**Outputs**:
- Bucket name
- Bucket website URL
- CloudFront distribution ID
- CloudFront URL (your application endpoint)

### 3. Documentation

#### `README.md` - Complete Guide
- Detailed prerequisites and setup instructions
- Step-by-step deployment guide
- Troubleshooting section
- Cost estimation
- Security best practices
- Custom domain setup instructions

#### `QUICK_START.md` - Fast Reference
- 5-minute deployment guide
- Common commands
- Quick troubleshooting

#### `DEPLOYMENT_OVERVIEW.md` - This File
- Architecture overview
- Component descriptions
- Configuration details

### 4. Configuration Files

#### `.env.example`
- Template for environment variables
- AWS region configuration
- AWS profile settings
- Project name customization

#### `package.json` (Updated)
Added deployment scripts:
```json
"deploy": "bash deployment/deploy.sh",
"deploy:update": "bash deployment/update.sh",
"deploy:teardown": "bash deployment/teardown.sh"
```

## 🏗️ Architecture

```
┌─────────────┐
│   Users     │
│ (Worldwide) │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌──────────────────┐
│   CloudFront     │ ◄── CDN Edge Locations
│  Distribution    │     (Global Caching)
└────────┬─────────┘
         │
         │ Origin Fetch
         ▼
┌──────────────────┐
│   S3 Bucket      │
│ (Static Website) │
│                  │
│ - index.html     │
│ - assets/        │
│ - *.js, *.css    │
└──────────────────┘
```

### Request Flow

1. **User Access**: User visits CloudFront URL (https://xxxxx.cloudfront.net)
2. **Edge Cache Check**: CloudFront checks nearest edge location for cached content
3. **Cache Hit**: If cached, content served immediately (fast!)
4. **Cache Miss**: If not cached, CloudFront fetches from S3
5. **Caching**: CloudFront caches the content at edge location
6. **Response**: Content delivered to user with HTTPS

### Why This Architecture?

✅ **Fast**: Content served from edge locations close to users
✅ **Secure**: HTTPS enforced, no exposed AWS credentials
✅ **Scalable**: Handles traffic spikes automatically
✅ **Reliable**: High availability and redundancy
✅ **Cost-effective**: Pay only for what you use
✅ **Global**: Fast delivery worldwide

## 🔐 Security Features

### S3 Bucket
- Public read access limited to website content only
- No write access from internet
- CORS configured to prevent unauthorized API calls
- Versioning can be enabled for backup

### CloudFront
- HTTPS enforced (TLS 1.2+)
- Default CloudFront certificate (free)
- Can use custom SSL certificate
- DDoS protection via AWS Shield
- Geographic restrictions available

### Application
- No AWS credentials in code
- Environment-based configuration
- HashRouter (no server-side routing needed)
- Client-side only (no server vulnerabilities)

## 💰 Cost Breakdown

### Free Tier (First 12 months)
- **CloudFront**: 50 GB data transfer + 2M HTTPS requests/month
- **S3**: 5 GB storage + 20,000 GET requests/month
- **CloudFormation**: Always free

### After Free Tier (Typical Usage)
For ~10,000 visitors/month:

| Service | Usage | Cost/Month |
|---------|-------|------------|
| S3 Storage | ~100 MB | $0.002 |
| S3 Requests | ~50,000 GET | $0.02 |
| CloudFront Data | ~5 GB | $0.43 |
| CloudFront Requests | ~50,000 | $0.04 |
| **TOTAL** | | **~$0.50** |

### High Traffic (100,000 visitors/month)
| Service | Cost/Month |
|---------|------------|
| S3 | $0.20 |
| CloudFront | $4.30 |
| **TOTAL** | **~$4.50** |

**Note**: Costs scale linearly with traffic. No minimum charges.

## 🚀 Deployment Process

### Initial Deployment
```bash
npm run deploy
```

**Timeline**: 5-10 minutes
1. Build React app (1-2 min)
2. Create CloudFormation stack (30 sec)
3. Create S3 bucket (30 sec)
4. Upload files to S3 (30 sec)
5. Create CloudFront distribution (3-5 min)
6. Cache invalidation (5-10 min to propagate)

### Updates
```bash
npm run deploy:update
```

**Timeline**: 2-3 minutes
1. Build React app (1-2 min)
2. Sync files to S3 (30 sec)
3. Invalidate CloudFront (5-10 min to propagate)

## 🔧 Configuration Options

### Environment Variables
Set these before deployment:

```bash
# AWS Region (default: us-east-1)
export AWS_REGION=us-west-2

# AWS Profile (for multiple accounts)
export AWS_PROFILE=my-profile

# Custom project name
# Edit deployment/deploy.sh: PROJECT_NAME="my-custom-name"
```

### CloudFormation Parameters
Edit `cloudformation-template.yaml` to customize:

- **Bucket naming**: Line 15-16
- **Cache TTL**: Lines 88-90
- **Price class**: Line 51 (geographical distribution)
- **CORS rules**: Lines 24-31

### Caching Strategy
Current configuration:

| File Type | Cache Duration | Reasoning |
|-----------|----------------|-----------|
| HTML files | 0 seconds | Always fresh content |
| JS/CSS/Assets | 1 year | Vite uses hashed filenames |

To modify caching:
- Edit `deploy.sh` lines 138-151
- Edit `cloudformation-template.yaml` lines 88-90

## 🔄 React Router Compatibility

The application uses **HashRouter**, which is ideal for S3 hosting because:

✅ All routing handled client-side
✅ No server-side configuration needed
✅ Works perfectly with S3 static hosting
✅ No 404 errors on direct URL access

**Note**: The CloudFormation template includes error page redirects (403/404 → index.html) as a safety measure, though HashRouter doesn't require them.

## 📊 Monitoring and Logs

### CloudWatch Metrics
Automatically available:
- CloudFront requests and data transfer
- Error rates (4xx, 5xx)
- Cache hit ratio
- Geographic distribution

### Access Logs
To enable:
1. Create S3 bucket for logs
2. Update CloudFormation template with logging config
3. Analyze with AWS Athena or CloudWatch Insights

### Cost Monitoring
- AWS Cost Explorer: Track daily costs
- Billing Alerts: Set budget alerts
- CloudWatch Billing Metrics: Real-time monitoring

## 🎯 Best Practices

### Performance
✅ Use CloudFront for all traffic (never direct S3)
✅ Enable compression in CloudFront
✅ Optimize images before deployment
✅ Use proper cache headers
✅ Minimize bundle sizes

### Security
✅ Always use HTTPS (never HTTP)
✅ Keep AWS credentials secure
✅ Use IAM roles with least privilege
✅ Enable CloudTrail for audit logs
✅ Review S3 bucket policies regularly

### Cost Optimization
✅ Delete old CloudFront invalidations
✅ Use proper cache headers to reduce origin requests
✅ Monitor usage with CloudWatch
✅ Consider Reserved Capacity for high traffic
✅ Use S3 Lifecycle policies for old versions

### Operations
✅ Tag all resources for tracking
✅ Use CloudFormation for all changes
✅ Test updates in staging environment first
✅ Keep deployment scripts in version control
✅ Document any custom configurations

## 🆘 Common Issues

### Issue: Build fails
**Solution**: Check Node.js version, run `npm install`

### Issue: AWS CLI not configured
**Solution**: Run `aws configure` with credentials

### Issue: Permission denied
**Solution**: Check IAM permissions for S3, CloudFront, CloudFormation

### Issue: CloudFront shows old content
**Solution**: Wait 5-10 minutes or create cache invalidation

### Issue: Stack already exists
**Solution**: Run `npm run deploy:update` instead

### Issue: Can't delete stack
**Solution**: Empty S3 bucket first, then retry

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## 🎉 Success Indicators

Your deployment is successful when:

✅ `npm run deploy` completes without errors
✅ CloudFormation stack status is `CREATE_COMPLETE`
✅ CloudFront distribution status is `Deployed`
✅ Application URL returns 200 status
✅ All application routes work correctly
✅ HTTPS is enforced
✅ Assets load from CloudFront
✅ No console errors in browser

---

**Ready to deploy?** Start with the [QUICK_START.md](QUICK_START.md) guide!
