import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container page-padding">
            <div className="empty-state not-found">
                <h1 className="not-found-code">404</h1>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className="btn btn-primary btn-lg">
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;