const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Payment details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD', 'EUR', 'GBP']
  },

  // Payment method
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['card', 'bank_transfer', 'flutterwave', 'paystack', 'paypal', 'apple_pay', 'google_pay'],
      message: 'Invalid payment method'
    }
  },

  // Gateway specific fields
  gateway: {
    type: String,
    enum: {
      values: ['flutterwave', 'paystack', 'paypal', 'stripe', 'manual'],
      message: 'Invalid payment gateway'
    },
    required: true
  },
  gatewayReference: {
    type: String,
    trim: true
  },
  gatewayTransactionId: {
    type: String,
    trim: true
  },

  // Status
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
      message: 'Invalid payment status'
    },
    default: 'pending'
  },

  // Card details (masked for security)
  cardDetails: {
    last4: String,
    brand: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb']
    },
    expiryMonth: Number,
    expiryYear: Number
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },

  // Webhook data
  webhookData: {
    type: mongoose.Schema.Types.Mixed
  },

  // Refund information
  refunds: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      maxlength: [500, 'Refund reason cannot exceed 500 characters']
    },
    gatewayRefundId: String,
    refundedAt: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Processing fees
  fees: {
    gateway: {
      type: Number,
      default: 0,
      min: 0
    },
    processing: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // IP and device info
  ipAddress: String,
  userAgent: String,

  // Error information
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },

  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ gateway: 1, gatewayReference: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'cardDetails.last4': 1 });

// Virtual for refund total
paymentSchema.virtual('totalRefunded').get(function() {
  return this.refunds.reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for net amount (after fees and refunds)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.fees.total - this.totalRefunded;
});

// Virtual for is refundable
paymentSchema.virtual('isRefundable').get(function() {
  return ['completed', 'partially_refunded'].includes(this.status) && this.totalRefunded < this.amount;
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Calculate total fees
  this.fees.total = this.fees.gateway + this.fees.processing;

  // Set timestamps based on status
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (['failed', 'cancelled'].includes(this.status) && !this.failedAt) {
      this.failedAt = new Date();
    }
  }

  next();
});

// Static methods
paymentSchema.statics.findByOrder = function(orderId) {
  return this.find({ order: orderId }).sort({ createdAt: -1 });
};

paymentSchema.statics.findByUser = function(userId, limit = 20) {
  return this.find({ user: userId })
    .populate('order', 'orderId total status')
    .sort({ createdAt: -1 })
    .limit(limit);
};

paymentSchema.statics.getPaymentStats = async function(startDate = null, endDate = null) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedAmount: { $sum: '$totalRefunded' },
        gatewayFees: { $sum: '$fees.gateway' }
      }
    }
  ]);

  return stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundedAmount: 0,
    gatewayFees: 0
  };
};

paymentSchema.statics.getGatewayStats = async function(gateway) {
  return this.aggregate([
    { $match: { gateway } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

// Instance methods
paymentSchema.methods.markCompleted = function(gatewayTransactionId = null, metadata = {}) {
  this.status = 'completed';
  this.completedAt = new Date();

  if (gatewayTransactionId) {
    this.gatewayTransactionId = gatewayTransactionId;
  }

  if (metadata && Object.keys(metadata).length > 0) {
    this.metadata = { ...this.metadata, ...metadata };
  }

  return this.save();
};

paymentSchema.methods.markFailed = function(errorCode = null, errorMessage = null, details = {}) {
  this.status = 'failed';
  this.failedAt = new Date();

  if (errorCode || errorMessage) {
    this.error = {
      code: errorCode,
      message: errorMessage,
      details: details
    };
  }

  return this.save();
};

paymentSchema.methods.addRefund = function(amount, reason = '', processedBy = null) {
  if (amount <= 0) {
    throw new Error('Refund amount must be greater than 0');
  }

  if (this.totalRefunded + amount > this.amount) {
    throw new Error('Total refund amount cannot exceed payment amount');
  }

  this.refunds.push({
    amount,
    reason,
    processedBy,
    refundedAt: new Date()
  });

  // Update status
  if (this.totalRefunded + amount >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }

  return this.save();
};

paymentSchema.methods.setCardDetails = function(cardData) {
  this.cardDetails = {
    last4: cardData.last4,
    brand: cardData.brand,
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear
  };
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
