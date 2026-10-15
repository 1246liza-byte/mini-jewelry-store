import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import Message from '../components/Message';

const Contact = () => {
    const { settings } = useSettings();
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSent(false), 5000);
    };

    return (
        <div className="contact-page">
            <div className="page-header">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>We'd love to hear from you</p>
                </div>
            </div>

            <div className="container page-padding">
                <div className="contact-layout">
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <p>
                            Have a question about our products or need help with your order? Our team is here to
                            help.
                        </p>

                        <div className="contact-item">
                            <span className="contact-icon">✉</span>
                            <div>
                                <h4>Email</h4>
                                <p>{settings?.contactEmail || 'hello@roseandgold.com'}</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <span className="contact-icon">☎</span>
                            <div>
                                <h4>Phone</h4>
                                <p>{settings?.contactPhone || '+1 (555) 123-4567'}</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <span className="contact-icon">⌂</span>
                            <div>
                                <h4>Address</h4>
                                <p>{settings?.contactAddress || '123 Jewelry Lane, Beverly Hills, CA 90210'}</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <span className="contact-icon">◷</span>
                            <div>
                                <h4>Hours</h4>
                                <p>Mon–Fri: 9am – 6pm | Sat: 10am – 4pm</p>
                            </div>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <h2>Send a Message</h2>

                        {sent && <Message variant="success">Thank you! Your message has been sent.</Message>}

                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                rows="5"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;