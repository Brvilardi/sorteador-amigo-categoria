# Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        End Users (Global)                        │
│                   Desktop | Mobile | Tablet                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS Request
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWS CloudFront (CDN)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Edge Locations Worldwide (200+ locations)               │  │
│  │  - North America: 50+ locations                          │  │
│  │  - Europe: 40+ locations                                 │  │
│  │  - Asia Pacific: 40+ locations                           │  │
│  │  - South America: 10+ locations                          │  │
│  │  - Middle East & Africa: 10+ locations                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Features:                                                        │
│  ✓ HTTPS Enforcement (TLS 1.2+)                                 │
│  ✓ Gzip Compression                                             │
│  ✓ HTTP/2 Support                                               │
│  ✓ Cache Control                                                │
│  ✓ DDoS Protection (AWS Shield)                                 │
│  ✓ Custom Error Pages                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Cache Miss / Origin Fetch
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              AWS S3 Bucket (Origin Server)                       │
│                                                                   │
│  Bucket Name: secret-santa-app-{account-id}                     │
│  Region: us-east-1 (configurable)                               │
│                                                                   │
│  Structure:                                                       │
│  ├── index.html          (Entry point)                          │
│  ├── assets/                                                     │
│  │   ├── index-[hash].js    (Main bundle)                      │
│  │   ├── index-[hash].css   (Styles)                           │
│  │   └── vite.svg           (Favicon)                          │
│  └── vite.svg                                                    │
│                                                                   │
│  Configuration:                                                   │
│  ✓ Static Website Hosting Enabled                               │
│  ✓ Public Read Access (via Bucket Policy)                       │
│  ✓ CORS Configured                                              │
│  ✓ Versioning: Optional                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Flow

```
┌──────────────────┐
│  Developer       │
│  Workstation     │
└────────┬─────────┘
         │
         │ 1. npm run deploy
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Deployment Script                             │
│                   (deploy.sh)                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 1: Prerequisites Check                                     │
│  ├─ ✓ Verify AWS CLI installed                                 │
│  ├─ ✓ Verify AWS credentials configured                        │
│  ├─ ✓ Verify Node.js installed                                 │
│  └─ ✓ Check npm available                                      │
│                                                                   │
│  Step 2: Build Application                                       │
│  ├─ Install dependencies (npm install)                          │
│  ├─ Run production build (npm run build)                        │
│  └─ Verify dist/ folder created                                 │
│                                                                   │
│  Step 3: Deploy Infrastructure                                   │
│  ├─ Submit CloudFormation template                              │
│  ├─ Wait for stack creation                                     │
│  └─ Retrieve stack outputs                                      │
│                                                                   │
│  Step 4: Upload Files                                            │
│  ├─ Sync static assets (with long cache)                       │
│  ├─ Sync HTML files (with short cache)                         │
│  └─ Set proper content types                                    │
│                                                                   │
│  Step 5: Cache Invalidation                                      │
│  ├─ Create CloudFront invalidation                              │
│  └─ Invalidate all paths (/**)                                 │
│                                                                   │
│  Step 6: Output Results                                          │
│  └─ Display CloudFront URL                                      │
│                                                                   │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AWS CloudFormation                               │
│                                                                   │
│  Creates:                                                         │
│  ├─ S3 Bucket                                                    │
│  ├─ S3 Bucket Policy                                            │
│  ├─ CloudFront Origin Access Identity                           │
│  └─ CloudFront Distribution                                      │
│                                                                   │
│  Status: CREATE_COMPLETE                                         │
│  Time: ~5-7 minutes                                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Deployment Complete                            │
│                                                                   │
│  Application URL: https://d1234567890.cloudfront.net            │
│                                                                   │
│  Ready to use! 🎉                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow (Production)

```
┌─────────────┐
│    User     │
│   Browser   │
└──────┬──────┘
       │
       │ GET https://d1234567890.cloudfront.net/
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│         CloudFront Edge Location (Nearest)              │
│                                                           │
│  Check Cache:                                            │
│  ┌──────────────────────────────────────┐              │
│  │ Is content cached?                   │              │
│  │  ├─ YES → Return from cache (FAST!) │              │
│  │  └─ NO  → Fetch from origin          │              │
│  └──────────────────────────────────────┘              │
└───────────────────┬────────────────────────────────────┘
                    │
                    │ Cache Miss
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  S3 Bucket (Origin)                      │
│                                                           │
│  Fetch: /index.html                                      │
│                                                           │
│  Return with headers:                                     │
│  ├─ Content-Type: text/html                             │
│  ├─ Cache-Control: public, max-age=0                    │
│  └─ Content-Length: XXXX                                │
└───────────────────┬────────────────────────────────────┘
                    │
                    │ Response
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│         CloudFront Edge Location                         │
│                                                           │
│  1. Cache the response                                   │
│  2. Apply compression (if supported)                     │
│  3. Add security headers                                 │
│  4. Enforce HTTPS                                        │
└───────────────────┬────────────────────────────────────┘
                    │
                    │ HTTPS Response
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              User Browser                                │
│                                                           │
│  1. Receive index.html                                   │
│  2. Parse HTML                                           │
│  3. Request assets (JS, CSS, images)                    │
│  4. Assets served from CloudFront cache                 │
│  5. React app initializes                               │
│  6. Application ready!                                   │
└─────────────────────────────────────────────────────────┘
```

## Caching Strategy

```
┌───────────────────────────────────────────────────────────────┐
│                     Caching Layers                             │
└───────────────────────────────────────────────────────────────┘

1. Browser Cache
   └─ User's browser caches resources locally
   └─ Respects Cache-Control headers

2. CloudFront Edge Cache
   └─ 200+ edge locations worldwide
   └─ Regional edge caches for less popular content
   
3. CloudFront Regional Cache
   └─ Larger, fewer locations
   └─ Longer cache retention
   
4. S3 Origin
   └─ Source of truth
   └─ Only fetched on cache miss

┌───────────────────────────────────────────────────────────────┐
│                  Cache Duration by File Type                   │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│  HTML Files (index.html)                                       │
│  ├─ CloudFront: 300 seconds (5 minutes)                       │
│  ├─ Browser: 0 seconds (always validate)                      │
│  └─ Reason: Frequent updates, entry point                     │
│                                                                 │
│  JS/CSS Assets (hashed filenames)                             │
│  ├─ CloudFront: 31,536,000 seconds (1 year)                  │
│  ├─ Browser: 31,536,000 seconds (1 year)                     │
│  └─ Reason: Content-hashed, immutable                         │
│                                                                 │
│  Images/Fonts                                                   │
│  ├─ CloudFront: 31,536,000 seconds (1 year)                  │
│  ├─ Browser: 31,536,000 seconds (1 year)                     │
│  └─ Reason: Rarely change                                     │
│                                                                 │
└───────────────────────────────────────────────────────────────┘
```

## Update Flow

```
┌──────────────────┐
│   Developer      │
│   Makes Changes  │
└────────┬─────────┘
         │
         │ npm run deploy:update
         ▼
┌─────────────────────────────────────────────────────────┐
│              Update Script (update.sh)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Build new version                                    │
│     └─ npm run build                                     │
│                                                           │
│  2. Sync to S3                                           │
│     ├─ Upload changed files only                        │
│     └─ Verify upload successful                         │
│                                                           │
│  3. Invalidate CloudFront                                │
│     └─ Create invalidation for /*                       │
│                                                           │
└───────────────────┬────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              CloudFront Invalidation                     │
│                                                           │
│  Propagates to all edge locations                       │
│  Time: 5-10 minutes                                      │
│                                                           │
│  Before completion:                                       │
│  └─ Some users see old version                          │
│                                                           │
│  After completion:                                        │
│  └─ All users see new version                           │
└─────────────────────────────────────────────────────────┘
```

## Security Flow

```
┌─────────────────────────────────────────────────────────┐
│                  Security Layers                         │
└─────────────────────────────────────────────────────────┘

Layer 1: Network (AWS Shield)
├─ DDoS protection (Standard - included)
├─ Network ACLs
└─ VPC isolation (for AWS services)

Layer 2: CloudFront
├─ HTTPS enforcement (redirect HTTP → HTTPS)
├─ TLS 1.2+ only
├─ Certificate management
├─ Geographic restrictions (optional)
└─ Custom headers

Layer 3: S3 Bucket
├─ Block public access (except via bucket policy)
├─ Bucket policy: Read-only access
├─ No write access from internet
├─ Encryption at rest (optional)
└─ Versioning (optional)

Layer 4: IAM
├─ Least privilege access
├─ No AWS credentials in code
├─ CloudFormation service roles
└─ Audit trail (CloudTrail)

Layer 5: Application
├─ Client-side only (no server vulnerabilities)
├─ No sensitive data in localStorage
├─ CORS configured properly
└─ Input validation
```

## Cost Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Cost Components                       │
└─────────────────────────────────────────────────────────┘

User Request → CloudFront → S3
     │              │         │
     │              │         └─ Storage Cost
     │              │            ($0.023/GB/month)
     │              │
     │              ├─ Data Transfer Out
     │              │  ($0.085/GB for first 10TB)
     │              │
     │              └─ Request Cost
     │                 ($0.0075 per 10,000 HTTPS)
     │
     └─ No cost to end user

Monthly Cost Calculation:
├─ Storage: 100 MB = $0.002
├─ Requests: 10,000 = $0.008
├─ Transfer: 1 GB = $0.085
└─ Total: ~$0.10/month (low traffic)

Free Tier (First 12 months):
├─ CloudFront: 50 GB + 2M requests
├─ S3: 5 GB + 20K requests
└─ Likely $0 for first year!
```

## Monitoring Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Monitoring & Logging                     │
└─────────────────────────────────────────────────────────┘

CloudWatch Metrics (Automatic)
├─ CloudFront
│  ├─ Requests
│  ├─ Data Transfer
│  ├─ Error Rate (4xx, 5xx)
│  ├─ Cache Hit Ratio
│  └─ Popular Objects
│
├─ S3
│  ├─ Bucket Size
│  ├─ Number of Objects
│  ├─ Request Count
│  └─ Data Transfer
│
└─ CloudFormation
   ├─ Stack Status
   ├─ Resource Count
   └─ Events

Optional Logging
├─ CloudFront Access Logs → S3
├─ S3 Access Logs → Separate Bucket
├─ CloudTrail → API Audit Logs
└─ Cost Explorer → Billing Analysis
```

## Disaster Recovery

```
┌─────────────────────────────────────────────────────────┐
│              Recovery Procedures                         │
└─────────────────────────────────────────────────────────┘

Scenario 1: Accidental File Deletion
├─ Enable S3 Versioning
├─ Restore from previous version
└─ Re-upload from local dist/

Scenario 2: Bad Deployment
├─ Keep previous build locally
├─ Run: npm run deploy:update
└─ Or restore S3 from backup

Scenario 3: Stack Deletion
├─ Re-run: npm run deploy
├─ CloudFormation recreates everything
└─ Update DNS if using custom domain

Scenario 4: Cost Overrun
├─ Check CloudWatch metrics
├─ Identify traffic source
├─ Enable CloudFront geographic restrictions
└─ Or teardown: npm run deploy:teardown

Backup Strategy
├─ Keep CloudFormation template in git
├─ Keep deployment scripts in git
├─ Keep dist/ folder of stable versions
└─ Document custom configurations
```

---

## Quick Reference

### Architecture Summary
- **Frontend**: React + Vite (Static SPA)
- **Hosting**: AWS S3 (Static Website)
- **CDN**: AWS CloudFront (Global Distribution)
- **DNS**: CloudFront domain (custom optional)
- **SSL**: CloudFront default certificate
- **Deployment**: CloudFormation (IaC)

### Key URLs
- Application: `https://{distribution-id}.cloudfront.net`
- S3 Website: `http://{bucket-name}.s3-website-{region}.amazonaws.com`
- AWS Console: `https://console.aws.amazon.com/`

### Important IDs (after deployment)
- Stack Name: `secret-santa-app-infrastructure`
- Bucket Name: `secret-santa-app-{account-id}`
- Distribution ID: Retrieved from CloudFormation outputs
- Region: `us-east-1` (default, configurable)
