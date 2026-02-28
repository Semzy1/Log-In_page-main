# ShopEase Deployment Guide

Complete guide for deploying ShopEase to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [SSL/HTTPS Configuration](#ssla-https-configuration)
7. [Environment Configuration](#environment-configuration)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js v16 or higher
- MongoDB v4.0 or higher
- npm or yarn
- Git
- SSL certificate (for HTTPS)
- Domain name
- Hosting provider (AWS, Heroku, DigitalOcean, etc.)

## Pre-Deployment Checklist

### Code Quality
- [ ] All linting errors fixed
- [ ] No console.log in production code
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Dependencies up to date
- [ ] No hardcoded secrets or credentials
- [ ] API keys in environment variables

### Frontend
- [ ] All links tested and working
- [ ] Images optimized
- [ ] CSS purged of unused styles
- [ ] JavaScript minified
- [ ] Responsive design tested on all devices
- [ ] Accessibility audit passed
- [ ] Meta tags and SEO optimized
- [ ] 404 page configured
- [ ] favicon configured

### Backend
- [ ] Database indexes created
- [ ] Error logging configured
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Database backups scheduled
- [ ] Email service configured
- [ ] Payment gateways tested
- [ ] Health check endpoint working

### Security
- [ ] HTTPS enabled
- [ ] CORS whitelist set
- [ ] Rate limiting enabled
- [ ] Input validation strict
- [ ] Authentication tokens secure
- [ ] Database credentials secured
- [ ] API keys rotated
- [ ] Security headers configured

## Backend Deployment

### 1. Server Preparation

**Using AWS EC2:**

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Update system
sudo yum update -y

# Install Node.js and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16

# Install PM2 for process management
npm install -g pm2
```

### 2. MongoDB Setup

**Using MongoDB Atlas (Cloud):**

```bash
# Create MongoDB Atlas account
# Create cluster and get connection string
# Update MONGODB_URI in .env
```

**Using Local MongoDB:**

```bash
# Install MongoDB
# On Ubuntu:
sudo apt-get install -y mongodb

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongo --version
```

### 3. Clone and Setup Backend

```bash
# Clone repository
git clone <repository-url>
cd Log-In_page-main/backend

# Install dependencies
npm install

# Create .env file with production values
cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
EMAIL_USER=<your-gmail>
EMAIL_PASS=<your-app-password>
FRONTEND_URL=https://yourdomain.com
FLUTTERWAVE_PUBLIC_KEY=<your-key>
FLUTTERWAVE_SECRET_KEY=<your-key>
PAYSTACK_PUBLIC_KEY=<your-key>
PAYSTACK_SECRET_KEY=<your-key>
ADMIN_EMAIL=admin@yourdomain.com
EOF

# Set proper permissions
chmod 600 .env

# Start with PM2
pm2 start server.js --name "shopease-api"
pm2 save
pm2 startup
```

### 4. Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt-get install nginx -y

# Create config
sudo cat > /etc/nginx/sites-available/shopease-api << 'EOF'
upstream shopease_api {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # Proxy settings
    location / {
        proxy_pass http://shopease_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/shopease-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Frontend Deployment

### 1. Build Frontend

```bash
# Navigate to frontend directory
cd Log-In_page-main

# Create production env file
cat > .env.production << EOF
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_DEBUG=false
REACT_APP_ENV=production
EOF

# Minify and optimize
# If using a build tool, run build command
npm run build  # or yarn build
```

### 2. Deploy to Static Hosting

**Using AWS S3 + CloudFront:**

```bash
# Create S3 bucket
aws s3 mb s3://yourdomain.com

# Upload files
aws s3 sync . s3://yourdomain.com --delete

# Set cache headers
aws s3 cp s3://yourdomain.com s3://yourdomain.com \
  --recursive \
  --exclude "*" \
  --include "*.html" \
  --metadata-directive REPLACE \
  --cache-control "max-age=600, must-revalidate"

aws s3 cp s3://yourdomain.com s3://yourdomain.com \
  --recursive \
  --exclude "*.html" \
  --metadata-directive REPLACE \
  --cache-control "max-age=31536000, immutable"
```

**Using Netlify:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

**Using Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Using Nginx for Frontend:**

```bash
# Copy files to web root
sudo cp -r /path/to/project/* /var/www/html/

# Configure Nginx
sudo cat > /etc/nginx/sites-available/shopease << 'EOF'
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    root /var/www/html;
    index Homepage.html;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # SPA routing (send all requests to Homepage.html)
    location / {
        try_files $uri $uri/ /Homepage.html;
    }

    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML files
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "public, must-revalidate";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}
EOF

sudo systemctl restart nginx
```

## Database Setup

### MongoDB Atlas

1. Create account at mongodb.com
2. Create cluster
3. Add user and whitelist IP
4. Get connection string
5. Update `MONGODB_URI` in backend `.env`

### Backup Strategy

```bash
# Create backup script
cat > /home/ec2-user/backup-mongo.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y-%m-%d-%H-%M-%S)
mkdir -p $BACKUP_DIR

mongodump --uri "$MONGODB_URI" --out "$BACKUP_DIR/backup-$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
EOF

chmod +x /home/ec2-user/backup-mongo.sh

# Schedule with crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/backup-mongo.sh") | crontab -
```

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl start certbot.timer
sudo systemctl enable certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

### Using Purchased Certificate

1. Purchase from certificate authority
2. Download certificate files
3. Place in `/etc/ssl/certs/` and `/etc/ssl/private/`
4. Update Nginx configuration with certificate paths

## Environment Configuration

### Production .env (Backend)

```bash
# Core
NODE_ENV=production
PORT=443  # HTTPS

# Database
MONGODB_URI=<your-mongodb-uri>

# JWT
JWT_SECRET=<64-char-random-string>
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=<64-char-random-string>
JWT_REFRESH_EXPIRE=7d

# Email
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=<app-password>
NOTIFY_EMAIL=admin@yourdomain.com

# Frontend
FRONTEND_URL=https://yourdomain.com

# Payment Gateways
FLUTTERWAVE_PUBLIC_KEY=<production-key>
FLUTTERWAVE_SECRET_KEY=<production-key>
PAYSTACK_PUBLIC_KEY=pk_live_<your-key>
PAYSTACK_SECRET_KEY=sk_live_<your-key>

# Admin
ADMIN_EMAIL=admin@yourdomain.com
```

### Generating Secure Secrets

```bash
# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Performance Optimization

### Frontend

1. **Code Splitting**
   - Load scripts asynchronously
   - Defer non-critical CSS
   - Preload critical resources

2. **Image Optimization**
   ```html
   <picture>
     <source srcset="image.webp" type="image/webp">
     <img src="image.jpg" alt="description">
   </picture>
   ```

3. **Caching**
   - Set cache headers for static files
   - Use service workers for offline support
   - Cache API responses appropriately

### Backend

1. **Database Optimization**
   - Create proper indexes
   - Use aggregation pipelines
   - Implement pagination

2. **Caching Layer**
   - Use Redis for session caching
   - Cache frequently accessed data
   - Implement rate limiting

3. **Response Compression**
   - Enable gzip compression
   - Use CDN for static files
   - Minimize JSON payloads

## Monitoring & Maintenance

### Application Monitoring

```bash
# Monitor with PM2
pm2 logs shopease-api
pm2 monit

# Check status
pm2 status
```

### Health Checks

```bash
# Check backend health
curl https://api.yourdomain.com/api/health

# Expected response
{
  "status": "OK",
  "message": "ShopEase API is running",
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```

### Log Monitoring

```bash
# Check application logs
pm2 logs shopease-api

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system logs
sudo journalctl -xe
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update minor/patch versions
npm update

# Update major versions
npm install -g npm-check-updates
ncu -u
npm install
```

## Troubleshooting

### Backend Not Responding

```bash
# Check if running
pm2 list

# Restart
pm2 restart shopease-api

# Check logs
pm2 logs shopease-api
```

### Database Connection Issues

```bash
# Test connection
mongosh "<your-mongodb-uri>"

# Check MongoDB status
sudo systemctl status mongod
```

### CORS Errors

1. Verify `FRONTEND_URL` in backend `.env`
2. Check CORS configuration in backend
3. Clear browser cache
4. Check API endpoint in frontend config

### SSL Certificate Issues

```bash
# Check certificate
openssl x509 -in /etc/ssl/certs/yourdomain.crt -text -noout

# Check expiry
openssl x509 -in /etc/ssl/certs/yourdomain.crt -noout -dates

# Renew if needed
sudo certbot renew --force-renewal
```

## Disaster Recovery

### Database Backup Restoration

```bash
# List backups
ls /backups/mongodb/

# Restore from backup
mongorestore --uri "$MONGODB_URI" /backups/mongodb/backup-<date>
```

### Application Rollback

```bash
# Stop current version
pm2 stop shopease-api

# Deploy previous version
cd /app
git checkout <previous-commit>
npm install
pm2 start server.js

# Verify
curl https://api.yourdomain.com/api/health
```

---

**Last Updated**: February 27, 2026
**Version**: 2.0.0
**Status**: Production Ready
