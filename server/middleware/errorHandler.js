// 404 Not Found handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // Multer file upload error
    if (err.name === 'MulterError') {
        statusCode = 400;
        message = err.message;
    }

    // Mongoose "before initial connection is complete" error
    // (occurs when bufferCommands is disabled and the DB is not connected)
    if (
        err.message &&
        err.message.includes('before initial connection is complete')
    ) {
        statusCode = 503;
        message = 'Database is not connected yet. Please check your MongoDB Atlas connection string and try again.';
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };