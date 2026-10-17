// Vercel serverless function entrypoint for the Express backend.
// Vercel imports this file and uses the exported `app` as the request handler.
// The `initDatabase` is called lazily on the first request to avoid cold-start
// delays and to ensure the DB connection is established before handling requests.
const { app, initDatabase } = require('../app');

let dbInitialized = false;

// Ensure the database is connected before handling the first request.
// On Vercel, the function may be invoked multiple times (warm/cold starts),
// so we guard against re-initializing the database on every request.
const ensureDatabase = async () => {
    if (!dbInitialized) {
        await initDatabase();
        dbInitialized = true;
    }
};

// Export the Express app as the Vercel handler.
module.exports = async (req, res) => {
    try {
        await ensureDatabase();
    } catch (err) {
        console.error('Database initialization failed:', err.message);
    }
    return app(req, res);
};