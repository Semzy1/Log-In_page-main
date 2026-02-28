# Backend Testing Guide

## Test Structure Overview

```
backend/tests/
├── setup.js                    # Jest configuration and environment setup
├── auth.test.js                # Core authentication tests
├── auth-extended.test.js       # Extended auth scenarios
├── products.test.js            # Product model and routes
├── orders.test.js              # Order model and routes
└── security.test.js            # Security middleware tests
```

## Running Tests

### Quick Start
```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run in watch mode (re-run on file changes)
npm run test:watch

# Run specific test file
npm test auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should register"
```

### CI/CD Test Execution
```bash
# Run as CI (no watch, with coverage)
npm run test:ci

# Full security verification
npm run security:full
```

## Test Categories

### 1. Authentication Tests (`auth.test.js` & `auth-extended.test.js`)

#### User Registration
- Valid registration with all required fields
- Weak password rejection
- Invalid email rejection
- Duplicate email prevention
- Proper error messaging

#### Login
- Successful login with correct credentials
- Failed login with wrong password
- User not found handling
- Missing credentials validation
- Rate limiting

#### Password Security
- Password hashing before storage
- Password comparison accuracy
- Incorrect password rejection
- No plain text password exposure

#### Token Management
- JWT token generation
- Token validation on protected routes
- Invalid token rejection
- Token expiration handling
- Refresh token mechanism

### 2. Product Tests (`products.test.js`)

#### Product Model
- Create products with valid data
- Reject invalid data
- Update product information
- Delete products
- Query by category/filters

#### Product Routes
- GET /api/products - Retrieve all products
- GET /api/products?category=X - Filter by category
- POST /api/products - Create (admin only)
- PUT /api/products/:id - Update (admin only)
- DELETE /api/products/:id - Delete (admin only)

### 3. Order Tests (`orders.test.js`)

#### Order Model
- Create orders with valid data
- Order status management
- Total price calculation
- Item quantity tracking
- Order history

#### Order Routes
- GET /api/orders - User's orders
- POST /api/orders - Create order
- PUT /api/orders/:id - Update order
- DELETE /api/orders/:id - Cancel order

### 4. Security Tests (`security.test.js`)

#### Security Headers
- Helmet middleware implementation
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

#### CORS Configuration
- Allowed origins verification
- Credentials handling
- Preflight requests
- Method and header restrictions

#### Input Validation
- SQL injection prevention
- XSS attack prevention
- Input sanitization
- Type validation
- Length validation

#### Rate Limiting
- Auth endpoint limits (5 requests/15 min)
- Global limits (100 requests/15 min)
- Health check exemption
- Correct rate limit headers

#### Authentication Middleware
- Missing authorization rejection
- Invalid format rejection
- Expired token handling
- Valid token acceptance

## Writing New Tests

### Test Template
```javascript
const request = require('supertest');
const app = require('../server');
const Model = require('../models/ModelName');

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup: connect to database
  });

  beforeEach(async () => {
    // Reset state before each test
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  afterAll(async () => {
    // Teardown: close connections
  });

  describe('Specific Functionality', () => {
    it('should do something specific', async () => {
      // Arrange: prepare test data
      const testData = { /* ... */ };

      // Act: execute the functionality
      const response = await request(app)
        .post('/api/endpoint')
        .send(testData);

      // Assert: verify the result
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Success');
    });
  });
});
```

### Best Practices
1. **Use descriptive test names** - Should read like a sentence
2. **Arrange-Act-Assert pattern** - Clear test structure
3. **Test one thing per test** - Single responsibility
4. **Mock external dependencies** - Don't test other systems
5. **Use setup/teardown** - Keep tests isolated
6. **Avoid hardcoded values** - Use test data builders
7. **Test edge cases** - Not just happy path
8. **Test error scenarios** - Invalid input, failures
9. **Keep tests fast** - < 10 seconds per test
10. **Test behavior, not implementation** - Resist refactoring changes

## Coverage Goals

### Coverage Metrics
```
Statements   : 50% minimum, 75% target
Branches     : 50% minimum, 70% target
Functions    : 50% minimum, 75% target
Lines        : 50% minimum, 75% target
```

### Viewing Coverage
```bash
# Generate coverage report
npm test -- --coverage

# Open HTML coverage report
# Coverage report at: backend/coverage/lcov-report/index.html
open coverage/lcov-report/index.html

# Check specific file coverage
npm test -- --coverage routes/auth.js
```

## Common Test Scenarios

### Testing Protected Routes
```javascript
it('should require authentication', async () => {
  const res = await request(app)
    .get('/api/protected-route');
  
  expect(res.status).toBe(401);
});

it('should allow authenticated users', async () => {
  const user = await User.create(userData);
  const token = user.generateToken();
  
  const res = await request(app)
    .get('/api/protected-route')
    .set('Authorization', `Bearer ${token}`);
  
  expect(res.status).toBe(200);
});
```

### Testing with Database
```javascript
beforeEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
});

it('should retrieve created items', async () => {
  const product = await Product.create({
    name: 'Test',
    price: 99.99
  });
  
  const retrieved = await Product.findById(product._id);
  expect(retrieved.name).toBe('Test');
});
```

### Testing Error Responses
```javascript
it('should return validation errors', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'invalid-email',
      password: 'weak'
    });
  
  expect(res.status).toBe(400);
  expect(res.body.errors).toBeDefined();
  expect(Array.isArray(res.body.errors)).toBe(true);
});
```

## Performance Testing Considerations

### Load Testing
```bash
# Install artillery globally
npm install -g artillery

# Create load test configuration
# Then run: artillery run config.yml
```

### Stress Testing
```javascript
// Large payload testing
it('should handle large payloads', async () => {
  const largeData = { /* large object */ };
  const res = await request(app)
    .post('/api/endpoint')
    .send(largeData);
  
  expect([200, 413]).toContain(res.status);
});
```

## Debugging Tests

### Run Single Test
```bash
# Run only specific describe block
npm test -- --testNamePattern="User Model"

# Run only specific test
npm test -- --testNamePattern="should hash password"
```

### Debug with Node Inspector
```bash
# Run tests with debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Open chrome://inspect in Chrome
# Click "inspect" on the test process
```

### Verbose Output
```bash
# Increase verbosity
npm test -- --verbose

# Show individual test results
npm test -- --listTests
```

## Continuous Integration

### GitHub Actions Integration
- Tests run automatically on push and PR
- Multiple Node versions tested in parallel
- Coverage reports uploaded to Codecov
- artifacts preserved for review

### View Results
1. Go to repository "Actions" tab
2. Click the workflow run
3. View test results and artifacts
4. Download coverage reports

## Security Testing

### Key Security Tests Included
✅ Authentication and authorization
✅ Input validation and sanitization
✅ CORS and security headers
✅ Rate limiting
✅ Password hashing
✅ Token validation
✅ SQL injection prevention
✅ XSS attack prevention

### Adding Security Tests
```javascript
describe('Security', () => {
  it('should prevent SQL injection', async () => {
    const malicious = "' OR '1'='1";
    const res = await request(app)
      .post('/api/login')
      .send({ email: malicious, password: malicious });
    
    expect(res.status).toBe(400);
  });
});
```

## Troubleshooting

### Issue: Tests timeout
**Solution**: Increase timeout in jest.config.js
```javascript
testTimeout: 15000  // in milliseconds
```

### Issue: MongoDB connection error
**Solution**: Ensure MongoDB is running or use test database
```bash
# Start MongoDB
mongod --dbpath /path/to/test/db

# Or use in-memory MongoDB
npm install -D mongodb-memory-server
```

### Issue: Port already in use
**Solution**: Use different port for test server
```javascript
const PORT = process.env.PORT || 5001;
```

### Issue: Tests pass locally but fail in CI
**Solution**: Check environment variables in CI config
```bash
# Ensure all required env vars are set
# Update .github/workflows/ci-cd.yml
```

## Resources

- [Jest Documentation](https://jestjs.io)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide)

## Questions?

For testing-related questions:
1. Check test files for examples
2. Review Jest documentation
3. Consult OWASP testing guidelines
4. Open GitHub issue for problems
