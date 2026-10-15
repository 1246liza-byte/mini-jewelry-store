import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/orderService';
import { updateProfile } from '../services/authService';
import Loader from '../components/Loader';
import Message from '../components/Message';

const Account = () => {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        password: '',
    });

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await getMyOrders();
                setOrders(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateProfile(form);
            await refreshUser();
            setSuccess('Profile updated successfully!');
            setForm({ ...form, password: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container page-padding">
            <h1 className="page-title">My Account</h1>

            <div className="account-header">
                <div className="account-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <div>
                    <h2>{user?.name}</h2>
                    <p>{user?.email}</p>
                </div>
            </div>

            <div className="account-tabs">
                <button
                    className={activeTab === 'orders' ? 'active' : ''}
                    onClick={() => setActiveTab('orders')}
                >
                    Order History
                </button>
                <button
                    className={activeTab === 'profile' ? 'active' : ''}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Settings
                </button>
            </div>

            {error && <Message variant="error">{error}</Message>}
            {success && <Message variant="success">{success}</Message>}

            {activeTab === 'orders' && (
                <div className="orders-list">
                    {loading ? (
                        <Loader />
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <h3>No orders yet</h3>
                            <p>You haven't placed any orders.</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header">
                                    <div>
                                        <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                                        <span className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-card-items">
                                    {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <span>{item.name}</span>
                                            <span>× {item.quantity}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-card-footer">
                                    <span>Total: ${order.totalPrice.toFixed(2)}</span>
                                    <span className="order-address">
                                        {order.shippingAddress.city}, {order.shippingAddress.country}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'profile' && (
                <form className="profile-form" onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email (cannot be changed)</label>
                        <input id="email" type="email" value={user?.email || ''} disabled />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            id="address"
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">New Password (leave blank to keep current)</label>
                        <input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Account;