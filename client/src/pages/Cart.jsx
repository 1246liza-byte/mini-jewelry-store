import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const shippingPrice = cartSubtotal > 100 || cartSubtotal === 0 ? 0 : 10;
    const total = cartSubtotal + shippingPrice;

    const handleCheckout = () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
        } else {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container page-padding">
                <div className="empty-state">
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/shop" className="btn btn-primary btn-lg">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container page-padding">
            <h1 className="page-title">Shopping Cart</h1>

            <div className="cart-layout">
                <div className="cart-items">
                    {cartItems.map((item) => (
                        <div key={item._id} className="cart-item">
                            <Link to={`/product/${item._id}`} className="cart-item-image">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} />
                                ) : (
                                    <div className="product-card-placeholder">No Image</div>
                                )}
                            </Link>

                            <div className="cart-item-details">
                                <Link to={`/product/${item._id}`} className="cart-item-name">
                                    {item.name}
                                </Link>
                                <span className="cart-item-price">${item.price.toFixed(2)}</span>
                            </div>

                            <div className="cart-item-quantity">
                                <div className="quantity-selector">
                                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateQuantity(item._id, Math.max(1, Number(e.target.value)))
                                        }
                                    />
                                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                                </div>
                            </div>

                            <div className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</div>

                            <button
                                className="cart-item-remove"
                                onClick={() => removeFromCart(item._id)}
                                aria-label="Remove item"
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    <button className="btn btn-outline btn-sm clear-cart" onClick={clearCart}>
                        Clear Cart
                    </button>
                </div>

                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
                    </div>
                    <div className="summary-row summary-total">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    {shippingPrice > 0 && (
                        <p className="shipping-note">
                            Add ${(100 - cartSubtotal).toFixed(2)} more for free shipping!
                        </p>
                    )}

                    <button className="btn btn-primary btn-lg btn-block" onClick={handleCheckout}>
                        Proceed to Checkout
                    </button>
                    <Link to="/shop" className="btn btn-outline btn-block">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;