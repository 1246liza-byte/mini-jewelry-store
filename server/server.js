const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
// Note: On Vercel, environment variables are injected automatically, so this
// only matters for local development.
dotenv.config({ path: path.join(__dirname, '.env') });

const { app, initDatabase } = require('./app');

// Connect to MongoDB, then auto-seed if the database is empty so the app
// (including login) works out of the box.
(async () => {
    await initDatabase();
})();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});