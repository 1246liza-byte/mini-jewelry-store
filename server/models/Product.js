const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Product category is required'],
            enum: ['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Bangles', 'Pendants'],
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        material: {
            type: String,
            trim: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);