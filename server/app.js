const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const seedData = require('./config/seed');
const User = require('./models/User');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// On Vercel, the filesystem is read-only/ephemeral, so local disk uploads
// cannot be served. Cloudinary is the only persistent image store there.
const isVercel = !!process.env.VERCEL;

// Connect to MongoDB, then auto-seed if the database is empty so the app
// (including login) works out of the box.
// This is only run when the server is started directly (not on Vercel).
const initDatabase = async () => {
    await connectDB();
    try {
        const userCount = await User.estimatedDocumentCount();
        if (userCount === 0) {
            console.log('Empty database detected — seeding default data...');
            await seedData();
            console.log('Auto-seed complete.');
        }
    } catch (err) {
        console.error(`Auto-seed skipped: ${err.message}`);
    }
};

const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Rosé & Gold API is running' });
});

// Database connection guard
// If MongoDB is not connected, return a clean 503 message instead of letting
// Mongoose throw a cryptic "Cannot call ... before initial connection is complete"
// error (which happens because bufferCommands is disabled). This lets the
// frontend render and show a friendly message while the DB is unavailable.
app.use('/api', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Database is not connected yet. Please check your MongoDB Atlas connection string and try again.',
        });
    }
    next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Serve locally uploaded images (fallback when Cloudinary is not configured).
// On Vercel the filesystem is read-only/ephemeral, so this is skipped.
if (!isVercel) {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = { app, initDatabase };