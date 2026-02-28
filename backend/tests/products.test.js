const request = require('supertest');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const app = require('../server');

describe('Product Model & Product Routes', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shopease-test');
    }
  });

  afterEach(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Product Model', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        image: 'test-image.jpg',
        category: 'Electronics',
        stock: 100
      };

      const product = await Product.create(productData);
      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(99.99);
      expect(product.stock).toBe(100);
    });

    it('should not create product without required fields', async () => {
      const invalidProduct = new Product({ name: 'No Price' });
      await expect(invalidProduct.save()).rejects.toThrow();
    });

    it('should update product stock', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test',
        price: 99.99,
        stock: 100
      });

      product.stock = 50;
      await product.save();

      const updated = await Product.findById(product._id);
      expect(updated.stock).toBe(50);
    });
  });

  describe('GET /api/products', () => {
    it('should retrieve all products', async () => {
      await Product.create([
        { name: 'Product 1', price: 10, description: 'Test', stock: 5 },
        { name: 'Product 2', price: 20, description: 'Test', stock: 10 }
      ]);

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should filter products by category', async () => {
      await Product.create([
        { name: 'Electronics Item', category: 'Electronics', price: 100, description: 'Test', stock: 5 },
        { name: 'Clothing Item', category: 'Clothing', price: 50, description: 'Test', stock: 10 }
      ]);

      const res = await request(app).get('/api/products?category=Electronics');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/products (Admin)', () => {
    it('should create a product with authentication', async () => {
      // Create admin user
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'AdminPass123',
        role: 'admin'
      });

      const token = admin.generateToken();

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Product',
          price: 49.99,
          description: 'New test product',
          stock: 25,
          category: 'Electronics'
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Product');
    });

    it('should not create product without authentication', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'New Product',
          price: 49.99,
          description: 'New test product',
          stock: 25
        });

      expect(res.status).toBe(401);
    });
  });
});
