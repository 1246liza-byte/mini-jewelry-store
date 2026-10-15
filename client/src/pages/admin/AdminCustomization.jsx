import { useState, useEffect } from 'react';
import { getSettings, updateSettings, uploadImage } from '../../services/settingsService';
import { getProducts } from '../../services/productService';
import { useSettings } from '../../context/SettingsContext';
import { AdminLayout } from './AdminDashboard';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const AdminCustomization = () => {
    const { updateSettings: updateGlobalSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingAbout, setUploadingAbout] = useState(false);
    const [message, setMessage] = useState(null);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [settingsData, productsData] = await Promise.all([
                    getSettings(),
                    getProducts({ page: 1 }),
                ]);
                setForm({
                    siteName: settingsData.siteName || '',
                    tagline: settingsData.tagline || '',
                    logoUrl: settingsData.logoUrl || '',
                    bannerImage: settingsData.bannerImage || '',
                    heroTitle: settingsData.heroTitle || '',
                    heroSubtitle: settingsData.heroSubtitle || '',
                    aboutText: settingsData.aboutText || '',
                    aboutImage: settingsData.aboutImage || '',
                    aboutStoryTitle: settingsData.aboutStoryTitle || 'Our Story',
                    aboutStoryParagraphs: (settingsData.aboutStoryParagraphs &&
                        settingsData.aboutStoryParagraphs.length
                    ) ? [...settingsData.aboutStoryParagraphs] : [''],
                    aboutValues: (settingsData.aboutValues || []).map((v) => ({
                        title: v.title || '',
                        description: v.description || '',
                        icon: v.icon || '✦',
                    })),
                    contactEmail: settingsData.contactEmail || '',
                    contactPhone: settingsData.contactPhone || '',
                    contactAddress: settingsData.contactAddress || '',
                    announcement: settingsData.announcement || '',
                    featuredProducts: (settingsData.featuredProducts || []).map((p) =>
                        typeof p === 'object' ? p._id : p
                    ),
                });
                setProducts(productsData.products);
            } catch (error) {
                setMessage({ variant: 'error', text: 'Failed to load settings' });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setMessage({ variant: 'error', text: 'Please select a valid image file.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ variant: 'error', text: 'Image must be smaller than 5MB.' });
            return;
        }

        const setUploading =
            field === 'logoUrl'
                ? setUploadingLogo
                : field === 'bannerImage'
                    ? setUploadingBanner
                    : setUploadingAbout;
        setUploading(true);
        setMessage(null);
        try {
            const data = await uploadImage(file);
            // Add cache-busting so browser shows the new image immediately
            const url = `${data.url}?v=${Date.now()}`;
            setForm((prev) => ({ ...prev, [field]: url }));
            setMessage({
                variant: 'success',
                text: 'Image uploaded! Click "Save Changes" to publish it.',
            });
        } catch (error) {
            setMessage({
                variant: 'error',
                text: error.response?.data?.message || 'Upload failed. Check Cloudinary configuration.',
            });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const toggleFeatured = (productId) => {
        setForm((prev) => {
            const list = prev.featuredProducts || [];
            if (list.includes(productId)) {
                return { ...prev, featuredProducts: list.filter((id) => id !== productId) };
            }
            return { ...prev, featuredProducts: [...list, productId] };
        });
    };

    const handleParagraphChange = (index, value) => {
        setForm((prev) => {
            const paragraphs = [...prev.aboutStoryParagraphs];
            paragraphs[index] = value;
            return { ...prev, aboutStoryParagraphs: paragraphs };
        });
    };

    const addParagraph = () => {
        setForm((prev) => ({
            ...prev,
            aboutStoryParagraphs: [...prev.aboutStoryParagraphs, ''],
        }));
    };

    const removeParagraph = (index) => {
        setForm((prev) => ({
            ...prev,
            aboutStoryParagraphs: prev.aboutStoryParagraphs.filter((_, i) => i !== index),
        }));
    };

    const handleValueChange = (index, field, value) => {
        setForm((prev) => {
            const values = prev.aboutValues.map((v, i) => (i === index ? { ...v, [field]: value } : v));
            return { ...prev, aboutValues: values };
        });
    };

    const addValue = () => {
        setForm((prev) => ({
            ...prev,
            aboutValues: [...prev.aboutValues, { title: '', description: '', icon: '✦' }],
        }));
    };

    const removeValue = (index) => {
        setForm((prev) => ({
            ...prev,
            aboutValues: prev.aboutValues.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const updated = await updateSettings(form);
            updateGlobalSettings(updated);
            setMessage({
                variant: 'success',
                text: 'Website updated successfully! Changes are now live.',
            });
        } catch (error) {
            setMessage({
                variant: 'error',
                text: error.response?.data?.message || 'Failed to save changes',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) {
        return (
            <AdminLayout>
                <Loader />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <h1 className="admin-page-title">Website Customization</h1>
            <p className="admin-page-subtitle">
                Change your logo, banner, homepage text and featured products. Changes appear live
                instantly after saving.
            </p>

            {message && <Message variant={message.variant}>{message.text}</Message>}

            <form className="admin-form" onSubmit={handleSave}>
                {/* Branding */}
                <section className="admin-form-section">
                    <h2>Branding</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Site Name</label>
                            <input
                                type="text"
                                name="siteName"
                                value={form.siteName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Tagline</label>
                            <input
                                type="text"
                                name="tagline"
                                value={form.tagline}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Logo</label>
                        <div className="upload-row">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, 'logoUrl')}
                                disabled={uploadingLogo}
                            />
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setForm({ ...form, logoUrl: '' })}
                            >
                                Remove Logo
                            </button>
                        </div>
                        {uploadingLogo && <p className="uploading-text">Uploading logo...</p>}
                        {form.logoUrl && (
                            <div className="image-preview large">
                                <img src={form.logoUrl} alt="Logo preview" />
                            </div>
                        )}
                        <p className="help-text">Recommended: PNG or SVG with transparent background.</p>
                    </div>

                    <div className="form-group">
                        <label>Announcement Bar Text</label>
                        <input
                            type="text"
                            name="announcement"
                            value={form.announcement}
                            onChange={handleChange}
                            placeholder="e.g. Free shipping on orders over $100"
                        />
                    </div>
                </section>

                {/* Homepage Banner */}
                <section className="admin-form-section">
                    <h2>Homepage Banner</h2>

                    <div className="form-group">
                        <label>Banner Image</label>
                        <div className="upload-row">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, 'bannerImage')}
                                disabled={uploadingBanner}
                            />
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setForm({ ...form, bannerImage: '' })}
                            >
                                Remove Banner
                            </button>
                        </div>
                        {uploadingBanner && <p className="uploading-text">Uploading banner...</p>}
                        {form.bannerImage && (
                            <div className="image-preview banner">
                                <img src={form.bannerImage} alt="Banner preview" />
                            </div>
                        )}
                        <p className="help-text">Recommended: 1600×800px or wider for best results.</p>
                    </div>
                </section>

                {/* Homepage Text */}
                <section className="admin-form-section">
                    <h2>Homepage Text</h2>

                    <div className="form-group">
                        <label>Hero Title</label>
                        <input
                            type="text"
                            name="heroTitle"
                            value={form.heroTitle}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Hero Subtitle</label>
                        <textarea
                            rows="2"
                            name="heroSubtitle"
                            value={form.heroSubtitle}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                </section>

                {/* About Us Page */}
                <section className="admin-form-section">
                    <h2>About Us Page</h2>
                    <p className="help-text">
                        Control the intro text, image, story and value cards shown on the About Us page.
                    </p>

                    <div className="form-group">
                        <label>Intro Text</label>
                        <textarea
                            rows="4"
                            name="aboutText"
                            value={form.aboutText}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>About Image</label>
                        <div className="upload-row">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, 'aboutImage')}
                                disabled={uploadingAbout}
                            />
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setForm({ ...form, aboutImage: '' })}
                            >
                                Remove Image
                            </button>
                        </div>
                        {uploadingAbout && <p className="uploading-text">Uploading image...</p>}
                        {form.aboutImage && (
                            <div className="image-preview banner">
                                <img src={form.aboutImage} alt="About preview" />
                            </div>
                        )}
                        <p className="help-text">Recommended: 1200×800px for best results.</p>
                    </div>

                    <div className="form-group">
                        <label>Story Title</label>
                        <input
                            type="text"
                            name="aboutStoryTitle"
                            value={form.aboutStoryTitle}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Story Paragraphs</label>
                        {form.aboutStoryParagraphs.map((paragraph, index) => (
                            <div key={index} className="paragraph-row">
                                <textarea
                                    rows="3"
                                    value={paragraph}
                                    onChange={(e) => handleParagraphChange(index, e.target.value)}
                                    placeholder={`Paragraph ${index + 1}`}
                                ></textarea>
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => removeParagraph(index)}
                                    disabled={form.aboutStoryParagraphs.length <= 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={addParagraph}
                        >
                            + Add Paragraph
                        </button>
                    </div>

                    <div className="form-group">
                        <label>Value Cards</label>
                        {form.aboutValues.map((value, index) => (
                            <div key={index} className="value-card-editor">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={value.title}
                                            onChange={(e) => handleValueChange(index, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Icon</label>
                                        <input
                                            type="text"
                                            value={value.icon}
                                            onChange={(e) => handleValueChange(index, 'icon', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows="2"
                                        value={value.description}
                                        onChange={(e) => handleValueChange(index, 'description', e.target.value)}
                                    ></textarea>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => removeValue(index)}
                                >
                                    Remove Card
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={addValue}
                        >
                            + Add Value Card
                        </button>
                    </div>
                </section>

                {/* Contact Info */}
                <section className="admin-form-section">
                    <h2>Contact Information</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={form.contactEmail}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={form.contactPhone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            name="contactAddress"
                            value={form.contactAddress}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                {/* Featured Products */}
                <section className="admin-form-section">
                    <h2>Featured Products</h2>
                    <p className="help-text">
                        Select products to display in the "Featured Pieces" section on the homepage.
                    </p>
                    <div className="featured-selector">
                        {products.map((product) => (
                            <label key={product._id} className="featured-option">
                                <input
                                    type="checkbox"
                                    checked={form.featuredProducts.includes(product._id)}
                                    onChange={() => toggleFeatured(product._id)}
                                />
                                <div className="featured-option-image">
                                    {product.images[0] ? <img src={product.images[0]} alt={product.name} /> : null}
                                </div>
                                <div className="featured-option-info">
                                    <span>{product.name}</span>
                                    <span>${product.price.toFixed(2)}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                <div className="form-actions sticky-actions">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
};

export default AdminCustomization;