# AWS Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] AWS Account created and active
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS CLI configured (`aws sts get-caller-identity`)
- [ ] Node.js installed (v14+) (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git repository cloned locally

### ✅ AWS Permissions
Verify your AWS user/role has these permissions:
- [ ] S3: CreateBucket, PutObject, PutBucketPolicy, PutBucketWebsite
- [ ] CloudFront: CreateDistribution, CreateInvalidation
- [ ] CloudFormation: CreateStack, DescribeStacks, DeleteStack
- [ ] IAM: CreateCloudFrontOriginAccessIdentity

**Quick Test**:
```bash
aws s3 ls  # Should list buckets without error
aws cloudfront list-distributions  # Should return (possibly empty) list
```

### ✅ Project Setup
- [ ] Dependencies installed (`npm install`)
- [ ] Build works locally (`npm run build`)
- [ ] Application tested locally (`npm run dev`)
- [ ] All features working as expected

### ✅ Configuration Review
- [ ] Reviewed `deployment/cloudformation-template.yaml`
- [ ] Confirmed AWS region in scripts (default: us-east-1)
- [ ] Understood cost implications (~$1-5/month)
- [ ] Noted stack name: `secret-santa-app-infrastructure`

## Deployment Checklist

### ✅ Initial Deployment
- [ ] Navigate to project root directory
- [ ] Run deployment command: `npm run deploy`
- [ ] Wait for completion (5-10 minutes)
- [ ] Note the CloudFront URL from output
- [ ] Save the URL for distribution

### ✅ Verification
- [ ] Visit CloudFront URL in browser
- [ ] Verify HTTPS is enforced
- [ ] Test all application routes
- [ ] Check admin interface loads
- [ ] Test participant view
- [ ] Verify no console errors
- [ ] Test on mobile device
- [ ] Confirm fast loading times

### ✅ AWS Console Verification
- [ ] CloudFormation stack status: CREATE_COMPLETE
- [ ] S3 bucket created with files
- [ ] CloudFront distribution status: Deployed
- [ ] No errors in CloudFormation events

## Post-Deployment Checklist

### ✅ Documentation
- [ ] Document CloudFront URL
- [ ] Save AWS region used
- [ ] Note CloudFormation stack name
- [ ] Save S3 bucket name
- [ ] Document CloudFront distribution ID

### ✅ Cost Monitoring
- [ ] Set up AWS billing alerts
- [ ] Enable Cost Explorer
- [ ] Set monthly budget ($10 recommended)
- [ ] Review pricing dashboard

### ✅ Security
- [ ] Verify HTTPS is working
- [ ] Confirm S3 bucket is not fully public
- [ ] Check CloudFront security settings
- [ ] Review IAM permissions
- [ ] Enable CloudTrail (optional)

### ✅ Backup & Recovery
- [ ] Keep deployment scripts in version control
- [ ] Document custom configurations
- [ ] Note any manual changes made
- [ ] Backup CloudFormation template

## Update Checklist

### ✅ Before Updating
- [ ] Make code changes locally
- [ ] Test changes locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] Commit changes to git
- [ ] Reviewed changes are non-breaking

### ✅ Deployment Update
- [ ] Run update command: `npm run deploy:update`
- [ ] Wait for completion (2-3 minutes)
- [ ] Wait for cache invalidation (5-10 minutes)
- [ ] Verify changes in browser
- [ ] Test all affected routes
- [ ] Clear browser cache if needed
- [ ] Test on multiple devices

## Troubleshooting Checklist

### ✅ If Build Fails
- [ ] Check Node.js version (v14+)
- [ ] Delete `node_modules` and reinstall
- [ ] Delete `dist` folder
- [ ] Run `npm install` again
- [ ] Run `npm run build` again
- [ ] Check for console errors

### ✅ If AWS Deployment Fails
- [ ] Verify AWS CLI configured (`aws sts get-caller-identity`)
- [ ] Check IAM permissions
- [ ] Review error message in terminal
- [ ] Check CloudFormation events in AWS Console
- [ ] Verify region is correct
- [ ] Check for stack name conflicts

### ✅ If CloudFront Not Working
- [ ] Wait 5-10 minutes (distribution deployment)
- [ ] Check distribution status in AWS Console
- [ ] Verify S3 bucket has files
- [ ] Check S3 bucket policy
- [ ] Try cache invalidation
- [ ] Check browser console for errors

### ✅ If Updates Not Showing
- [ ] Wait 5-10 minutes for cache invalidation
- [ ] Clear browser cache (Ctrl+F5)
- [ ] Try incognito/private window
- [ ] Verify build created new files
- [ ] Check S3 bucket has updated files
- [ ] Create manual CloudFront invalidation

## Teardown Checklist

### ⚠️ Before Removing Deployment
- [ ] Confirmed you want to delete everything
- [ ] Backed up any important data
- [ ] Noted any custom configurations
- [ ] Saved CloudFormation template
- [ ] Documented lessons learned

### ✅ Removal Process
- [ ] Run teardown command: `npm run deploy:teardown`
- [ ] Type 'yes' to confirm deletion
- [ ] Wait for completion (5-10 minutes)
- [ ] Verify in AWS Console:
  - [ ] S3 bucket deleted
  - [ ] CloudFront distribution deleted
  - [ ] CloudFormation stack deleted
- [ ] Check no resources left behind

### ✅ Cost Verification
- [ ] Wait 24 hours
- [ ] Check AWS billing dashboard
- [ ] Verify no ongoing charges
- [ ] Review final costs

## Emergency Checklist

### 🚨 If Something Goes Wrong
1. **Don't Panic**: Most issues are fixable
2. **Stop Current Process**: Ctrl+C to cancel running script
3. **Check AWS Console**: Review CloudFormation events
4. **Collect Information**:
   - Error message from terminal
   - CloudFormation stack status
   - CloudFormation events
   - AWS region used
   - Stack name used
5. **Try Safe Recovery**:
   - Run `npm run deploy:teardown` if partially deployed
   - Delete CloudFormation stack manually in console
   - Empty S3 bucket manually if needed
   - Retry deployment from scratch

### 📞 Getting Help
If you need assistance:
- [ ] Checked [deployment/README.md](README.md) troubleshooting section
- [ ] Reviewed error messages carefully
- [ ] Searched AWS documentation
- [ ] Checked AWS service status page
- [ ] Verified AWS CLI and permissions
- [ ] Documented your steps and errors

## Success Criteria

Your deployment is successful when ALL these are true:

✅ **Build**
- `npm run build` completes without errors
- `dist/` folder created with files

✅ **Infrastructure**
- CloudFormation stack: CREATE_COMPLETE
- S3 bucket created and contains files
- CloudFront distribution: Deployed

✅ **Application**
- CloudFront URL returns HTTP 200
- HTTPS is enforced
- All routes work correctly
- No console errors
- Fast loading times

✅ **Functionality**
- Admin interface loads
- Can add participants
- Can add categories
- Can execute draw
- Participant links work
- All features functional

✅ **Documentation**
- CloudFront URL documented
- Deployment notes saved
- Team informed of new URL

---

## Quick Reference Commands

```bash
# Check prerequisites
aws --version
node --version
aws sts get-caller-identity

# Deploy
npm run deploy

# Update
npm run deploy:update

# Remove
npm run deploy:teardown

# Manual checks
aws cloudformation describe-stacks --stack-name secret-santa-app-infrastructure
aws s3 ls
aws cloudfront list-distributions
```

---

**Print this checklist and check off items as you go!** ✓
