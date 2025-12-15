# Quick Start - AWS Deployment

## 🚀 5-Minute Deployment

### Step 1: Prerequisites (One-time setup)

```bash
# Install AWS CLI
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

### Step 2: Deploy Application

```bash
# From project root directory
npm run deploy
```

That's it! ✨

The script will output your application URL like:
```
Application URL: https://d1234567890.cloudfront.net
```

---

## 📝 Common Commands

```bash
# Initial deployment
npm run deploy

# Update existing deployment
npm run deploy:update

# Remove all AWS resources
npm run deploy:teardown
```

---

## 💰 Estimated Costs

- **First year**: ~$0-2/month (AWS Free Tier)
- **After free tier**: ~$1-5/month for typical usage
- **High traffic**: Scales with usage

---

## 🔧 Troubleshooting

### AWS CLI not found
```bash
# Check if installed
aws --version

# If not installed, follow Step 1 above
```

### Permission errors
Ensure your AWS user has these permissions:
- S3 (create buckets, upload files)
- CloudFront (create distributions)
- CloudFormation (manage stacks)

### Build errors
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Can't see updates
CloudFront cache takes 5-10 minutes to update. Wait or run:
```bash
npm run deploy:update
```

---

## 📚 Full Documentation

See [README.md](README.md) for complete documentation including:
- Architecture details
- Cost breakdown
- Custom domain setup
- Security best practices
- Advanced configuration

---

## 🆘 Need Help?

1. Check [deployment/README.md](README.md) for detailed guide
2. Verify AWS CLI: `aws sts get-caller-identity`
3. Check CloudFormation in AWS Console for errors
4. Review logs in the terminal output
