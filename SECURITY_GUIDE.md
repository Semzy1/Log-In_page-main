# Security Guide - ShopEase v2.0.0

Comprehensive security documentation for developers and administrators.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [API Security](#api-security)
4. [Frontend Security](#frontend-security)
5. [Deployment Security](#deployment-security)
6. [Incident Response](#incident-response)
7. [Security Checklist](#security-checklist)

---

## Authentication & Authorization

### JWT Tokens

ShopEase uses JWT (JSON Web Tokens) for stateless authentication with refresh token rotation.

#### Access Token
- **Expiration**: 15 minutes
- **Storage**: localStorage (line: 1 hour for remembered sessions)
- **Scope**: API requests
- **Header**: `Authorization: Bearer <token>`

#### Refresh Token
- **Expiration**: 7 days
- **Storage**: localStorage
- **Scope**: Obtain new access tokens
- **Rotation**: New refresh token issued with each refresh

#### Security Features

```javascript
// ✓ Tokens automatically managed by api-client.js
// ✓ Expired tokens automatically refreshed
// ✓ Failed refresh redirects to login
// ✓ Tokens cleared on logout
// ✓ Concurrent requests queued during refresh
```

### Password Requirements

Passwords must meet:
- **Minimum 8 characters**
- **At least one uppercase letter** (A-Z)
- **At least one lowercase letter** (a-z)
- **At least one number** (0-9)

**Backend Validation** (`models/User.js`):
```javascript
password: {
  minlength: 8,
  required: true,
  validate: (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v)
}
```

**Frontend Validation** (`assets/js/utils.js`):
```javascript
Validator.rules.password('SecurePass123');  // Valid
Validator.rules.password('weak');            // Invalid
```

### Password Hashing

- **Algorithm**: bcryptjs (salting round: 10)
- **Timing**: Pre-save hook in User model
- **Comparison**: Constant-time comparison to prevent timing attacks

**Backend** (`models/User.js`):
```javascript
schema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Only hash if not already hashed
  if (!this.password.startsWith('$2')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
```

### Multi-Factor Authentication (MFA) - Recommended

Consider implementing:
1. **Email OTP** - One-time password sent to email
2. **SMS OTP** - For high-security operations
3. **Authenticator App** - Google Authenticator, Authy, etc.

---

## Data Protection

### Sensitive Fields

Never log or expose:
- Passwords
- Credit card numbers
- CVV/CVC codes
- PIN numbers
- API keys/secrets
- JWT tokens

**Secure Logging** (`backend/server.js`):
```javascript
app.use(morgan('combined', {
  skip: (req, res) => {
    // Don't log password fields
    return req.body?.password || req.body?.cardNumber;
  }
}));
```

### Database Encryption

#### At Rest (Production)
```bash
# MongoDB with encryption
- Use MongoDB Enterprise Edition with Encryption at Rest
- Enable Database-Level Encryption
- Use encrypted volumes on disk
```

#### In Transit
```bash
# TLS/SSL Encryption
- MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database?ssl=true
- Enforce TLS 1.2 or higher
```

### Personally Identifiable Information (PII)

Fields considered PII:
- Email address
- Phone number
- First name + Last name
- Home address
- Shipping address

**Protection Measures**:
- [ ] Only transmitted over HTTPS
- [ ] Encrypted in database (optional)
- [ ] Masked in logs
- [ ] Deleted on user request (GDPR compliance)
- [ ] Access restricted to authorized users only

### Data Retention Policy

```
Users:
- Active user data: Keep indefinitely
- Deleted user data: Delete after 30 days

Orders:
- Order records: Keep for 7 years (financial record requirement)
- Payment data: Delete after 30 days (PCI DSS)

Sessions/Logs:
- Application logs: Keep for 30 days
- Access logs: Keep for 90 days
```

---

## API Security

### Rate Limiting

**Global Rate Limit**:
- 100 requests per 15 minutes per IP
- Returns: 429 Too Many Requests

**Auth Endpoints** (Login/Register/Refresh):
- 5 requests per 15 minutes per IP
- Prevents brute force attacks

**Implementation** (`backend/server.js`):
```javascript
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

app.post('/api/auth/login', authLimiter, loginHandler);
```

### CORS (Cross-Origin Resource Sharing)

**Whitelist Configuration** (`backend/server.js`):
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,  // Only allow frontend
  credentials: true,                   // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Never allow**:
```javascript
// ✗ WRONG - Allows all origins
app.use(cors({ origin: '*' }));

// ✗ WRONG - Allows all headers
app.use(cors({ allowedHeaders: '*' }));
```

### Input Validation

**Client-Side** (First line of defense):
```javascript
// HTML data attributes
<input type="email" data-validate="email|required">

// JavaScript validation
Validator.validateForm(form);
```

**Server-Side** (Never trust client input):
```javascript
// Express validation middleware
const { body, validationResult } = require('express-validator');

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('username').matches(/^[a-zA-Z0-9_]+$/)
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process valid data
});
```

### SQL Injection Prevention

**Mongoose (Default Safe)**:
```javascript
// ✓ SAFE - Parameterized query
User.findOne({ email: req.body.email });

// ✗ UNSAFE - String concatenation
User.find({ email: `'${req.body.email}'` });
```

### NoSQL Injection Prevention

```javascript
// Sanitize user input
const email = req.body.email;

// ✓ SAFE - Mongoose automatically escapes
User.findOne({ email: email });

// ✓ SAFER - Explicit validation
if (!isValidEmail(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

### XSS (Cross-Site Scripting) Prevention

**Frontend Protection**:
```javascript
// ✓ SAFE - React automatically escapes
const name = props.user.name;
return <div>{name}</div>;  // Safe from XSS

// ✓ SAFE - Text content only
element.textContent = userInput;

// ✗ UNSAFE - HTML content
element.innerHTML = userInput;  // Vulnerable to XSS
```

**Backend Protection** (`backend/server.js`):
```javascript
// Helmet sets security headers
const helmet = require('helmet');
app.use(helmet());

// This sets:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 1; mode=block
// - Content-Security-Policy: default-src 'self'
```

---

## Frontend Security

### localStorage vs sessionStorage

**Current Implementation** (`assets/js/api-client.js`):
```javascript
// Using localStorage - persists across sessions
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', token);
```

**Enhanced Security Options**:

1. **sessionStorage** (Recommended for sensitive) - Clears when tab closes
2. **Memory only** - Lost on refresh, most secure
3. **Secure HTTP-only cookies** - Cannot access via JavaScript

**Recommendation for v2.1**:
```javascript
// Implement secure cookie-based authentication
// Store tokens only in httpOnly cookies
// Eliminates localStorage XSS vulnerability
```

### Content Security Policy (CSP)

**Current Headers** (via Helmet):
```
Content-Security-Policy: default-src 'self'
```

**Enhanced CSP** (`backend/server.js`):
```javascript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],  // Or use CSS-in-JS
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", process.env.FRONTEND_URL],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
})
```

### Secure Headers

**Current** (via Helmet - enabled):
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Browser Caching Prevention

```javascript
// Prevent browser caching of sensitive pages
app.use((req, res, next) => {
  if (req.path.includes('/api/') || req.path.includes('/dashboard')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});
```

---

## Deployment Security

### Environment Variables

**Never commit**:
```bash
# ✗ Don't commit
.env
.env.production

# ✓ Commit
.env.example
```

**Production Setup**:
```bash
# Set via platform (Heroku, AWS, etc.)
heroku config:set JWT_SECRET=strong-random-key
```

### HTTPS/TLS

**Required for production**:
```bash
# ✓ https://shopease.com
# ✗ http://shopease.com
```

**Setup with Let's Encrypt**:
```bash
# See DEPLOYMENT.md for full guide
certbot certonly --standalone -d shopease.com
```

**Nginx Configuration**:
```nginx
server {
  listen 443 ssl http2;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### Database Security

**MongoDB Atlas**:
- [ ] Enable IP Whitelist (only production server IPs)
- [ ] Use strong password (16+ chars, mix of types)
- [ ] Enable encryption at rest
- [ ] Enable encryption in transit (TLS)
- [ ] Create database-specific user (not admin)

**Production Connection**:
```
MONGODB_URI=mongodb+srv://user:strongpass@cluster.mongodb.net/shopease?ssl=true&retryWrites=true
```

### Server Hardening

**Linux/Ubuntu**:
```bash
# Firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# SSH key-based authentication
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config

# Fail2ban (brute force protection)
sudo apt install fail2ban
```

### Secrets Management

**Development**:
```bash
# Local .env file
JWT_SECRET=dev-key-only-for-testing
MAIL_PASS=test-app-password
```

**Production** (Use one of):
1. **AWS Secrets Manager**
2. **HashiCorp Vault**
3. **Environment variables on hosting platform**
4. **Encrypted configuration files**

**Never**:
```bash
# ✗ Hardcode secrets in code
const SECRET = 'my-secret-key';

# ✗ Commit .env to git
git status  # Should NOT show .env
```

---

## Incident Response

### Security Incident Definition

Events that may compromise security:
- Unauthorized access detected
- Data breach suspected
- DDoS attack
- Server compromise
- Data corruption

### Response Plan

1. **Contain** (0-1 hour)
   - Take affected system offline if necessary
   - Preserve logs and evidence
   - Alert security team

2. **Identify** (1-4 hours)
   - Determine what was accessed
   - When the incident occurred
   - Impact assessment

3. **Eradicate** (4-24 hours)
   - Remove attack vectors
   - Patch vulnerabilities
   - Update credentials

4. **Communicate** (0-24 hours)
   - Notify affected users
   - Compliance obligations (GDPR, etc.)
   - Prepare public statement

5. **Recover** (24+ hours)
   - Restore from clean backups
   - Monitor for signs of re-compromise
   - Post-incident review

### Emergency Contacts

```
Security Lead: [name] - [email] - [phone]
DevOps Lead:   [name] - [email] - [phone]
Legal Team:    [email]
```

### Log Retention for Investigation

```bash
# Access logs - keep 90 days
/var/log/nginx/access.log

# Application logs - keep 30 days
/var/log/shopease/app.log

# System logs - keep 30 days
/var/log/syslog
```

---

## Security Checklist

### Development
- [ ] Use .env for all secrets
- [ ] Validate all user inputs
- [ ] Hash passwords with bcryptjs
- [ ] Implement rate limiting
- [ ] Use HTTPS in production
- [ ] Set security headers (Helmet)
- [ ] Enable CORS with whitelist
- [ ] Implement proper logging
- [ ] Never log sensitive data
- [ ] Use prepared statements (Mongoose)

### Pre-Production
- [ ] Rotate all default secrets
- [ ] Enable database encryption
- [ ] Configure backup strategy
- [ ] Set up SSL certificates
- [ ] Configure firewall/security groups
- [ ] Test authentication flows
- [ ] Test authorization checks
- [ ] Review all API endpoints
- [ ] Set up monitoring/alerting
- [ ] Document security procedures

### Deployment
- [ ] Change all default credentials
- [ ] Set strong JWT secrets
- [ ] Configure environment variables
- [ ] Enable HTTPS/TLS
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Configure backups
- [ ] Test disaster recovery
- [ ] Set up security monitoring
- [ ] Document incident response

### Ongoing
- [ ] Monitor error logs weekly
- [ ] Review access logs monthly
- [ ] Update dependencies regularly
- [ ] Patch security vulnerabilities immediately
- [ ] Review user access monthly
- [ ] Test backup restoration quarterly
- [ ] Conduct security audit annually
- [ ] Update this security guide as needed
- [ ] Track security advisories

---

## Vulnerability Scanning

### Dependency Vulnerabilities

```bash
# Check npm packages
npm audit
npm audit fix        # Auto-fix if safe

# Check specific package
npm audit --package lodash
```

### Static Code Analysis

```bash
# ESLint with security rules
npm install -D eslint eslint-plugin-security
npx eslint .
```

### OWASP Top 10

ShopEase protections against:

1. **Injection** ✓ - Mongoose parameterized queries
2. **Broken Authentication** ✓ - JWT with refresh tokens
3. **Sensitive Data Exposure** ✓ - HTTPS, encryption
4. **XML External Entities** ✓ - Not applicable (JSON only)
5. **Broken Access Control** ✓ - Role-based authorization
6. **Security Misconfiguration** ✓ - Helmet, security headers
7. **XSS** ✓ - HTML escaping, CSP headers
8. **CSRF** ✓ - Token-based authentication
9. **Using Components with Known Vulnerabilities** ✓ - npm audit
10. **Insufficient Logging & Monitoring** ✓ - Morgan, error tracking

---

## Compliance & Standards

### GDPR Compliance

- [ ] Privacy policy visible
- [ ] Consent for data collection
- [ ] Right to data access implemented
- [ ] Right to deletion ("right to be forgotten")
- [ ] Data export functionality
- [ ] Data processor agreements signed
- [ ] Breach notification procedure documented

### PCI DSS Compliance (For Payment Data)

- [ ] No credit card data stored
- [ ] Payment gateway: PCI-DSS compliant (Paystack/Flutterwave)
- [ ] HTTPS enforced
- [ ] Regular security testing
- [ ] Documented security policy

### ISO 27001 (Information Security)

- [ ] Documented security procedures
- [ ] Access control policies
- [ ] Incident response plan
- [ ] Business continuity plan
- [ ] Staff security training

---

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)

---

**Last Updated**: February 27, 2026  
**Version**: 2.0.0  
**Status**: Production Ready  
**Review Frequency**: Quarterly
