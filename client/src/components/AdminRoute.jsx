import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user.isAdmin) {
        return (
            <div className="container page-padding">
                <div className="empty-state">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to access the admin dashboard.</p>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;