// Setup file for Jest - runs before all tests

// Set environment variables for testing BEFORE any modules load
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/shopease-test';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.NOTIFY_EMAIL = 'admin@example.com';
process.env.PORT = '5001';

// Suppress console logs during tests
const originalLog = console.log;
const originalWarn = console.warn;

beforeAll(() => {
  // Optionally suppress verbose logs during tests
  // console.log = jest.fn();
  // console.warn = jest.fn();
});

afterAll(() => {
  // Restore logs
  console.log = originalLog;
  console.warn = originalWarn;
});
