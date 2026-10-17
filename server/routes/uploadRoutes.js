const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect, admin } = require('../middleware/auth');

// Cloudinary is only used if it is actually configured (not placeholder values).
const cloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'test' &&
    process.env.CLOUDINARY_API_SECRET !== 'test';

let upload;
let cloudinary;

if (cloudinaryConfigured) {
    const cloudinaryModule = require('../config/cloudinary');
    cloudinary = cloudinaryModule.cloudinary;
    upload = cloudinaryModule.upload;
} else {
    // No Cloudinary: use memory storage so the image can be converted to a
    // base64 data URL and stored directly in MongoDB. This works on Vercel
    // (no filesystem needed) and locally, so images upload without a URL.
    upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only image files (jpg, png, webp, gif, svg) are allowed.'), false);
            }
        },
    });
}

// @route   POST /api/upload
// @desc     Upload a single image (Cloudinary if configured, otherwise base64 data URL)
// @access   Private/Admin
router.post('/', protect, admin, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        try {
            let url;
            let publicId;

            if (cloudinaryConfigured) {
                url = req.file.path;
                publicId = req.file.filename;
            } else {
                // No Cloudinary: convert the uploaded image to a base64 data URL
                // and store it directly in MongoDB. This works on Vercel (no
                // filesystem needed) and locally, so images upload without a URL.
                const mime = req.file.mimetype;
                const base64 = req.file.buffer.toString('base64');
                url = `data:${mime};base64,${base64}`;
                publicId = '';
            }

            res.json({ url, public_id: publicId });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
});

// @route   DELETE /api/upload/:publicId
// @desc     Delete an image (Cloudinary or local disk)
// @access   Private/Admin
router.delete('/:publicId', protect, admin, async (req, res) => {
    try {
        if (cloudinaryConfigured) {
            const result = await cloudinary.uploader.destroy(req.params.publicId);
            return res.json({ message: 'Image deleted', result });
        }

        // Local fallback: remove the file from the uploads folder
        const filePath = path.join(__dirname, '..', 'uploads', path.basename(req.params.publicId));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return res.json({ message: 'Image deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
