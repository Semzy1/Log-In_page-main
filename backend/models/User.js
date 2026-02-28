const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password by default in queries
  },
  phone: {
    type: String,
    maxlength: [15, 'Phone number cannot exceed 15 characters'],
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    select: false
  },
  cart: {
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isAdmin: 1 });

// Hash password before saving only if it's been modified
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, etc.)
    if (this.password.startsWith('$2')) {
      return next();
    }
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get cart total
userSchema.methods.getCartTotal = async function() {
  await this.populate('cart.items.product', 'price');
  return this.cart.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

// Method to add item to cart
userSchema.methods.addToCart = function(productId, quantity = 1) {
  const cartItemIndex = this.cart.items.findIndex(item =>
    item.product.toString() === productId.toString()
  );

  if (cartItemIndex > -1) {
    this.cart.items[cartItemIndex].quantity += quantity;
  } else {
    this.cart.items.push({
      product: productId,
      quantity,
      addedAt: new Date()
    });
  }

  this.cart.lastUpdated = new Date();
  return this.save();
};

// Method to remove item from cart
userSchema.methods.removeFromCart = function(productId) {
  this.cart.items = this.cart.items.filter(item =>
    item.product.toString() !== productId.toString()
  );
  this.cart.lastUpdated = new Date();
  return this.save();
};

// Method to update cart item quantity
userSchema.methods.updateCartItemQuantity = function(productId, quantity) {
  const cartItem = this.cart.items.find(item =>
    item.product.toString() === productId.toString()
  );

  if (cartItem) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    cartItem.quantity = quantity;
    this.cart.lastUpdated = new Date();
    return this.save();
  }

  throw new Error('Item not found in cart');
};

// Method to clear cart
userSchema.methods.clearCart = function() {
  this.cart.items = [];
  this.cart.lastUpdated = new Date();
  return this.save();
};

// Method to add to wishlist
userSchema.methods.addToWishlist = function(productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    return this.save();
  }
  return this;
};

// Method to remove from wishlist
userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(id => id.toString() !== productId.toString());
  return this.save();
};

// Method to check if product is in wishlist
userSchema.methods.isInWishlist = function(productId) {
  return this.wishlist.some(id => id.toString() === productId.toString());
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

// Transform output to exclude sensitive data
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetTokenExpire;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
