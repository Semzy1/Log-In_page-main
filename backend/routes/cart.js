const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.items.product',
      select: 'title price images category brand inventory status'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out invalid cart items and calculate totals
    const validCartItems = [];
    let subtotal = 0;
    let totalItems = 0;

    for (const item of user.cart.items) {
      const product = item.product;
      if (product && product.status === 'active' && (product.inventory.quantity > 0 || !product.inventory.trackInventory)) {
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        totalItems += item.quantity;

        validCartItems.push({
          product: {
            _id: product._id,
            title: product.title,
            price: product.price,
            images: product.images,
            category: product.category,
            brand: product.brand,
            inventory: product.inventory
          },
          quantity: item.quantity,
          itemTotal: itemTotal
        });
      }
    }

    // Update user's cart if there were invalid items
    if (validCartItems.length !== user.cart.items.length) {
      user.cart.items = validCartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));
      user.cart.lastUpdated = new Date();
      await user.save();
    }

    const tax = subtotal * 0.075; // 7.5% VAT for Nigeria
    const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping over ₦50,000
    const total = subtotal + tax + shipping;

    res.json({
      success: true,
      data: {
        items: validCartItems,
        summary: {
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          shipping: shipping.toFixed(2),
          total: total.toFixed(2),
          totalItems
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving cart'
    });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', [
  authenticate,
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
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

    const { productId, quantity } = req.body;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check inventory
    if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.inventory.quantity} items available in stock`
      });
    }

    const user = await User.findById(req.user._id);

    // Check if product already in cart
    const existingItemIndex = user.cart.items.findIndex(item =>
      item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = user.cart.items[existingItemIndex].quantity + quantity;

      // Check inventory for new total
      if (product.inventory.trackInventory && product.inventory.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.inventory.quantity - user.cart.items[existingItemIndex].quantity} additional items available`
        });
      }

      user.cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      user.cart.items.push({
        product: productId,
        quantity
      });
    }

    user.cart.lastUpdated = new Date();
    await user.save();

    // Populate the added/updated item for response
    await user.populate({
      path: 'cart.items.product',
      select: 'title price images category brand inventory'
    });

    const addedItem = user.cart.items.find(item => item.product._id.toString() === productId);

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        item: {
          product: addedItem.product,
          quantity: addedItem.quantity,
          itemTotal: addedItem.product.price * addedItem.quantity
        }
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding item to cart'
    });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put('/:productId', [
  authenticate,
  param('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 0, max: 99 }).withMessage('Quantity must be between 0 and 99')
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

    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(req.user._id);

    const itemIndex = user.cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      // Remove item from cart
      user.cart.items.splice(itemIndex, 1);
    } else {
      // Check product availability and inventory
      const product = await Product.findById(productId);
      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Product is no longer available'
        });
      }

      if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.inventory.quantity} items available in stock`
        });
      }

      user.cart.items[itemIndex].quantity = quantity;
    }

    user.cart.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating cart'
    });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:productId', [
  authenticate,
  param('productId').isMongoId().withMessage('Valid product ID is required')
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

    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    const itemIndex = user.cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    user.cart.items.splice(itemIndex, 1);
    user.cart.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing item from cart'
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart.items = [];
    user.cart.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing cart'
    });
  }
});

// @route   POST /api/cart/merge
// @desc    Merge guest cart with user cart (for login)
// @access  Private
router.post('/merge', [
  authenticate,
  body('guestCart').isArray().withMessage('Guest cart must be an array'),
  body('guestCart.*.productId').isMongoId().withMessage('Valid product ID required'),
  body('guestCart.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive')
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

    const { guestCart } = req.body;
    const user = await User.findById(req.user._id);

    // Process each guest cart item
    for (const guestItem of guestCart) {
      const product = await Product.findById(guestItem.productId);

      if (!product || product.status !== 'active') {
        continue; // Skip unavailable products
      }

      if (product.inventory.trackInventory && product.inventory.quantity < guestItem.quantity) {
        continue; // Skip if insufficient inventory
      }

      // Check if item already in user cart
      const existingItemIndex = user.cart.items.findIndex(
        item => item.product.toString() === guestItem.productId
      );

      if (existingItemIndex > -1) {
        // Update quantity (take the higher quantity)
        const currentQty = user.cart.items[existingItemIndex].quantity;
        const newQty = Math.max(currentQty, guestItem.quantity);

        if (product.inventory.trackInventory && product.inventory.quantity >= newQty) {
          user.cart.items[existingItemIndex].quantity = newQty;
        }
      } else {
        // Add new item
        user.cart.items.push({
          product: guestItem.productId,
          quantity: guestItem.quantity
        });
      }
    }

    user.cart.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Cart merged successfully'
    });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error merging cart'
    });
  }
});

module.exports = router;
