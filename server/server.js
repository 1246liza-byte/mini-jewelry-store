const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Connect to MongoDB
connectDB();

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

// Serve locally uploaded images (fallback when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files in production (if frontend is built)
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientBuildPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});