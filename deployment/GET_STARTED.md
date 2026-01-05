# 🚀 Getting Started with AWS Deployment

Welcome! This guide will help you deploy your Secret Santa React application to AWS in just a few steps.

## 📋 What You'll Get

After deployment, you'll have:

✅ **Global CDN**: Fast delivery worldwide via CloudFront
✅ **HTTPS Enabled**: Secure connections by default
✅ **Public URL**: Share-able link like `https://d123456.cloudfront.net`
✅ **Scalable**: Handles traffic spikes automatically
✅ **Low Cost**: ~$1-5/month (or free with AWS Free Tier)

## 🎯 Quick Start (5 Minutes)

### Step 1: Install AWS CLI

**macOS:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Windows:**
Download installer from: https://aws.amazon.com/cli/

### Step 2: Configure AWS

```bash
aws configure
```

You'll be asked for:
- **AWS Access Key ID**: From AWS Console → IAM → Users → Security Credentials
- **AWS Secret Access Key**: From same location
- **Region**: `us-east-1` (recommended)
- **Output format**: `json`

### Step 3: Deploy!

```bash
cd /path/to/sorteador-amigo-categoria
npm run deploy
```

**That's it!** ✨

The script will:
1. ✅ Check prerequisites
2. ✅ Build your application
3. ✅ Create AWS infrastructure
4. ✅ Upload files
5. ✅ Set up CloudFront CDN
6. ✅ Give you the URL

**Time**: 5-10 minutes

## 📖 What to Read Next

### For Quick Deployment
👉 **[QUICK_START.md](QUICK_START.md)** - 5-minute guide with essential commands

### For Complete Understanding
👉 **[README.md](README.md)** - Full guide with troubleshooting, costs, and best practices

### For Architecture Details
👉 **[DEPLOYMENT_OVERVIEW.md](DEPLOYMENT_OVERVIEW.md)** - Technical architecture and configuration

👉 **[ARCHITECTURE.md](ARCHITECTURE.md)** - Visual diagrams and flow charts

### For Step-by-Step Process
👉 **[CHECKLIST.md](CHECKLIST.md)** - Detailed checklist for each phase

## 🎮 Common Commands

```bash
# Initial deployment
npm run deploy

# Update after code changes
npm run deploy:update

# Remove everything from AWS
npm run deploy:teardown

# Check AWS configuration
aws sts get-caller-identity

# View deployment status
aws cloudformation describe-stacks --stack-name secret-santa-app-infrastructure
```

## 💰 Cost Estimate

### Free Tier (First 12 months)
**$0/month** for typical usage
- 50 GB CloudFront data transfer
- 2 million HTTPS requests
- 5 GB S3 storage

### After Free Tier
- **Low traffic**: ~$0.50/month
- **Medium traffic**: ~$2/month
- **High traffic**: ~$5/month

## 🆘 Need Help?

### Common Issues

**"AWS CLI not found"**
→ Install AWS CLI (see Step 1 above)

**"The security token is invalid"**
→ Run `aws configure` again

**"Permission denied"**
→ Check your AWS IAM permissions include S3, CloudFront, and CloudFormation access

**"Build failed"**
→ Run `npm install` first, then retry

**"Can't see my changes"**
→ Wait 5-10 minutes for CloudFront cache, or run `npm run deploy:update`

### Getting Support

1. Check **[README.md](README.md)** troubleshooting section
2. Review error messages in terminal
3. Check AWS Console → CloudFormation for stack events
4. Verify AWS credentials: `aws sts get-caller-identity`

## 📚 Documentation Map

```
deployment/
├── GET_STARTED.md (👈 You are here!)
│   └── Start here for first-time deployment
│
├── QUICK_START.md
│   └── Fast reference for common tasks
│
├── README.md
│   └── Complete guide with all details
│
├── DEPLOYMENT_OVERVIEW.md
│   └── Architecture, costs, and technical deep-dive
│
├── ARCHITECTURE.md
│   └── Visual diagrams and flow charts
│
├── CHECKLIST.md
│   └── Step-by-step verification checklists
│
├── deploy.sh
│   └── Main deployment script
│
├── update.sh
│   └── Quick update script
│
├── teardown.sh
│   └── Cleanup script
│
└── cloudformation-template.yaml
    └── AWS infrastructure definition
```

## ✅ Success Checklist

Your deployment is successful when:

- [ ] `npm run deploy` completed without errors
- [ ] Got a CloudFront URL in the output
- [ ] Can access the URL in browser
- [ ] HTTPS works (no certificate warnings)
- [ ] All app features work correctly
- [ ] Application loads fast

## 🎉 Next Steps After Deployment

1. **Test Your Application**
   - Visit the CloudFront URL
   - Test all features
   - Try on mobile devices

2. **Share the URL**
   - Send to your team
   - Add to documentation
   - Share with users

3. **Set Up Monitoring** (Optional)
   - AWS Console → CloudWatch
   - Set up billing alerts
   - Monitor usage

4. **Custom Domain** (Optional)
   - Register domain
   - Get SSL certificate in AWS ACM
   - Update CloudFormation template
   - See [README.md](README.md) for details

## 🔄 Making Updates

When you make code changes:

```bash
# 1. Make your changes locally
# 2. Test locally
npm run dev

# 3. Deploy updates
npm run deploy:update

# 4. Wait 5-10 minutes for CloudFront cache
# 5. Verify changes online
```

## 🎓 Learning Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [React Deployment Best Practices](https://react.dev/learn/start-a-new-react-project#deploying-to-production)

## 💡 Pro Tips

1. **Save Your CloudFront URL** - You'll need it to share with users
2. **Set Billing Alerts** - Stay within budget
3. **Test Before Deploying** - Run `npm run dev` locally first
4. **Use Update Script** - Faster than full deployment
5. **Wait for Cache** - CloudFront takes 5-10 minutes to update
6. **Keep Scripts Updated** - Commit deployment configs to git

---

## Ready to Deploy?

1. ✅ AWS CLI installed and configured
2. ✅ In project directory
3. ✅ Ready to go!

```bash
npm run deploy
```

**Good luck! 🚀**

---

Need more details? Check out [QUICK_START.md](QUICK_START.md) or [README.md](README.md)
