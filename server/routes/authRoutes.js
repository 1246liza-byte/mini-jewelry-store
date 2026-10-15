const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @route   POST /api/auth/register
// @desc     Register a new user
// @access   Public
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required').trim(),
        body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        try {
            const { name, email, password, phone, address } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            const user = await User.create({
                name,
                email,
                password,
                phone,
                address,
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// @route   POST /api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email }).select('+password');

            if (!user || !(await user.matchPassword(password))) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// @route   GET /api/auth/me
// @desc     Get current logged-in user profile
// @access   Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/auth/profile
// @desc     Update user profile
// @access   Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;

        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;