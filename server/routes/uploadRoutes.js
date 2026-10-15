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
    // Local disk storage fallback so admins can upload images even without Cloudinary.
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname) || '.jpg';
            const base = path.basename(file.originalname, ext)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'image';
            cb(null, `${Date.now()}-${base}${ext}`);
        },
    });

    upload = multer({
        storage,
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
// @desc     Upload a single image (Cloudinary if configured, otherwise local disk)
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
                const port = process.env.PORT || 5000;
                url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
                publicId = req.file.filename;
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
