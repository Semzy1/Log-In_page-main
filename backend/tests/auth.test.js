const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('User Model & Auth Routes', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shopease-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    // Clear users collection after each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  // ============== User Model Tests ==============

  describe('User Model', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123'
      });

      await user.save();
      expect(user.password).not.toBe('TestPassword123');
      expect(user.password).toHaveLength(60); // bcrypt hash length
    });

    it('should compare passwords correctly', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123'
      });

      await user.save();
      const isMatch = await user.comparePassword('TestPassword123');
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password comparison', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123'
      });

      await user.save();
      const isMatch = await user.comparePassword('WrongPassword');
      expect(isMatch).toBe(false);
    });

    it('should add and remove items from cart', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123'
      });

      await user.save();

      // Add to cart (product ID is mock)
      const productId = new mongoose.Types.ObjectId();
      await user.addToCart(productId, 2);

      expect(user.cart.items).toHaveLength(1);
      expect(user.cart.items[0].quantity).toBe(2);
    });

    it('should clear cart', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123'
      });

      await user.save();

      const productId = new mongoose.Types.ObjectId();
      await user.addToCart(productId, 2);
      await user.clearCart();

      expect(user.cart.items).toHaveLength(0);
    });

    it('should add and remove from wishlist', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123'
      });

      await user.save();

      const productId = new mongoose.Types.ObjectId();
      await user.addToWishlist(productId);

      expect(user.wishlist).toContain(productId);

      await user.removeFromWishlist(productId);
      expect(user.wishlist).not.toContain(productId);
    });

    it('should exclude password in toJSON', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123'
      });

      const json = user.toJSON();
      expect(json).not.toHaveProperty('password');
    });
  });

  // ============== Auth Endpoints Tests ==============

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'SecurePass123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'SecurePass123'
        });

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'jane@example.com',
          password: 'AnotherPass123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate password strength', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'weak' // Too weak
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'invalid-email',
          password: 'SecurePass123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'SecurePass123'
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'SecurePass123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should validate email format on login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
