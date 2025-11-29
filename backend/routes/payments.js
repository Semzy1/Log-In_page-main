const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const axios = require('axios');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/initiate
// @desc    Initiate payment for an order
// @access  Private
router.post('/initiate', [
  authenticate,
  body('orderId').isMongoId().withMessage('Valid order ID required'),
  body('method').isIn(['flutterwave', 'paystack', 'card', 'bank_transfer']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, method } = req.body;
    const user = req.user;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order is pending payment
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order is not eligible for payment'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ order: orderId, status: { $in: ['pending', 'processing', 'completed'] } });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already initiated for this order'
      });
    }

    // Create payment record
    const payment = new Payment({
      order: orderId,
      user: user._id,
      amount: order.pricing.total,
      currency: 'NGN',
      method,
      gateway: method === 'card' ? 'flutterwave' : method,
      status: 'pending'
    });

    await payment.save();

    let paymentData = {
      paymentId: payment._id,
      amount: payment.amount,
      currency: payment.currency,
      orderId: order.orderId
    };

    // Handle different payment methods
    if (method === 'flutterwave') {
      const flutterwaveConfig = {
        public_key: process.env.FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: `shopease-${orderId}-${Date.now()}`,
        amount: payment.amount,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
          email: user.email,
          phone_number: user.phone || '',
          name: `${user.firstName} ${user.lastName}`
        },
        customizations: {
          title: 'ShopEase Payment',
          description: `Payment for Order ${order.orderId}`,
          logo: process.env.COMPANY_LOGO || 'https://via.placeholder.com/150'
        },
        callback: `${process.env.FRONTEND_URL}/payment/callback?paymentId=${payment._id}`,
        redirect_url: `${process.env.FRONTEND_URL}/payment/success?paymentId=${payment._id}`
      };

      payment.gatewayReference = flutterwaveConfig.tx_ref;
      await payment.save();

      paymentData.flutterwave = flutterwaveConfig;
    } else if (method === 'paystack') {
      const paystackConfig = {
        key: process.env.PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: payment.amount * 100, // Paystack expects kobo
        currency: 'NGN',
        ref: `shopease-${orderId}-${Date.now()}`,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback?paymentId=${payment._id}`,
        metadata: {
          orderId: order.orderId,
          paymentId: payment._id
        }
      };

      payment.gatewayReference = paystackConfig.ref;
      await payment.save();

      paymentData.paystack = paystackConfig;
    } else if (method === 'bank_transfer') {
      // Generate bank transfer details
      const bankDetails = {
        bankName: 'ShopEase Bank',
        accountNumber: '1234567890',
        accountName: 'ShopEase Payments',
        reference: `TXN-${orderId}-${Date.now()}`,
        amount: payment.amount,
        instructions: 'Please include the reference number in your transfer description'
      };

      payment.gatewayReference = bankDetails.reference;
      payment.status = 'processing';
      await payment.save();

      paymentData.bankTransfer = bankDetails;
    }

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentData
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error initiating payment'
    });
  }
});

// @route   POST /api/payments/verify/:paymentId
// @desc    Verify payment status
// @access  Private
router.post('/verify/:paymentId', [
  authenticate,
  param('paymentId').isMongoId().withMessage('Valid payment ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const payment = await Payment.findById(req.params.paymentId).populate('order');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns the payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let verificationResult = { verified: false, message: 'Payment verification failed' };

    // Verify based on gateway
    if (payment.gateway === 'flutterwave') {
      verificationResult = await verifyFlutterwavePayment(payment);
    } else if (payment.gateway === 'paystack') {
      verificationResult = await verifyPaystackPayment(payment);
    } else if (payment.method === 'bank_transfer') {
      // Manual verification for bank transfers
      verificationResult = { verified: false, message: 'Bank transfer payments require manual verification' };
    }

    if (verificationResult.verified) {
      // Update payment and order status
      await payment.markCompleted(verificationResult.transactionId, verificationResult.metadata);

      // Update order status
      payment.order.status = 'processing';
      await payment.order.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          payment: {
            id: payment._id,
            status: payment.status,
            amount: payment.amount
          },
          order: {
            id: payment.order._id,
            status: payment.order.status
          }
        }
      });
    } else {
      await payment.markFailed(null, verificationResult.message);

      res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment'
    });
  }
});

// @route   GET /api/payments
// @desc    Get user's payments
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('order', 'orderId total status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving payments'
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private
router.get('/:id', [
  authenticate,
  param('id').isMongoId().withMessage('Valid payment ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const payment = await Payment.findById(req.params.id).populate('order');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns the payment or is admin
    if (payment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving payment'
    });
  }
});

// @route   POST /api/payments/webhook/flutterwave
// @desc    Flutterwave webhook handler
// @access  Public
router.post('/webhook/flutterwave', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== secretHash) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const payload = JSON.parse(req.body);
    const { data } = payload;

    if (data.status === 'successful') {
      const payment = await Payment.findOne({ gatewayReference: data.tx_ref });

      if (payment && payment.status === 'pending') {
        await payment.markCompleted(data.id, {
          flutterwaveData: data,
          amount: data.amount,
          currency: data.currency
        });

        // Update order status
        const order = await Order.findById(payment.order);
        if (order) {
          order.status = 'processing';
          await order.save();
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// @route   POST /api/payments/webhook/paystack
// @desc    Paystack webhook handler
// @access  Public
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = require('crypto').createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const payment = await Payment.findOne({ gatewayReference: data.reference });

      if (payment && payment.status === 'pending') {
        await payment.markCompleted(data.id, {
          paystackData: data,
          amount: data.amount / 100, // Convert from kobo
          currency: data.currency
        });

        // Update order status
        const order = await Order.findById(payment.order);
        if (order) {
          order.status = 'processing';
          await order.save();
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// Helper functions for payment verification
async function verifyFlutterwavePayment(payment) {
  try {
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${payment.gatewayReference}/verify`, {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      }
    });

    const { data } = response.data;

    if (data.status === 'successful' && data.amount >= payment.amount) {
      return {
        verified: true,
        transactionId: data.id,
        metadata: {
          flutterwaveData: data,
          amount: data.amount,
          currency: data.currency
        }
      };
    }

    return { verified: false, message: 'Payment verification failed' };
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    return { verified: false, message: 'Payment verification service unavailable' };
  }
}

async function verifyPaystackPayment(payment) {
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${payment.gatewayReference}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const { data } = response.data;

    if (data.status && data.data.status === 'success' && data.data.amount / 100 >= payment.amount) {
      return {
        verified: true,
        transactionId: data.data.id,
        metadata: {
          paystackData: data.data,
          amount: data.data.amount / 100,
          currency: data.data.currency
        }
      };
    }

    return { verified: false, message: 'Payment verification failed' };
  } catch (error) {
    console.error('Paystack verification error:', error);
    return { verified: false, message: 'Payment verification service unavailable' };
  }
}

module.exports = router;
