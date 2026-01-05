# Deployment Flow Diagram

## Overview
Visual representation of the deployment process and architecture for the Secret Santa React application.

---

## 1. Deployment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT PROCESS FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

    Developer
       │
       │ npm run deploy
       ▼
┌─────────────────┐
│  Prerequisites  │
│  Verification   │
├─────────────────┤
│ • AWS CLI       │
│ • Node.js       │
│ • Credentials   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Phase    │
├─────────────────┤
│ • npm install   │
│ • npm run build │
│ • Create dist/  │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Infrastructure      │
│  Deployment          │
├──────────────────────┤
│ CloudFormation       │
│ • Create S3 Bucket   │────────┐
│ • Bucket Policy      │        │
│ • CloudFront Dist.   │        │
│ • Error Responses    │        │
└────────┬─────────────┘        │
         │                      │
         ▼                      │
┌──────────────────────┐        │
│  File Upload         │        │
├──────────────────────┤        │
│ • Sync to S3         │◄───────┘
│ • Set cache headers  │
│ • HTML (no cache)    │
│ • Assets (1 year)    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Cache Invalidation  │
├──────────────────────┤
│ • Create invalidation│
│ • Path: /*           │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Deployment Complete │
├──────────────────────┤
│ CloudFront URL:      │
│ https://dXXX.        │
│ cloudfront.net       │
└──────────────────────┘
         │
         │ npm run deploy:test
         ▼
┌──────────────────────┐
│  Automated Testing   │
├──────────────────────┤
│ ✓ Stack deployed     │
│ ✓ S3 bucket ready    │
│ ✓ CloudFront active  │
│ ✓ App responds       │
│ ✓ Routing works      │
└──────────────────────┘
         │
         ▼
    Production! 🎉
```

---

## 2. Infrastructure Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       PRODUCTION ARCHITECTURE                         │
└──────────────────────────────────────────────────────────────────────┘

                          Users Worldwide
                                 │
                                 │ HTTPS
                                 ▼
                    ┌────────────────────────┐
                    │   Route 53 (Optional)  │
                    │   Custom Domain        │
                    └───────────┬────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │         AWS CloudFront Distribution           │
        │              (Global Edge Locations)          │
        ├───────────────────────────────────────────────┤
        │                                               │
        │  Features:                                    │
        │  • HTTPS Enforcement                          │
        │  • HTTP → HTTPS Redirect                      │
        │  • Gzip Compression                           │
        │  • Edge Caching (TTL: 1 day default)          │
        │  • Custom Error Responses                     │
        │    - 403 → 200 /index.html                    │
        │    - 404 → 200 /index.html                    │
        │  • Default Root: index.html                   │
        │                                               │
        └───────────────────┬───────────────────────────┘
                            │
                            │ HTTP (Origin)
                            ▼
        ┌───────────────────────────────────────────────┐
        │         AWS S3 Bucket (Website Hosting)       │
        │       s3://secret-santa-app-<account-id>      │
        ├───────────────────────────────────────────────┤
        │                                               │
        │  Configuration:                               │
        │  • Static Website Hosting: Enabled            │
        │  • Index Document: index.html                 │
        │  • Error Document: index.html                 │
        │  • Public Read Access: Enabled                │
        │  • CORS: Configured                           │
        │                                               │
        │  Content:                                     │
        │  ├── index.html                               │
        │  ├── assets/                                  │
        │  │   ├── index-<hash>.js                      │
        │  │   ├── index-<hash>.css                     │
        │  │   └── ...                                  │
        │  └── vite.svg                                 │
        │                                               │
        └───────────────────────────────────────────────┘
```

---

## 3. Request Flow (End User)

```
┌──────────────────────────────────────────────────────────────────────┐
│                       USER REQUEST FLOW                              │
└──────────────────────────────────────────────────────────────────────┘

    User Browser
         │
         │ Request: https://dXXXX.cloudfront.net/
         ▼
┌────────────────────┐
│  CloudFront Edge   │
│  (Nearest)         │
└────────┬───────────┘
         │
         │ Cache Hit?
         ├─────── Yes ──────┐
         │                   │
         No                  │
         │                   │
         ▼                   │
┌────────────────────┐      │
│  Origin Request    │      │
│  to S3 Website     │      │
└────────┬───────────┘      │
         │                   │
         ▼                   │
┌────────────────────┐      │
│  S3 Returns File   │      │
│  (index.html)      │      │
└────────┬───────────┘      │
         │                   │
         │◄──────────────────┘
         │
         ▼
┌────────────────────┐
│  CloudFront        │
│  Caches Response   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Return to User    │
│  • Compressed      │
│  • HTTPS           │
│  • Fast (edge)     │
└────────────────────┘
         │
         ▼
    Browser renders
    React application
         │
         ▼
┌────────────────────┐
│  React Router      │
│  takes over        │
├────────────────────┤
│  Client-side       │
│  routing for       │
│  navigation        │
└────────────────────┘
```

---

## 4. SPA Routing Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    REACT ROUTER / SPA ROUTING                        │
└──────────────────────────────────────────────────────────────────────┘

Scenario 1: Direct URL Access
──────────────────────────────

User Types: https://dXXXX.cloudfront.net/admin/results
         │
         ▼
CloudFront receives request for /admin/results
         │
         ▼
S3 checks for file: /admin/results (doesn't exist)
         │
         ▼
S3 returns 404 error
         │
         ▼
CloudFront Custom Error Response:
  • Error 404 → Response 200
  • ResponsePagePath: /index.html
         │
         ▼
Returns index.html with status 200
         │
         ▼
Browser loads React app
         │
         ▼
React Router reads URL: /admin/results
         │
         ▼
Renders AdminResults component
         │
         ▼
✓ Page displays correctly!


Scenario 2: Browser Refresh on Route
─────────────────────────────────────

User on: /participant/abc123
         │
         │ Clicks refresh
         ▼
CloudFront receives: /participant/abc123
         │
         ▼
Same flow as above (404 → index.html)
         │
         ▼
React Router reads: /participant/abc123
         │
         ▼
Renders ParticipantView component
         │
         ▼
✓ Page still works!
```

---

## 5. Update Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                       UPDATE DEPLOYMENT FLOW                         │
└──────────────────────────────────────────────────────────────────────┘

    Developer makes code changes
         │
         │ npm run deploy:update
         ▼
┌────────────────────┐
│  Build Phase       │
│  (Production)      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Sync to S3        │
│  (Changed files    │
│   only with        │
│   --delete)        │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Cache             │
│  Invalidation      │
│  (/* all paths)    │
└────────┬───────────┘
         │
         │ Wait 5-10 minutes
         ▼
┌────────────────────┐
│  Changes Live      │
│  Globally          │
└────────────────────┘
         │
         ▼
    Users see updates!
```

---

## 6. Monitoring & Management

```
┌──────────────────────────────────────────────────────────────────────┐
│                    AWS MANAGEMENT RESOURCES                          │
└──────────────────────────────────────────────────────────────────────┘

AWS Console Access Points:
──────────────────────────

┌─────────────────────┐
│  CloudFormation     │
│  Console            │
├─────────────────────┤
│ • Stack status      │
│ • Stack events      │
│ • Outputs (URLs)    │
│ • Resources list    │
└─────────────────────┘

┌─────────────────────┐
│  S3 Console         │
├─────────────────────┤
│ • Browse files      │
│ • Check policies    │
│ • View access logs  │
│ • Monitor storage   │
└─────────────────────┘

┌─────────────────────┐
│  CloudFront Console │
├─────────────────────┤
│ • Distribution list │
│ • Invalidations     │
│ • Monitoring graphs │
│ • Cache statistics  │
└─────────────────────┘

┌─────────────────────┐
│  CloudWatch         │
├─────────────────────┤
│ • Request metrics   │
│ • Error rates       │
│ • Bandwidth usage   │
│ • Set up alarms     │
└─────────────────────┘

┌─────────────────────┐
│  Cost Explorer      │
├─────────────────────┤
│ • Daily costs       │
│ • Service breakdown │
│ • Usage patterns    │
│ • Budget alerts     │
└─────────────────────┘
```

---

## 7. Troubleshooting Decision Tree

```
┌──────────────────────────────────────────────────────────────────────┐
│                   TROUBLESHOOTING FLOW                               │
└──────────────────────────────────────────────────────────────────────┘

                    Deployment Issue?
                           │
                ┌──────────┴──────────┐
                │                     │
           Build fails?          AWS error?
                │                     │
                ▼                     ▼
        ┌─────────────┐      ┌─────────────┐
        │ Check:      │      │ Check:      │
        │ • Node.js   │      │ • AWS CLI   │
        │ • npm       │      │ • Creds     │
        │ • deps      │      │ • Perms     │
        └─────────────┘      └──────┬──────┘
                                    │
                          ┌─────────┴─────────┐
                          │                   │
                   CloudFormation?         S3/CloudFront?
                          │                   │
                          ▼                   ▼
                  ┌──────────────┐    ┌──────────────┐
                  │ Check stack  │    │ Check:       │
                  │ events in    │    │ • Bucket     │
                  │ console      │    │ • Files      │
                  └──────────────┘    │ • Policies   │
                                      └──────────────┘

                    Application Issue?
                           │
                ┌──────────┴──────────┐
                │                     │
          403/404 error?        Routing broken?
                │                     │
                ▼                     ▼
        ┌─────────────┐      ┌─────────────┐
        │ Wait 15-20  │      │ Check:      │
        │ minutes for │      │ • Custom    │
        │ CloudFront  │      │   errors    │
        │ deploy      │      │ • Template  │
        └─────────────┘      └─────────────┘

            Changes not visible?
                    │
                    ▼
            ┌───────────────┐
            │ • Clear cache │
            │ • Hard refresh│
            │ • Wait 5-10   │
            │   minutes     │
            └───────────────┘
```

---

## Key Takeaways

1. **Deployment Time**: Initial ~15-30 minutes (CloudFront propagation)
2. **Update Time**: ~5-10 minutes (includes cache invalidation)
3. **Global Availability**: CloudFront serves from nearest edge location
4. **Cost Efficient**: ~$0.11/month after free tier, or $0 with free tier
5. **Scalable**: Handles traffic spikes automatically
6. **Secure**: HTTPS enforced, managed by AWS
7. **Simple**: One command deployment (`npm run deploy`)
8. **Testable**: Automated verification (`npm run deploy:test`)

---

**Version**: 1.0  
**Last Updated**: 2025-12-16  
**Status**: Production Ready ✅
