const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            // Do not buffer model queries while the connection is down:
            // API endpoints respond immediately with a 500/error instead of
            // hanging for the default 30s, so the frontend UI renders quickly.
            bufferCommands: false,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Keep the server running and retry until MongoDB is reachable
        // (e.g. MongoDB Atlas is connected). This lets the frontend UI
        // load even before a database is configured. Log once, then retry
        // quietly every 30 seconds so the terminal is not spammed.
        console.error(`MongoDB connection error: ${error.message}`);
        console.error('MongoDB unavailable — retrying connection in 30 seconds...');
        setTimeout(connectDB, 30000);
    }
};

module.exports = connectDB;