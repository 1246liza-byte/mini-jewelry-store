const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Holds the embedded MongoDB instance (used as an offline fallback) so we
// reuse the same one across reconnects instead of starting a new server.
let memoryServer = null;

// On Vercel, the filesystem is read-only/ephemeral and devDependencies are
// not installed, so the local embedded MongoDB fallback is never available.
// We detect Vercel via the VERCEL env var and skip the fallback entirely.
const isVercel = !!process.env.VERCEL;

// Start (or reuse) a local embedded MongoDB that persists data to disk.
// This lets the app run even when a remote database (e.g. MongoDB Atlas)
// is unreachable — for example when the current IP is not whitelisted.
async function startLocalMongo() {
    if (!memoryServer) {
        // Lazy-require so the app still boots if the package is missing.
        // On Vercel (production), devDependencies are not installed, so this
        // package may not be available. We handle that gracefully below.
        let MongoMemoryServer;
        try {
            ({ MongoMemoryServer } = require('mongodb-memory-server'));
        } catch (err) {
            console.error('mongodb-memory-server is not installed. Skipping local fallback.');
            throw new Error('Local MongoDB fallback unavailable: mongodb-memory-server is not installed.');
        }
        const dbPath = path.join(__dirname, '..', '.mongo-data');
        fs.mkdirSync(dbPath, { recursive: true });
        memoryServer = await MongoMemoryServer.create({
            instance: {
                dbName: 'rose-gold',
                dbPath,
                storageEngine: 'wiredTiger',
            },
        });
    }
    return memoryServer.getUri('rose-gold');
}

const connectDB = async () => {
    // 1. Try the configured database (usually MongoDB Atlas).
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            // Do not buffer model queries while the connection is down:
            // API endpoints respond immediately with an error instead of
            // hanging for the default 30s, so the frontend UI renders quickly.
            bufferCommands: false,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
    }

    // 2. Fall back to a local embedded MongoDB so the app keeps working
    //    offline (e.g. when Atlas IP whitelisting is not configured yet).
    //    On Vercel this is skipped because the filesystem is read-only and
    //    devDependencies (mongodb-memory-server) are not installed.
    if (!isVercel) {
        try {
            console.log('Falling back to a local embedded MongoDB (offline mode)...');
            const localUri = await startLocalMongo();
            await mongoose.connect(localUri, { bufferCommands: false });
            console.log(`Connected to local embedded MongoDB at ${localUri}`);
            return;
        } catch (localError) {
            console.error(`Local MongoDB fallback failed: ${localError.message}`);
        }
    } else {
        console.error('Vercel environment detected — local MongoDB fallback is disabled. Ensure MONGODB_URI is set correctly.');
    }

    // 3. Nothing worked — keep the server running and retry.
    console.error('No database available — retrying in 30 seconds...');
    setTimeout(connectDB, 30000);
};

module.exports = connectDB;
