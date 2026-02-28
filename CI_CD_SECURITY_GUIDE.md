# CI/CD Pipeline & Security Audit Documentation

## Overview

This project includes a comprehensive CI/CD pipeline with automated testing, linting, security auditing, and code quality checks. The pipeline is implemented using GitHub Actions and runs on every push to `main` and `develop` branches, as well as on pull requests.

## CI/CD Workflow Components

### 1. **Test Suite** (`ci-cd.yml`)

#### Testing Strategy
- Runs on Node.js versions: 16.x, 18.x, 20.x
- MongoDB service for integration testing
- Jest test runner with coverage collection

#### Test Files
- `tests/auth.test.js` - User authentication and model tests
- `tests/auth-extended.test.js` - Extended auth, registration, login, and token validation
- `tests/products.test.js` - Product model and CRUD operations
- `tests/orders.test.js` - Order model and order processing
- `tests/security.test.js` - Security middleware and input validation tests
- `tests/setup.js` - Jest setup and environment configuration

#### Running Tests Locally
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- products.test.js

# Run with coverage
npm test -- --coverage
```

#### Coverage Requirements
- **Branches**: 50% minimum
- **Functions**: 50% minimum
- **Lines**: 50% minimum
- **Statements**: 50% minimum

Coverage reports are uploaded to Codecov automatically on successful builds.

### 2. **Security Audit** (`security-audit.yml`)

#### Security Components

##### A. Dependency Vulnerability Scanning
- Runs `npm audit` on both frontend and backend
- Detects vulnerable package dependencies
- Generates detailed audit reports
- Scheduled daily execution for proactive monitoring

##### B. Static Application Security Testing (SAST)
- **Semgrep**: Checks for OWASP Top 10 vulnerabilities
- **Retire.js**: Identifies deprecated JavaScript libraries with known vulnerabilities
- Generates detailed reports of security issues

##### C. Secret & Credential Detection
- **TruffleHog**: Scans entire repository for accidentally committed secrets
- Prevents credentials, API keys, and sensitive data from being pushed

##### D. Container Security Scan
- **Trivy**: Scans filesystem for vulnerabilities
- Runs on main branch pushes
- Uploads results to GitHub Security tab

##### E. CodeQL Analysis
- GitHub's native static analysis engine
- Detects security patterns and potential bugs
- Database of security queries for JavaScript

#### Running Security Audits Locally
```bash
# Audit dependencies
npm audit
cd backend && npm audit

# Install and run Semgrep
npm install -g semgrep
semgrep --config=p/owasp-top-ten --config=p/nodejs backend/

# Check for secret patterns
npm install -g detect-secrets
detect-secrets scan --all-files
```

### 3. **Code Quality & Linting** (`ci-cd.yml`)

#### ESLint Configuration
- **Base config**: `.eslintrc.json`
- **Plugin**: eslint-plugin-security
- **Rules**: Enforces code style and security best practices

#### Linting Rules Focus
- Prevention of unsafe regex patterns
- Buffer allocation security
- Detection of child process vulnerabilities
- CSRF protection
- Password random generation safety
- SQL injection pattern detection

#### Running Linting Locally
```bash
cd backend

# Install linting tools
npm install --save-dev eslint eslint-plugin-security eslint-plugin-no-unsanitized

# Run ESLint
npx eslint . --ext .js

# Fix auto-fixable issues
npx eslint . --ext .js --fix
```

### 4. **Build & Deployment** (`ci-cd.yml`)

#### Build Process
- Runs after all other jobs pass
- Creates deployment artifact
- Includes backend, assets, and package files
- Available for download as workflow artifact

## Security Best Practices Implemented

### A. Authentication & Authorization
- JWT token-based authentication
- Password hashing with bcryptjs
- Token validation on protected routes
- Role-based access control (RBAC)

### B. Input Validation & Sanitization
- Express-validator for input validation
- XSS prevention
- SQL injection prevention
- CORS configuration
- Request size limits

### C. Network Security
- Helmet.js for security headers
- CORS with configurable origins
- Rate limiting on sensitive endpoints
- HTTPS in production

### D. Data Protection
- Password hashing (bcryptjs)
- Sensitive data not logged
- Environment variable management
- Database connection security

### E. Error Handling
- Secure error messages (no stack traces exposed)
- Proper HTTP status codes
- Validation error details

## GitHub Actions Secrets Configuration

To enable full security scanning, configure these secrets in your GitHub repository:

1. **SNYK_TOKEN**: Snyk security scanning token
   - Get from: https://snyk.io
   - Use in workflows for vulnerability scanning

2. **CODECOV_TOKEN**: Codecov integration (optional)
   - Get from: https://codecov.io

## Test Results & Artifacts

### Generated Artifacts
- `test-results-*.txt` - Test output for each Node version
- `coverage/` - Code coverage reports (HTML, LCOV)
- `npm-audit-reports/` - Vulnerability audit logs
- `sast-analysis/` - Security analysis results
- `deployment-package/` - Build artifact for deployment

All artifacts are stored as GitHub Actions artifacts and available for download from the Actions tab.

## Manual Security Audit Instructions

### Local Dependency Check
```bash
# Check for vulnerable dependencies
npm audit
npm audit --production

# Fix vulnerabilities
npm audit fix
npm audit fix --force  # Use with caution
```

### Local SAST with Semgrep
```bash
# Install Semgrep
npm install -g semgrep

# Run OWASP Top 10 check
semgrep --config=p/owasp-top-ten --config=p/nodejs backend/

# Full security check
semgrep --config=p/security-audit backend/
```

### Local Secret Scanning
```bash
# Install detection tool
npm install -g detect-secrets

# Scan repository
detect-secrets scan --all-files

# Audit results
detect-secrets audit .secrets.baseline
```

## Troubleshooting

### Tests Failing
1. Ensure MongoDB is running (for integration tests)
2. Check environment variables in `tests/setup.js`
3. Review test output in GitHub Actions logs
4. Run locally: `npm test`

### Security Scan Failures
1. Audit results vs. actual vulnerabilities:
   - Review GitHub Security tab
   - Check provided remediation steps
2. False positives:
   - Document in `.semgrep.yml` exceptions
   - Use `# nosemgrep` inline comments sparingly
3. Failing audit levels:
   - `npm audit fix` for compatible patches
   - Review dependency updates carefully

### Build Failures
1. Check Node.js version compatibility
2. Review build logs in Actions
3. Ensure all dependencies are listed in `package.json`

## Performance Optimization

### Test Performance
- Parallel test execution (50% max workers)
- Test timeout: 10 seconds per test
- Coverage collection only on success

### CI/CD Efficiency
- Caching of npm dependencies
- Conditional job execution
- Parallel matrix testing

## Future Enhancements

1. **Integration Tests**
   - End-to-end payment processing tests
   - Email service integration tests
   - Third-party API integration tests

2. **Performance Testing**
   - Load testing with Artillery
   - Memory leak detection
   - API response time benchmarks

3. **Advanced Security**
   - DAST with OWASP ZAP
   - SonarQube integration
   - Additional code quality metrics

4. **Deployment Automation**
   - Automated deployment to staging
   - Blue-green deployment strategy
   - Health check endpoints

## Resources

- **Jest Documentation**: https://jestjs.io
- **GitHub Actions**: https://docs.github.com/en/actions
- **OWASP Top 10**: https://owasp.org/www-project-top-ten
- **Semgrep Rules**: https://semgrep.dev/r
- **ESLint Security Plugin**: https://github.com/nodesecurity/eslint-plugin-security

## Support & Questions

For issues or questions about the CI/CD pipeline:
1. Check GitHub Actions logs for detailed error messages
2. Review test coverage reports
3. Consult OWASP guidelines for security issues
4. Check project GitHub Issues for similar problems
