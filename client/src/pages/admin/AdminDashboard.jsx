import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getAllOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import Loader from '../../components/Loader';

const AdminLayout = ({ children }) => (
    <div className="admin-layout">
        <aside className="admin-sidebar">
            <h2 className="admin-sidebar-title">Admin Panel</h2>
            <nav className="admin-nav">
                <NavLink to="/admin" end>
                    Dashboard
                </NavLink>
                <NavLink to="/admin/products">Products</NavLink>
                <NavLink to="/admin/orders">Orders</NavLink>
                <NavLink to="/admin/customization">Customization</NavLink>
            </nav>
            <Link to="/" className="admin-back-link">
                ← Back to Website
            </Link>
        </aside>
        <div className="admin-content">{children}</div>
    </div>
);

// Standalone dashboard content (not using Outlet to avoid double layout)
const AdminDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        revenue: 0,
        pending: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [productsData, ordersData] = await Promise.all([
                    getProducts({ page: 1 }),
                    getAllOrders(),
                ]);

                const revenue = ordersData
                    .filter((o) => o.status !== 'Cancelled')
                    .reduce((sum, o) => sum + o.totalPrice, 0);

                setStats({
                    products: productsData.totalProducts,
                    orders: ordersData.length,
                    revenue,
                    pending: ordersData.filter((o) => o.status === 'Pending').length,
                });

                setRecentOrders(ordersData.slice(0, 5));
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <Loader />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <h1 className="admin-page-title">Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Products</span>
                    <span className="stat-value">{stats.products}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{stats.orders}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-value">${stats.revenue.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Pending Orders</span>
                    <span className="stat-value">{stats.pending}</span>
                </div>
            </div>

            <div className="admin-section">
                <h2>Recent Orders</h2>
                {recentOrders.length === 0 ? (
                    <p className="admin-empty">No orders yet.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>#{order._id.slice(-8).toUpperCase()}</td>
                                        <td>{order.user?.name || 'N/A'}</td>
                                        <td>${order.totalPrice.toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Link to="/admin/orders" className="btn btn-outline btn-sm">
                    View All Orders
                </Link>
            </div>

            <div className="admin-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                    <Link to="/admin/products" className="quick-action-card">
                        <span>+</span>
                        <h3>Add Product</h3>
                        <p>Create a new product listing</p>
                    </Link>
                    <Link to="/admin/customization" className="quick-action-card">
                        <span>✦</span>
                        <h3>Customize Website</h3>
                        <p>Change logo, banner & text</p>
                    </Link>
                    <Link to="/admin/orders" className="quick-action-card">
                        <span>≡</span>
                        <h3>Manage Orders</h3>
                        <p>Update order statuses</p>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
};

export { AdminLayout };
export default AdminDashboard;