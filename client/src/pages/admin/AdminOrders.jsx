import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { AdminLayout } from './AdminDashboard';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [filter, setFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            setMessage({ variant: 'error', text: 'Failed to load orders' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            setMessage({ variant: 'success', text: `Order status updated to ${status}` });
            loadOrders();
        } catch (error) {
            setMessage({
                variant: 'error',
                text: error.response?.data?.message || 'Failed to update status',
            });
        }
    };

    const filteredOrders = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Orders</h1>
                <div className="filter-pills">
                    {['All', ...STATUSES].map((s) => (
                        <button
                            key={s}
                            className={`filter-pill ${filter === s ? 'active' : ''}`}
                            onClick={() => setFilter(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {message && <Message variant={message.variant}>{message.text}</Message>}

            {loading ? (
                <Loader />
            ) : filteredOrders.length === 0 ? (
                <p className="admin-empty">No orders found.</p>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td>#{order._id.slice(-8).toUpperCase()}</td>
                                    <td>
                                        <div className="customer-cell">
                                            <strong>{order.user?.name || 'N/A'}</strong>
                                            <span>{order.user?.email || ''}</span>
                                        </div>
                                    </td>
                                    <td>{order.orderItems.length}</td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            className="status-select"
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-section">
                                <h3>Customer</h3>
                                <p>{selectedOrder.user?.name}</p>
                                <p>{selectedOrder.user?.email}</p>
                            </div>
                            <div className="modal-section">
                                <h3>Shipping Address</h3>
                                <p>{selectedOrder.shippingAddress.fullName}</p>
                                <p>{selectedOrder.shippingAddress.address}</p>
                                <p>
                                    {selectedOrder.shippingAddress.city},{' '}
                                    {selectedOrder.shippingAddress.postalCode}
                                </p>
                                <p>{selectedOrder.shippingAddress.country}</p>
                                <p>{selectedOrder.shippingAddress.phone}</p>
                            </div>
                            <div className="modal-section">
                                <h3>Items</h3>
                                {selectedOrder.orderItems.map((item, idx) => (
                                    <div key={idx} className="modal-item">
                                        <span>{item.name}</span>
                                        <span>× {item.quantity}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-section modal-totals">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>${selectedOrder.itemsPrice.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>${selectedOrder.shippingPrice.toFixed(2)}</span>
                                </div>
                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;