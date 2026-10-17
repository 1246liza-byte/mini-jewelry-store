import { useState, useEffect } from 'react';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../../services/productService';
import { uploadImage } from '../../services/settingsService';
import { AdminLayout } from './AdminDashboard';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const CATEGORIES = ['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Bangles', 'Pendants'];

const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: 'Necklaces',
    stock: '',
    material: '',
    featured: false,
    images: [],
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts({ page: 1 });
            setProducts(data.products);
        } catch (error) {
            setMessage({ variant: 'error', text: 'Failed to load products' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setImageUrl('');
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            material: product.material || '',
            featured: product.featured,
            images: product.images || [],
        });
        setEditingId(product._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [imageUrl, setImageUrl] = useState('');

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ variant: 'error', text: 'Please select a valid image file.' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ variant: 'error', text: 'Image must be smaller than 5MB.' });
            return;
        }

        setUploading(true);
        setMessage(null);
        try {
            const data = await uploadImage(file);
            setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
            setMessage({ variant: 'success', text: 'Image uploaded successfully!' });
        } catch (error) {
            setMessage({
                variant: 'error',
                text: error.response?.data?.message || 'Image upload failed. Please try again.',
            });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleAddImageUrl = () => {
        const url = imageUrl.trim();
        if (!url) {
            setMessage({ variant: 'error', text: 'Please paste an image URL first.' });
            return;
        }
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
        setImageUrl('');
        setMessage({ variant: 'success', text: 'Image URL added!' });
    };

    const removeImage = (index) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const payload = {
            ...form,
            price: Number(form.price),
            stock: Number(form.stock),
        };

        if (payload.images.length === 0) {
            payload.images = [
                'https://via.placeholder.com/600x600/e8b4b8/ffffff?text=No+Image',
            ];
        }

        try {
            if (editingId) {
                await updateProduct(editingId, payload);
                setMessage({ variant: 'success', text: 'Product updated successfully!' });
            } else {
                await createProduct(payload);
                setMessage({ variant: 'success', text: 'Product created successfully!' });
            }
            resetForm();
            loadProducts();
        } catch (error) {
            setMessage({
                variant: 'error',
                text: error.response?.data?.message || 'Failed to save product',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            setMessage({ variant: 'success', text: 'Product deleted' });
            loadProducts();
        } catch (error) {
            setMessage({ variant: 'error', text: 'Failed to delete product' });
        }
    };

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Products</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? 'Cancel' : '+ Add Product'}
                </button>
            </div>

            {message && <Message variant={message.variant}>{message.text}</Message>}

            {showForm && (
                <form className="admin-form" onSubmit={handleSubmit}>
                    <h2>{editingId ? 'Edit Product' : 'New Product'}</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            rows="3"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Material</label>
                            <input
                                type="text"
                                value={form.material}
                                onChange={(e) => setForm({ ...form, material: e.target.value })}
                                placeholder="e.g. Rose Gold, Diamond"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                            />
                            Featured product (shown on homepage)
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Product Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                        {uploading && <p className="uploading-text">Uploading image...</p>}

                        <div className="image-url-row">
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Or paste an image URL (e.g. https://...)"
                            />
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleAddImageUrl}
                            >
                                Add
                            </button>
                        </div>

                        {form.images.length > 0 && (
                            <div className="image-previews">
                                {form.images.map((img, idx) => (
                                    <div key={idx} className="image-preview">
                                        <img src={img} alt={`Preview ${idx + 1}`} />
                                        <button
                                            type="button"
                                            className="image-remove"
                                            onClick={() => removeImage(idx)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="form-hint">
                            You can upload an image or paste an image URL. If you leave it empty, a placeholder will be used.
                        </p>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                            {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={resetForm}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <Loader />
            ) : products.length === 0 ? (
                <p className="admin-empty">No products yet. Add your first product!</p>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="table-image">
                                            {product.images[0] ? (
                                                <img src={product.images[0]} alt={product.name} />
                                            ) : (
                                                <span>—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="table-name">{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.featured ? '★' : '—'}</td>
                                    <td className="table-actions">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => handleEdit(product)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProducts;