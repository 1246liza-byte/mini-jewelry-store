import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                const data = await getProductById(id);
                setProduct(data);
                setActiveImage(0);
            } catch (err) {
                setError(err.response?.data?.message || 'Product not found');
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
    };

    const handleBuyNow = () => {
        addToCart(product, quantity);
        navigate('/cart');
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="container page-padding">
                <Message variant="error">{error}</Message>
                <Link to="/shop" className="btn btn-primary">
                    Back to Shop
                </Link>
            </div>
        );
    }

    if (!product) return null;

    const images = product.images && product.images.length > 0 ? product.images : [];
    const inStock = product.stock > 0;

    return (
        <div className="product-details container">
            <div className="breadcrumbs">
                <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{' '}
                <Link to={`/shop?category=${product.category}`}>{product.category}</Link> /{' '}
                <span>{product.name}</span>
            </div>

            <div className="product-details-layout">
                {/* Gallery */}
                <div className="product-gallery">
                    <div className="product-main-image">
                        {images.length > 0 ? (
                            <img src={images[activeImage]} alt={product.name} />
                        ) : (
                            <div className="product-card-placeholder">No Image</div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="product-thumbnails">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                                    onClick={() => setActiveImage(idx)}
                                >
                                    <img src={img} alt={`${product.name} ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="product-info">
                    <span className="product-info-category">{product.category}</span>
                    <h1 className="product-info-name">{product.name}</h1>

                    {product.rating > 0 && (
                        <div className="product-info-rating">
                            {'★'.repeat(Math.round(product.rating))}
                            {'☆'.repeat(5 - Math.round(product.rating))}
                            <span> ({product.numReviews} reviews)</span>
                        </div>
                    )}

                    <div className="product-info-price">${product.price.toFixed(2)}</div>

                    <p className="product-info-desc">{product.description}</p>

                    {product.material && (
                        <div className="product-info-meta">
                            <strong>Material:</strong> {product.material}
                        </div>
                    )}

                    <div className="product-info-stock">
                        {inStock ? (
                            <span className="in-stock">✓ In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="out-stock">✗ Out of Stock</span>
                        )}
                    </div>

                    {inStock && (
                        <div className="product-info-quantity">
                            <label>Quantity:</label>
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.stock}
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))
                                    }
                                />
                                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="product-info-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleAddToCart}
                            disabled={!inStock}
                        >
                            Add to Cart
                        </button>
                        <button
                            className="btn btn-gold btn-lg"
                            onClick={handleBuyNow}
                            disabled={!inStock}
                        >
                            Buy Now
                        </button>
                    </div>

                    {added && <Message variant="success">Added to cart successfully!</Message>}

                    <div className="product-info-perks">
                        <div className="perk">✦ Free shipping over $100</div>
                        <div className="perk">✦ 30-day returns</div>
                        <div className="perk">✦ Gift packaging available</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;