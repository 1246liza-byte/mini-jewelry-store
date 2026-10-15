import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import Logo from './Logo';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { settings } = useSettings();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setMobileOpen(false);
        navigate('/');
    };

    const closeMenu = () => setMobileOpen(false);

    return (
        <>
            {settings && settings.announcement && (
                <div className="announcement-bar">{settings.announcement}</div>
            )}
            <header className="navbar">
                <div className="navbar-inner container">
                    <Link to="/" className="navbar-brand" onClick={closeMenu}>
                        <Logo logoUrl={settings?.logoUrl} siteName={settings?.siteName} />
                    </Link>

                    <button
                        className="navbar-toggle"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle navigation"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <nav className={`navbar-nav ${mobileOpen ? 'open' : ''}`}>
                        <NavLink to="/" end onClick={closeMenu}>
                            Home
                        </NavLink>
                        <NavLink to="/shop" onClick={closeMenu}>
                            Shop
                        </NavLink>
                        <NavLink to="/about" onClick={closeMenu}>
                            About
                        </NavLink>
                        <NavLink to="/contact" onClick={closeMenu}>
                            Contact
                        </NavLink>

                        {user && user.isAdmin && (
                            <NavLink to="/admin" onClick={closeMenu} className="admin-link">
                                Admin
                            </NavLink>
                        )}

                        <div className="navbar-actions">
                            <Link to="/cart" className="cart-link" onClick={closeMenu}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>

                            {user ? (
                                <div className="user-menu">
                                    <Link to="/account" className="user-name" onClick={closeMenu}>
                                        {user.name.split(' ')[0]}
                                    </Link>
                                    <button onClick={handleLogout} className="btn btn-outline btn-sm">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="auth-links">
                                    <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Navbar;