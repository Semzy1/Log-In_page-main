const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const app = require('../server');

describe('User Registration & Authentication', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shopease-test');
    }
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registration successful');
      expect(res.body.user.email).toBe('john@example.com');
    });

    it('should not register with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          password: '123', // Too weak
          confirmPassword: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should not register with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalidemail',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!'
        });

      expect(res.status).toBe(400);
    });

    it('should not register duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      };

      await User.create(userData);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          confirmPassword: 'SecurePass123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/email.*already/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!'
        });

      expect(res.status).toBe(401);
    });

    it('should not login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Token Generation & Validation', () => {
    it('should generate valid JWT token', async () => {
      const user = await User.create({
        firstName: 'Token',
        lastName: 'Test',
        email: 'token@example.com',
        password: 'SecurePass123!'
      });

      const token = user.generateToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should validate token in protected routes', async () => {
      const user = await User.create({
        firstName: 'Protected',
        lastName: 'User',
        email: 'protected@example.com',
        password: 'SecurePass123!'
      });

      const token = user.generateToken();

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('Password Security', () => {
    it('should hash passwords before storing', async () => {
      const user = await User.create({
        firstName: 'Security',
        lastName: 'Test',
        email: 'security@example.com',
        password: 'PlainPassword123'
      });

      expect(user.password).not.toBe('PlainPassword123');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash
    });

    it('should compare passwords correctly', async () => {
      const user = await User.create({
        firstName: 'Compare',
        lastName: 'Test',
        email: 'compare@example.com',
        password: 'TestPassword123'
      });

      const isMatch = await user.comparePassword('TestPassword123');
      expect(isMatch).toBe(true);

      const isWrong = await user.comparePassword('WrongPassword');
      expect(isWrong).toBe(false);
    });
  });
});
