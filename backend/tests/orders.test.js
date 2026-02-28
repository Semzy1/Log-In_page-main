const request = require('supertest');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const app = require('../server');

describe('Order Model & Order Routes', () => {
  let user, product;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shopease-test');
    }
  });

  beforeEach(async () => {
    // Create test user
    user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testorder@example.com',
      password: 'TestPassword123'
    });

    // Create test product
    product = await Product.create({
      name: 'Test Product',
      price: 99.99,
      description: 'Test product for orders',
      stock: 100,
      category: 'Electronics'
    });
  });

  afterEach(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Order Model', () => {
    it('should create an order with valid data', async () => {
      const orderData = {
        userId: user._id,
        items: [{ productId: product._id, quantity: 2, price: product.price }],
        totalPrice: product.price * 2,
        status: 'pending',
        shippingAddress: '123 Test St, Test City'
      };

      const order = await Order.create(orderData);
      expect(order.userId).toEqual(user._id);
      expect(order.items.length).toBe(1);
      expect(order.totalPrice).toBe(199.98);
      expect(order.status).toBe('pending');
    });

    it('should update order status', async () => {
      const order = await Order.create({
        userId: user._id,
        items: [{ productId: product._id, quantity: 1, price: product.price }],
        totalPrice: product.price,
        status: 'pending',
        shippingAddress: '123 Test St'
      });

      order.status = 'shipped';
      await order.save();

      const updated = await Order.findById(order._id);
      expect(updated.status).toBe('shipped');
    });
  });

  describe('GET /api/orders', () => {
    it('should retrieve user orders with authentication', async () => {
      const order = await Order.create({
        userId: user._id,
        items: [{ productId: product._id, quantity: 1, price: product.price }],
        totalPrice: product.price,
        status: 'pending',
        shippingAddress: '123 Test St'
      });

      const token = user.generateToken();
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should not retrieve orders without authentication', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/orders', () => {
    it('should create an order with valid data', async () => {
      const token = user.generateToken();

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: product._id, quantity: 2 }],
          totalPrice: product.price * 2,
          shippingAddress: '456 Order St',
          paymentMethod: 'card'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
    });

    it('should not create order with invalid shipping address', async () => {
      const token = user.generateToken();

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: product._id, quantity: 1 }],
          totalPrice: product.price,
          shippingAddress: '', // Invalid
          paymentMethod: 'card'
        });

      expect(res.status).toBe(400);
    });
  });
});
