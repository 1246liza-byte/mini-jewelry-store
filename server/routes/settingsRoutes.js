const express = require('express');
const router = express.Router();
const WebsiteSettings = require('../models/WebsiteSettings');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/settings
// @desc     Get website settings (public)
// @access   Public
router.get('/', async (req, res) => {
    try {
        let settings = await WebsiteSettings.findOne().populate('featuredProducts');

        if (!settings) {
            settings = await WebsiteSettings.create({});
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/settings
// @desc     Update website settings (admin)
// @access   Private/Admin
router.put('/', protect, admin, async (req, res) => {
    try {
        let settings = await WebsiteSettings.findOne();

        if (!settings) {
            settings = await WebsiteSettings.create({});
        }

        const {
            siteName,
            tagline,
            logoUrl,
            bannerImage,
            heroTitle,
            heroSubtitle,
            aboutText,
            aboutImage,
            aboutStoryTitle,
            aboutStoryParagraphs,
            aboutValues,
            contactEmail,
            contactPhone,
            contactAddress,
            featuredProducts,
            announcement,
        } = req.body;

        if (siteName !== undefined) settings.siteName = siteName;
        if (tagline !== undefined) settings.tagline = tagline;
        if (logoUrl !== undefined) settings.logoUrl = logoUrl;
        if (bannerImage !== undefined) settings.bannerImage = bannerImage;
        if (heroTitle !== undefined) settings.heroTitle = heroTitle;
        if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
        if (aboutText !== undefined) settings.aboutText = aboutText;
        if (aboutImage !== undefined) settings.aboutImage = aboutImage;
        if (aboutStoryTitle !== undefined) settings.aboutStoryTitle = aboutStoryTitle;
        if (aboutStoryParagraphs !== undefined) settings.aboutStoryParagraphs = aboutStoryParagraphs;
        if (aboutValues !== undefined) settings.aboutValues = aboutValues;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        if (contactPhone !== undefined) settings.contactPhone = contactPhone;
        if (contactAddress !== undefined) settings.contactAddress = contactAddress;
        if (featuredProducts !== undefined) settings.featuredProducts = featuredProducts;
        if (announcement !== undefined) settings.announcement = announcement;

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;