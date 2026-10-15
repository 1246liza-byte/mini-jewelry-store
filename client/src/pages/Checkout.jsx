import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import Message from '../components/Message';

const Checkout = () => {
    const { cartItems, cartSubtotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const shippingPrice = cartSubtotal > 100 ? 0 : 10;
    const total = cartSubtotal + shippingPrice;

    const [form, setForm] = useState({
        fullName: user?.name || '',
        address: user?.address || '',
        city: '',
        postalCode: '',
        country: 'United States',
        phone: user?.phone || '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (cartItems.length === 0) {
            setError('Your cart is empty');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                orderItems: cartItems.map((item) => ({
                    product: item._id,
                    quantity: item.quantity,
                })),
                shippingAddress: form,
                paymentMethod: 'Cash on Delivery',
            };

            const order = await createOrder(orderData);
            clearCart();
            navigate(`/order-confirmation/${order._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container page-padding">
                <div className="empty-state">
                    <h2>Your cart is empty</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/shop')}>
                        Go Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container page-padding">
            <h1 className="page-title">Checkout</h1>

            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    <h3>Shipping Information</h3>

                    {error && <Message variant="error">{error}</Message>}

                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            id="address"
                            name="address"
                            type="text"
                            value={form.address}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={form.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="postalCode">Postal Code</label>
                            <input
                                id="postalCode"
                                name="postalCode"
                                type="text"
                                value={form.postalCode}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="country">Country</label>
                            <input
                                id="country"
                                name="country"
                                type="text"
                                value={form.country}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <h3 className="payment-heading">Payment Method</h3>
                    <div className="payment-option">
                        <input type="radio" id="cod" name="payment" value="cod" defaultChecked />
                        <label htmlFor="cod">
                            <strong>Cash on Delivery</strong>
                            <span>Pay when your order arrives at your doorstep.</span>
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                        {loading ? 'Placing Order...' : `Place Order • $${total.toFixed(2)}`}
                    </button>
                </form>

                <div className="checkout-summary">
                    <h3>Order Summary</h3>
                    <div className="checkout-items">
                        {cartItems.map((item) => (
                            <div key={item._id} className="checkout-item">
                                <div className="checkout-item-image">
                                    {item.image ? <img src={item.image} alt={item.name} /> : null}
                                </div>
                                <div className="checkout-item-info">
                                    <span>{item.name}</span>
                                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                                </div>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
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
                </div>
            </div>
        </div>
    );
};

export default Checkout;