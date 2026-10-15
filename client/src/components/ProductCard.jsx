import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (product.stock > 0) {
            addToCart(product, 1);
        }
    };

    const image = product.images && product.images[0] ? product.images[0] : '';

    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="product-card-image-wrap">
                {image ? (
                    <img src={image} alt={product.name} className="product-card-image" loading="lazy" />
                ) : (
                    <div className="product-card-placeholder">No Image</div>
                )}
                {product.stock === 0 && <span className="badge badge-out">Out of Stock</span>}
                {product.featured && product.stock > 0 && (
                    <span className="badge badge-featured">Featured</span>
                )}
            </Link>

            <div className="product-card-body">
                <span className="product-card-category">{product.category}</span>
                <Link to={`/product/${product._id}`} className="product-card-name">
                    {product.name}
                </Link>
                <div className="product-card-footer">
                    <span className="product-card-price">${product.price.toFixed(2)}</span>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                    >
                        {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;