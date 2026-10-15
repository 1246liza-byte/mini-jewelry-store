const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/orders
// @desc     Create a new order
// @access   Private
router.post(
    '/',
    protect,
    [
        body('orderItems').isArray({ min: 1 }).withMessage('Order must have at least one item'),
        body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
        body('shippingAddress.address').notEmpty().withMessage('Address is required'),
        body('shippingAddress.city').notEmpty().withMessage('City is required'),
        body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
        body('shippingAddress.country').notEmpty().withMessage('Country is required'),
        body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        try {
            const { orderItems, shippingAddress, paymentMethod } = req.body;

            // Server-side validation: verify products exist, prices, and stock
            const validatedItems = [];
            let itemsPrice = 0;

            for (const item of orderItems) {
                const product = await Product.findById(item.product);

                if (!product) {
                    return res.status(400).json({ message: `Product not found: ${item.name}` });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
                    });
                }

                // Use server-side price, never trust client price
                const price = product.price;
                itemsPrice += price * item.quantity;

                validatedItems.push({
                    product: product._id,
                    name: product.name,
                    price,
                    quantity: item.quantity,
                    image: product.images[0] || '',
                });
            }

            const shippingPrice = itemsPrice > 100 ? 0 : 10;
            const totalPrice = itemsPrice + shippingPrice;

            const order = await Order.create({
                user: req.user._id,
                orderItems: validatedItems,
                shippingAddress,
                paymentMethod: paymentMethod || 'Cash on Delivery',
                itemsPrice,
                shippingPrice,
                totalPrice,
            });

            // Decrement stock for each product
            for (const item of validatedItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity },
                });
            }

            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// @route   GET /api/orders/myorders
// @desc     Get logged-in user's orders
// @access   Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders
// @desc     Get all orders (admin)
// @access   Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc     Get order by ID
// @access   Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow the order owner or an admin to view
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/orders/:id/status
// @desc     Update order status (admin)
// @access   Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { status } = req.body;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        order.status = status;

        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        if (status === 'Cancelled') {
            // Restore stock
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                });
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;