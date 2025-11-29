const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['electronics', 'fashion', 'home', 'sports', 'books', 'beauty', 'toys', 'automotive']).withMessage('Invalid category'),
  query('brand').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Brand name cannot exceed 50 characters'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
  query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Search query cannot exceed 100 characters'),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'newest', 'oldest', 'rating', 'featured']).withMessage('Invalid sort option'),
  query('featured').optional().isBoolean().withMessage('Featured must be a boolean value')
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
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { category, brand, minPrice, maxPrice, search, sort, featured } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (featured === 'true') filter.featured = true;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'rating':
          sortOption = { 'reviews.averageRating': -1 };
          break;
        case 'featured':
          sortOption = { featured: -1, createdAt: -1 };
          break;
      }
    }

    const products = await Product.find(filter)
      .select('-reviews') // Exclude reviews for performance
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        products,
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
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving products'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories with counts and min prices
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          minPrice: 1,
          maxPrice: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving categories'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
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

    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find({ status: 'active', featured: true })
      .select('-reviews') // Exclude reviews for performance
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving featured products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Valid product ID required')
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving product'
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product (Admin only)
// @access  Private/Admin
router.post('/', [
  authenticate,
  requireAdmin,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and cannot exceed 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('category').isIn(['electronics', 'fashion', 'home', 'sports', 'books', 'beauty', 'toys', 'automotive']).withMessage('Invalid category'),
  body('brand').trim().isLength({ min: 1, max: 50 }).withMessage('Brand is required and cannot exceed 50 characters'),
  body('sku').trim().isLength({ min: 1, max: 50 }).withMessage('SKU is required and cannot exceed 50 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
  body('inventory.quantity').isInt({ min: 0 }).withMessage('Inventory quantity must be a non-negative integer'),
  body('inventory.trackInventory').optional().isBoolean().withMessage('Track inventory must be a boolean'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 30 }).withMessage('Each tag cannot exceed 30 characters')
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

    const { title, description, price, category, brand, sku, images, inventory, featured, tags } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const product = new Product({
      title,
      description,
      price,
      category,
      brand,
      sku,
      images: images || [],
      inventory: {
        quantity: inventory.quantity,
        trackInventory: inventory.trackInventory !== false
      },
      featured: featured || false,
      tags: tags || [],
      status: 'active'
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product (Admin only)
// @access  Private/Admin
router.put('/:id', [
  authenticate,
  requireAdmin,
  param('id').isMongoId().withMessage('Valid product ID required'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').optional().isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('category').optional().isIn(['electronics', 'fashion', 'home', 'sports', 'books', 'beauty', 'toys', 'automotive']).withMessage('Invalid category'),
  body('brand').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Brand cannot exceed 50 characters'),
  body('sku').optional().trim().isLength({ min: 1, max: 50 }).withMessage('SKU cannot exceed 50 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
  body('inventory.quantity').optional().isInt({ min: 0 }).withMessage('Inventory quantity must be a non-negative integer'),
  body('inventory.trackInventory').optional().isBoolean().withMessage('Track inventory must be a boolean'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('status').optional().isIn(['active', 'inactive', 'discontinued']).withMessage('Invalid status'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 30 }).withMessage('Each tag cannot exceed 30 characters')
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const allowedFields = ['title', 'description', 'price', 'category', 'brand', 'sku', 'images', 'inventory', 'featured', 'status', 'tags'];
    const updates = {};

    // Only update provided fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'inventory') {
          updates.inventory = {
            ...product.inventory.toObject(),
            ...req.body.inventory
          };
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    // Check if SKU is being changed and if it already exists
    if (updates.sku && updates.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: updates.sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    Object.assign(product, updates);
    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Admin only)
// @access  Private/Admin
router.delete('/:id', [
  authenticate,
  requireAdmin,
  param('id').isMongoId().withMessage('Valid product ID required')
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting status to inactive
    product.status = 'inactive';
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
});

module.exports = router;
