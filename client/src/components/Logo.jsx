const Logo = ({ logoUrl, siteName = 'Rosé & Gold' }) => {
    if (logoUrl) {
        return <img src={logoUrl} alt={siteName} className="logo-image" />;
    }

    return (
        <div className="logo">
            <svg
                className="logo-icon"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"
                    fill="url(#goldGradient)"
                    stroke="#D4AF37"
                    strokeWidth="0.5"
                />
                <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F5E6B8" />
                        <stop offset="1" stopColor="#D4AF37" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="logo-text">{siteName}</span>
        </div>
    );
};

export default Logo;