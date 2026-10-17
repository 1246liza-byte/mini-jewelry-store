const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./db');
const User = require('../models/User');
const Product = require('../models/Product');
const WebsiteSettings = require('../models/WebsiteSettings');

// Seed the database with an admin user (only if ADMIN_EMAIL / ADMIN_PASSWORD
// are provided) and default website settings. No sample products are created —
// the store starts empty and the admin adds products via the dashboard.
// Assumes a database connection is already established. Safe to call when the
// database is empty (it clears collections first).
const seedData = async () => {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await WebsiteSettings.deleteMany();

    // Create admin user ONLY if credentials are provided via env vars.
    // No hardcoded/default admin credentials are used for security.
    let admin = null;
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        admin = await User.create({
            name: process.env.ADMIN_NAME || 'Admin',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            isAdmin: true,
            phone: process.env.ADMIN_PHONE || '',
        });
        console.log(`Admin created: ${admin.email}`);
    } else {
        console.log('No ADMIN_EMAIL / ADMIN_PASSWORD set — skipping admin creation.');
    }

    // Create default website settings (brand content, editable via the admin
    // dashboard). No sample products are seeded.
    await WebsiteSettings.create({
        siteName: 'Rosé & Gold',
        tagline: 'Elegance in Every Detail',
        logoUrl: '',
        bannerImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
        heroTitle: 'Timeless Elegance, Crafted for You',
        heroSubtitle: 'Discover our exquisite collection of handcrafted jewelry pieces designed to celebrate your most precious moments.',
        aboutText: 'Rosé & Gold is a luxury jewelry brand dedicated to creating timeless pieces that blend elegance with modern design. Each piece is crafted with precision and passion.',
        aboutImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80',
        aboutStoryTitle: 'Our Story',
        aboutStoryParagraphs: [
            'Founded with a passion for beauty and craftsmanship, Rosé & Gold began as a small atelier with a simple mission: to create jewelry that celebrates life\'s most precious moments. Today, we continue to honor that vision by crafting each piece with the same care and attention to detail as our very first collection.',
            'Every gemstone is hand-selected, every setting carefully designed, and every finish polished to perfection. We believe that jewelry is more than an accessory—it is a story, a memory, and a symbol of love that lasts a lifetime.',
        ],
        aboutValues: [
            { title: 'Craftsmanship', description: 'Every piece is meticulously crafted by skilled artisans with decades of experience.', icon: '✦' },
            { title: 'Quality', description: 'We use only the finest materials, from ethically sourced gemstones to premium metals.', icon: '✦' },
            { title: 'Elegance', description: 'Our designs blend classic sophistication with contemporary style.', icon: '✦' },
            { title: 'Care', description: 'We offer lifetime care for every piece, ensuring it stays beautiful forever.', icon: '✦' },
        ],
        contactEmail: 'hello@roseandgold.com',
        contactPhone: '+1 (555) 123-4567',
        contactAddress: '123 Jewelry Lane, Beverly Hills, CA 90210',
        featuredProducts: [],
        announcement: 'Free shipping on orders over $100',
    });

    console.log('Website settings created');
    if (admin) {
        console.log(`Admin login: ${admin.email}`);
    }
};

module.exports = seedData;

// Allow running this file directly as a script: `npm run seed`
if (require.main === module) {
    (async () => {
        try {
            await connectDB();
            await seedData();
            console.log('\n--- Seed Complete ---');
            process.exit(0);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    })();
}
