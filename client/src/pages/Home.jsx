import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { getFeaturedProducts, getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Home = () => {
    const { settings } = useSettings();
    const [featured, setFeatured] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [featuredData, allData] = await Promise.all([
                    getFeaturedProducts(),
                    getProducts({ page: 1 }),
                ]);
                setFeatured(featuredData);
                setNewArrivals(allData.products.slice(0, 4));
            } catch (error) {
                console.error('Failed to load products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const bannerImage = settings?.bannerImage || '';

    return (
        <div className="home">
            {/* Hero Banner */}
            <section
                className="hero"
                style={
                    bannerImage
                        ? {
                            backgroundImage: `linear-gradient(rgba(45, 55, 72, 0.35), rgba(45, 55, 72, 0.35)), url(${bannerImage})`,
                        }
                        : {}
                }
            >
                <div className="hero-overlay">
                    <div className="container hero-content">
                        <span className="hero-eyebrow">{settings?.tagline || 'Elegance in Every Detail'}</span>
                        <h1 className="hero-title">
                            {settings?.heroTitle || 'Timeless Elegance, Crafted for You'}
                        </h1>
                        <p className="hero-subtitle">
                            {settings?.heroSubtitle ||
                                'Discover our exquisite collection of handcrafted jewelry pieces designed to celebrate your most precious moments.'}
                        </p>
                        <div className="hero-actions">
                            <Link to="/shop" className="btn btn-primary btn-lg">
                                Shop Collection
                            </Link>
                            <Link to="/about" className="btn btn-light btn-lg">
                                Our Story
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section container">
                <div className="section-header">
                    <h2 className="section-title">Shop by Category</h2>
                    <p className="section-subtitle">Find the perfect piece for every occasion</p>
                </div>
                <div className="category-grid">
                    {['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Bangles', 'Pendants'].map((cat) => (
                        <Link key={cat} to={`/shop?category=${cat}`} className="category-card">
                            <span className="category-name">{cat}</span>
                            <span className="category-arrow">→</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="section section-alt">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Pieces</h2>
                        <p className="section-subtitle">Handpicked favorites from our collection</p>
                    </div>
                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="product-grid">
                            {featured.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                    <div className="section-cta">
                        <Link to="/shop" className="btn btn-outline btn-lg">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="section container">
                <div className="section-header">
                    <h2 className="section-title">New Arrivals</h2>
                    <p className="section-subtitle">The latest additions to our collection</p>
                </div>
                {loading ? (
                    <Loader />
                ) : (
                    <div className="product-grid">
                        {newArrivals.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Brand Promise */}
            <section className="section section-alt">
                <div className="container">
                    <div className="promise-grid">
                        <div className="promise-item">
                            <div className="promise-icon">✦</div>
                            <h3>Handcrafted Quality</h3>
                            <p>Each piece is meticulously crafted by skilled artisans.</p>
                        </div>
                        <div className="promise-item">
                            <div className="promise-icon">✦</div>
                            <h3>Ethically Sourced</h3>
                            <p>We use only responsibly sourced materials and gemstones.</p>
                        </div>
                        <div className="promise-item">
                            <div className="promise-icon">✦</div>
                            <h3>Free Shipping</h3>
                            <p>Complimentary shipping on all orders over $100.</p>
                        </div>
                        <div className="promise-item">
                            <div className="promise-icon">✦</div>
                            <h3>Lifetime Care</h3>
                            <p>Complimentary cleaning and care for every purchase.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;