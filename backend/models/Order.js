const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    itemTotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: true,
      maxlength: 15
    },
    address: {
      type: String,
      required: true,
      maxlength: 200
    },
    city: {
      type: String,
      required: true,
      maxlength: 50
    },
    state: {
      type: String,
      required: true,
      maxlength: 50
    },
    postalCode: {
      type: String,
      maxlength: 10
    }
  },
  billingAddress: {
    firstName: {
      type: String,
      maxlength: 50
    },
    lastName: {
      type: String,
      maxlength: 50
    },
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      maxlength: 15
    },
    address: {
      type: String,
      maxlength: 200
    },
    city: {
      type: String,
      maxlength: 50
    },
    state: {
      type: String,
      maxlength: 50
    },
    postalCode: {
      type: String,
      maxlength: 10
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank_transfer', 'flutterwave', 'paystack']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    maxlength: 100
  },
  notes: {
    type: String,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  cancelledAt: Date,
  shippedAt: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'items.product': 1 });

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$pricing.total' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalValue: 1,
        _id: 0
      }
    }
  ]);
};

// Pre-save middleware to set timestamps based on status
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'shipped' && !this.shippedAt) {
      this.shippedAt = new Date();
    } else if (this.status === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    } else if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
