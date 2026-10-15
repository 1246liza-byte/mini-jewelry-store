const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./db');
const User = require('../models/User');
const Product = require('../models/Product');
const WebsiteSettings = require('../models/WebsiteSettings');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();
        await WebsiteSettings.deleteMany();

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: process.env.ADMIN_EMAIL || 'admin@rosegold.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@12345',
            isAdmin: true,
            phone: '+1 (555) 000-0000',
        });

        console.log(`Admin created: ${admin.email}`);

        // Create sample products
        const products = [
            {
                name: 'Rose Gold Solitaire Necklace',
                description: 'A stunning rose gold necklace featuring a brilliant solitaire diamond pendant. Perfect for everyday elegance or special occasions.',
                price: 249.99,
                category: 'Necklaces',
                images: [
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
                    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
                ],
                stock: 15,
                featured: true,
                material: 'Rose Gold, Diamond',
                rating: 4.8,
                numReviews: 12,
            },
            {
                name: 'Champagne Diamond Stud Earrings',
                description: 'Classic and timeless, these champagne diamond stud earrings add a touch of sparkle to any outfit. Crafted in 14k gold.',
                price: 189.99,
                category: 'Earrings',
                images: [
                    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80',
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
                ],
                stock: 20,
                featured: true,
                material: '14k Gold, Diamond',
                rating: 4.9,
                numReviews: 8,
            },
            {
                name: 'Blush Pink Pearl Bracelet',
                description: 'A delicate bracelet adorned with lustrous pearls and blush pink accents. A beautiful addition to any jewelry collection.',
                price: 129.99,
                category: 'Bracelets',
                images: [
                    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
                    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
                ],
                stock: 25,
                featured: true,
                material: 'Pearl, Rose Gold',
                rating: 4.7,
                numReviews: 15,
            },
            {
                name: 'Gold Eternity Ring',
                description: 'A symbol of eternal love, this gold eternity ring features a continuous band of sparkling diamonds.',
                price: 299.99,
                category: 'Rings',
                images: [
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
                    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
                ],
                stock: 10,
                featured: true,
                material: '18k Gold, Diamond',
                rating: 5.0,
                numReviews: 6,
            },
            {
                name: 'Rose Quartz Pendant',
                description: 'A beautiful rose quartz pendant set in gold, known for its soft pink hue and romantic energy.',
                price: 159.99,
                category: 'Pendants',
                images: [
                    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80',
                    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
                ],
                stock: 18,
                featured: false,
                material: 'Rose Quartz, Gold',
                rating: 4.6,
                numReviews: 9,
            },
            {
                name: 'Gold Bangle Set',
                description: 'A set of three elegant gold bangles, each with a unique design. Perfect for stacking or wearing individually.',
                price: 219.99,
                category: 'Bangles',
                images: [
                    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
                    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80',
                ],
                stock: 12,
                featured: false,
                material: '18k Gold',
                rating: 4.5,
                numReviews: 7,
            },
            {
                name: 'Pearl Drop Earrings',
                description: 'Elegant pearl drop earrings that dangle gracefully, adding a touch of classic sophistication.',
                price: 179.99,
                category: 'Earrings',
                images: [
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
                    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80',
                ],
                stock: 14,
                featured: false,
                material: 'Pearl, Silver',
                rating: 4.8,
                numReviews: 11,
            },
            {
                name: 'Diamond Tennis Bracelet',
                description: 'A classic tennis bracelet featuring a row of brilliant-cut diamonds set in white gold.',
                price: 399.99,
                category: 'Bracelets',
                images: [
                    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
                    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
                ],
                stock: 8,
                featured: true,
                material: 'White Gold, Diamond',
                rating: 4.9,
                numReviews: 5,
            },
            {
                name: 'Rose Gold Heart Pendant',
                description: 'A romantic rose gold heart pendant, the perfect gift for someone special.',
                price: 139.99,
                category: 'Pendants',
                images: [
                    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80',
                    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
                ],
                stock: 22,
                featured: false,
                material: 'Rose Gold',
                rating: 4.7,
                numReviews: 10,
            },
            {
                name: 'Sapphire Ring',
                description: 'A stunning sapphire ring with a deep blue gemstone surrounded by diamonds.',
                price: 349.99,
                category: 'Rings',
                images: [
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
                    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
                ],
                stock: 9,
                featured: false,
                material: 'Sapphire, Gold',
                rating: 4.8,
                numReviews: 4,
            },
            {
                name: 'Gold Chain Necklace',
                description: 'A versatile gold chain necklace that can be worn alone or layered with other pieces.',
                price: 199.99,
                category: 'Necklaces',
                images: [
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
                    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
                ],
                stock: 16,
                featured: false,
                material: '18k Gold',
                rating: 4.6,
                numReviews: 8,
            },
            {
                name: 'Emerald Stud Earrings',
                description: 'Vibrant emerald stud earrings set in gold, adding a pop of color to any look.',
                price: 229.99,
                category: 'Earrings',
                images: [
                    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80',
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
                ],
                stock: 11,
                featured: false,
                material: 'Emerald, Gold',
                rating: 4.7,
                numReviews: 6,
            },
        ];

        const createdProducts = await Product.insertMany(products);
        console.log(`${createdProducts.length} products created`);

        // Create default website settings
        const settings = await WebsiteSettings.create({
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
            featuredProducts: createdProducts.filter((p) => p.featured).map((p) => p._id),
            announcement: 'Free shipping on orders over $100',
        });

        console.log('Website settings created');
        console.log('\n--- Seed Complete ---');
        console.log(`Admin login: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();