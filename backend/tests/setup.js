// Setup file for Jest - runs before all tests

// Suppress console logs during tests unless explicitly checking them
const originalLog = console.log;
const originalWarn = console.warn;

beforeAll(() => {
  // You can customize console output here if needed
  // For now, we'll let logs through for debugging
});

afterAll(() => {
  // Cleanup
});
