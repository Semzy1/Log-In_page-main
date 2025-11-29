const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    maxlength: 15,
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
        min: 1
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
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
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

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Transform output to exclude password
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
