import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import Logo from './Logo';

const Footer = () => {
    const { settings } = useSettings();
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-inner">
                <div className="footer-col">
                    <Logo logoUrl={settings?.logoUrl} siteName={settings?.siteName} />
                    <p className="footer-tagline">{settings?.tagline || 'Elegance in Every Detail'}</p>
                    <p className="footer-desc">
                        Handcrafted luxury jewelry designed to celebrate your most precious moments.
                    </p>
                </div>

                <div className="footer-col">
                    <h4>Shop</h4>
                    <Link to="/shop">All Products</Link>
                    <Link to="/shop?category=Necklaces">Necklaces</Link>
                    <Link to="/shop?category=Earrings">Earrings</Link>
                    <Link to="/shop?category=Rings">Rings</Link>
                    <Link to="/shop?category=Bracelets">Bracelets</Link>
                </div>

                <div className="footer-col">
                    <h4>Company</h4>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact Us</Link>
                    <Link to="/account">My Account</Link>
                    <Link to="/cart">Cart</Link>
                </div>

                <div className="footer-col">
                    <h4>Contact</h4>
                    <p>{settings?.contactEmail || 'hello@roseandgold.com'}</p>
                    <p>{settings?.contactPhone || '+1 (555) 123-4567'}</p>
                    <p>{settings?.contactAddress || '123 Jewelry Lane, Beverly Hills, CA'}</p>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>© {year} {settings?.siteName || 'Rosé & Gold'}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;