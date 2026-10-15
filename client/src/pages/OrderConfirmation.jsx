import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import Loader from '../components/Loader';
import Message from '../components/Message';

const OrderConfirmation = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const data = await getOrderById(id);
                setOrder(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Order not found');
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id]);

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

    return (
        <div className="container page-padding">
            <div className="confirmation">
                <div className="confirmation-icon">✓</div>
                <h1>Thank You for Your Order!</h1>
                <p className="confirmation-message">
                    Your order has been placed successfully. We've sent a confirmation to your email.
                </p>

                <div className="confirmation-details">
                    <div className="confirmation-card">
                        <h3>Order Details</h3>
                        <div className="detail-row">
                            <span>Order ID</span>
                            <span>#{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="detail-row">
                            <span>Date</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                            <span>Status</span>
                            <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span>Payment</span>
                            <span>{order.paymentMethod}</span>
                        </div>
                        <div className="detail-row">
                            <span>Total</span>
                            <span className="detail-total">${order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="confirmation-card">
                        <h3>Shipping To</h3>
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                        <p>{order.shippingAddress.phone}</p>
                    </div>
                </div>

                <div className="confirmation-items">
                    <h3>Items Ordered</h3>
                    {order.orderItems.map((item, idx) => (
                        <div key={idx} className="confirmation-item">
                            <div className="checkout-item-image">
                                {item.image ? <img src={item.image} alt={item.name} /> : null}
                            </div>
                            <span>{item.name}</span>
                            <span>× {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="confirmation-actions">
                    <Link to="/account" className="btn btn-primary">
                        View My Orders
                    </Link>
                    <Link to="/shop" className="btn btn-outline">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;