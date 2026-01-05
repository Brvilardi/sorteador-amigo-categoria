# 🎯 START HERE - AWS Deployment

Welcome! This is your starting point for deploying the Secret Santa application to AWS.

## 🚀 Quick Deploy (3 Steps)

### 1️⃣ Install AWS CLI and Configure
```bash
# Install AWS CLI (choose your OS)
# macOS: brew install awscli
# Linux: curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && sudo ./aws/install
# Windows: Download from https://aws.amazon.com/cli/

# Configure with your credentials
aws configure
```

### 2️⃣ Deploy Application
```bash
npm run deploy
```

### 3️⃣ Get Your URL
The deployment will output your application URL:
```
Application URL: https://d1234567890.cloudfront.net
```

**That's it!** Share this URL with your users. 🎉

---

## 📖 Need More Help?

### Choose Your Path:

**🆕 First Time Deploying?**
→ Read [GET_STARTED.md](GET_STARTED.md) for detailed first-time setup

**⚡ Want Quick Commands?**
→ Check [QUICK_START.md](QUICK_START.md) for a fast reference

**📚 Need Full Details?**
→ See [README.md](README.md) for complete documentation

**🏗️ Want Technical Info?**
→ Review [DEPLOYMENT_OVERVIEW.md](DEPLOYMENT_OVERVIEW.md) for architecture

**👀 Prefer Visual Diagrams?**
→ View [ARCHITECTURE.md](ARCHITECTURE.md) for flow charts

**✅ Following a Checklist?**
→ Use [CHECKLIST.md](CHECKLIST.md) for step-by-step process

**❓ What Do These Files Do?**
→ See [FILES.md](FILES.md) for file reference

---

## 🎮 Common Commands

```bash
# Deploy for first time
npm run deploy

# Update after code changes
npm run deploy:update

# Remove everything
npm run deploy:teardown
```

---

## 💰 Cost

- **First year**: FREE (with AWS Free Tier)
- **After**: ~$1-5/month for typical usage

---

## 🆘 Problems?

### AWS CLI not found?
```bash
# Check if installed
aws --version

# If not, see step 1 above
```

### Permission errors?
```bash
# Make sure AWS is configured
aws sts get-caller-identity

# If error, run: aws configure
```

### Build errors?
```bash
# Install dependencies
npm install

# Try building
npm run build
```

### Can't see your changes?
```bash
# Update deployment
npm run deploy:update

# Wait 5-10 minutes for cache
```

---

## ✅ What You Get

✅ **Global CDN** - Fast worldwide delivery
✅ **HTTPS** - Secure by default
✅ **Scalable** - Handles traffic automatically
✅ **Reliable** - 99.99% uptime
✅ **Affordable** - ~$1-5/month

---

## 🎯 Next Steps

1. **Deploy** - Run `npm run deploy`
2. **Test** - Visit your CloudFront URL
3. **Share** - Send URL to users
4. **Monitor** - Check AWS Console (optional)

---

## 📞 Need Help?

1. Start with [GET_STARTED.md](GET_STARTED.md)
2. Check [QUICK_START.md](QUICK_START.md) troubleshooting
3. Review error messages in terminal
4. Check AWS Console for details

---

**Ready to deploy? Run this:**

```bash
npm run deploy
```

**Good luck! 🚀**
