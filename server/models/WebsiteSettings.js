const mongoose = require('mongoose');

const websiteSettingsSchema = new mongoose.Schema(
    {
        siteName: {
            type: String,
            default: 'Rosé & Gold',
        },
        tagline: {
            type: String,
            default: 'Elegance in Every Detail',
        },
        logoUrl: {
            type: String,
            default: '',
        },
        logoSize: {
            type: String,
            enum: ['small', 'medium', 'large'],
            default: 'medium',
        },
        showLogo: {
            type: Boolean,
            default: true,
        },
        bannerImage: {
            type: String,
            default: '',
        },
        showBanner: {
            type: Boolean,
            default: true,
        },
        bannerHeight: {
            type: String,
            enum: ['short', 'medium', 'tall'],
            default: 'medium',
        },
        bannerOverlay: {
            type: Number,
            min: 0,
            max: 0.9,
            default: 0.35,
        },
        bannerTextColor: {
            type: String,
            default: '#FFFFFF',
        },
        heroTitle: {
            type: String,
            default: 'Timeless Elegance, Crafted for You',
        },
        heroSubtitle: {
            type: String,
            default: 'Discover our exquisite collection of handcrafted jewelry pieces designed to celebrate your most precious moments.',
        },
        aboutText: {
            type: String,
            default: 'Rosé & Gold is a luxury jewelry brand dedicated to creating timeless pieces that blend elegance with modern design. Each piece is crafted with precision and passion.',
        },
        aboutImage: {
            type: String,
            default: '',
        },
        aboutStoryTitle: {
            type: String,
            default: 'Our Story',
        },
        aboutStoryParagraphs: {
            type: [String],
            default: [
                'Founded with a passion for beauty and craftsmanship, Rosé & Gold began as a small atelier with a simple mission: to create jewelry that celebrates life\'s most precious moments. Today, we continue to honor that vision by crafting each piece with the same care and attention to detail as our very first collection.',
                'Every gemstone is hand-selected, every setting carefully designed, and every finish polished to perfection. We believe that jewelry is more than an accessory—it is a story, a memory, and a symbol of love that lasts a lifetime.',
            ],
        },
        aboutValues: {
            type: [
                {
                    title: { type: String, default: '' },
                    description: { type: String, default: '' },
                    icon: { type: String, default: '✦' },
                },
            ],
            default: [
                { title: 'Craftsmanship', description: 'Every piece is meticulously crafted by skilled artisans with decades of experience.', icon: '✦' },
                { title: 'Quality', description: 'We use only the finest materials, from ethically sourced gemstones to premium metals.', icon: '✦' },
                { title: 'Elegance', description: 'Our designs blend classic sophistication with contemporary style.', icon: '✦' },
                { title: 'Care', description: 'We offer lifetime care for every piece, ensuring it stays beautiful forever.', icon: '✦' },
            ],
        },
        contactEmail: {
            type: String,
            default: 'hello@roseandgold.com',
        },
        contactPhone: {
            type: String,
            default: '+1 (555) 123-4567',
        },
        contactAddress: {
            type: String,
            default: '123 Jewelry Lane, Beverly Hills, CA 90210',
        },
        featuredProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        announcement: {
            type: String,
            default: 'Free shipping on orders over $100',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);