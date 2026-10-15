const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/products
// @desc     Get all products with search, filter, pagination
// @access   Public
router.get('/', async (req, res) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.page) || 1;
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};
        const category = req.query.category ? { category: req.query.category } : {};
        const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
        const maxPrice = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};

        const query = { ...keyword, ...category, ...minPrice, ...maxPrice };

        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            totalProducts: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/categories
// @desc     Get all unique categories
// @access   Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/featured
// @desc     Get featured products
// @access   Public
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.find({ featured: true }).limit(8);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/:id
// @desc     Get single product by ID
// @access   Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/products
// @desc     Create a new product
// @access   Private/Admin
router.post(
    '/',
    protect,
    admin,
    [
        body('name').notEmpty().withMessage('Product name is required'),
        body('description').notEmpty().withMessage('Product description is required'),
        body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('category').notEmpty().withMessage('Category is required'),
        body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        try {
            const { name, description, price, category, images, stock, featured, material } = req.body;

            const product = await Product.create({
                name,
                description,
                price,
                category,
                images: images && images.length > 0 ? images : [],
                stock,
                featured: featured || false,
                material,
            });

            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// @route   PUT /api/products/:id
// @desc     Update a product
// @access   Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, description, price, category, images, stock, featured, material } = req.body;

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        product.category = category || product.category;
        product.images = images && images.length > 0 ? images : product.images;
        product.stock = stock !== undefined ? stock : product.stock;
        product.featured = featured !== undefined ? featured : product.featured;
        product.material = material || product.material;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc     Delete a product
// @access   Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;