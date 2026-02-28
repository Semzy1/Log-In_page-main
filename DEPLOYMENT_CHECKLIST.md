# Production Deployment Checklist

**Last Updated**: February 5, 2026  
**Status**: Ready for staging → production

---

## ✅ Pre-Deployment Requirements

### Environment & Secrets
- [ ] `.env` file created with ALL required variables (use `.env.example` as template)
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` generated (use `openssl rand -hex 32`)
- [ ] Payment gateway keys obtained (Flutterwave, Paystack)
- [ ] Email credentials configured
- [ ] MongoDB connection string verified (MongoDB Atlas or self-hosted)
- [ ] **CRITICAL**: `.env` NOT committed to git (`.gitignore` verified)

### Security Verification
- [ ] Run `npm audit` in backend, frontend, and root directories
- [ ] Run `npx snyk check` for additional vulnerability scanning (optional)
- [ ] HTTPS/TLS certificate obtained for production domain
- [ ] CORS domain list verified in `backend/config/index.js`
- [ ] CSP headers reviewed and tested (see `backend/server.js`)
- [ ] Rate limiting values reviewed (15 min window, 100 requests per IP)

### Database
- [ ] MongoDB indexes created on `users.email`, `products.category`, `orders.user`
- [ ] Database backups enabled (daily backup recommended)
- [ ] Database user with minimal permissions created (not root)
- [ ] Replica set/sharding configured if high volume expected

### Testing
- [ ] Unit tests passing: `npm test` in backend
- [ ] Manual smoke test of critical flows:
  - [ ] User registration & login
  - [ ] Product browsing & search
  - [ ] Cart add/remove
  - [ ] Order creation
  - [ ] Payment flow (test mode)
- [ ] GitHub Actions CI/CD pipeline passing on `main` branch

### Frontend Build & Assets
- [ ] All external CDN URLs verified (Font Awesome, Google Fonts, Flutterwave, Paystack)
- [ ] No `console.log()` or `debugger` statements in production code
- [ ] Image assets optimized (compressed, correct formats)
- [ ] Service Worker configured for offline support (optional)
- [ ] Favicon and metadata tags updated for production domain

### Backend Configuration
- [ ] `NODE_ENV=production` set in production environment
- [ ] Error logging configured (errors should NOT include stack traces in production)
- [ ] Request logging set to `info` level (not `debug`)
- [ ] CORS origin set to production domain only
- [ ] Email notifications enabled for admin alerts

---

## 🚀 Deployment Steps

### 1. Pre-Flight Checks (Local)
```bash
# Validate configuration loads without errors
cd backend
node -e "require('./config')"  # Should output: ✅ Configuration validated

# Run all tests
npm test -- --coverage

# Check dependencies
npm audit

# Verify build artifacts
npm run build  # If using frontend build tool
```

### 2. Database Migrations (if applicable)
```bash
# Create indexes
mongo < scripts/create-indexes.js

# Run migrations
npm run migrate  # If using migration tool
```

### 3. Deploy Backend
```bash
# Option A: Docker
docker build -t shopease-api:latest .
docker push shopease-api:latest
# Deploy using Docker Compose, Kubernetes, or Docker Swarm

# Option B: Traditional Server (Heroku, DigitalOcean, AWS EC2)
git push heroku main
# OR
ssh user@server
cd /app/shopease-backend
git pull origin main
npm install --production
npm start  # Run with PM2 or similar process manager
```

### 4. Deploy Frontend
```bash
# Static hosting (Netlify, Vercel, GitHub Pages, AWS S3)
# Simply upload HTML, CSS, JS files to hosting service
# OR use continuous deployment from git

# Serve from same domain as backend (optional)
# Configure web server to serve frontend files + proxy /api/* to backend
```

### 5. Post-Deployment Verification
```bash
# Verify backend is running
curl -X GET https://your-domain.com/api/health
# Expected: { "status": "OK", "message": "ShopEase API is running", ... }

# Test critical endpoints
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# Check security headers
curl -I https://your-domain.com
# Look for: Strict-Transport-Security, Content-Security-Policy, X-Frame-Options

# Monitor logs for errors
tail -f /var/log/shopease/api.log
```

### 6. Monitor & Alert
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, Datadog)
- [ ] Configure error tracking (Sentry, New Relic, CloudWatch)
- [ ] Set up performance monitoring (APM)
- [ ] Configure log aggregation (ELK Stack, Datadog, CloudWatch)
- [ ] Create alerting rules for:
  - 5xx error rate > 5%
  - API response time > 1s
  - Database connection failures
  - High memory/CPU usage

---

## 🔄 Continuous Deployment (CD)

### GitHub Actions Automation
The CI/CD pipeline runs automatically on push to `main` or `develop`:

1. **On Each Push**:
   ```
   Dependency Audit → Tests → Security Scan → Build Check
   ```

2. **On PR to main**:
   ```
   Same as push + Code Review Gates
   ```

3. **Weekly (via Dependabot)**:
   ```
   Automated dependency updates + PR creation
   ```

### Manual Production Release
```bash
# Create a tagged release
git tag -a v1.0.0 -m "Production Release v1.0.0"
git push origin v1.0.0

# Trigger deployment
# (Configure your CI/CD to deploy on tag)
```

---

## 🚨 Rollback Procedure

If issues occur post-deployment:

```bash
# Option 1: Revert to previous commit
git revert HEAD
git push origin main

# Option 2: Rollback to previous container version
docker pull shopease-api:previous
docker-compose up -d  # Restart with old image

# Option 3: Restore from database snapshot
mongorestore --uri="mongodb://..." dump/
```

---

## 📊 Post-Deployment Monitoring

### Key Metrics to Track
- **Availability**: Target 99.5% uptime
- **Response Time**: P95 < 500ms, P99 < 2s
- **Error Rate**: < 0.5% HTTP 5xx errors
- **User Metrics**: Active sessions, conversion rate, cart abandonment
- **Resource Usage**: CPU, Memory, Database connections

### First Week Checklist
- [ ] Monitor error logs daily
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Monitor payment gateway issues
- [ ] Check email deliverability
- [ ] Verify SSL certificate renewal schedule

---

## 📝 Post-Deployment Documentation

Update these after deployment:

```
README.md
├── Production URLs
├── Support contacts
├── Known issues
└── Rollback procedures

DEPLOYMENT.md (new)
├── Architecture diagram
├── Server configuration
├── Database backups
└── Monitoring setup

SECURITY.md (update)
├── Security contacts
├── Vulnerability reporting
└── Incident response
```

---

## 🎯 Success Criteria

Production deployment is considered successful when:

1. ✅ All health checks passing
2. ✅ No critical errors in logs (24 hours)
3. ✅ Security headers all present and correct
4. ✅ Tests passing in CI/CD pipeline
5. ✅ SSL/TLS certificate valid and auto-renewal configured
6. ✅ User authentication working end-to-end
7. ✅ Payments processing successfully (test transactions)
8. ✅ Email notifications being received
9. ✅ Database backups occurring as scheduled
10. ✅ Monitoring and alerting systems active

---

## 🔗 Quick Links

- **Repository**: https://github.com/shopease/shopease
- **Issues**: https://github.com/shopease/shopease/issues
- **Documentation**: https://docs.shopease.example.com
- **API Docs**: https://api.shopease.example.com/docs
- **Admin Panel**: https://admin.shopease.example.com

---

**Generated**: February 5, 2026  
**Last Verified**: February 5, 2026  
**Version**: 1.0.0
