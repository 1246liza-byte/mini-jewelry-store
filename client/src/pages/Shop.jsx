import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const page = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch((err) => console.error('Failed to load categories:', err));
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = { page };
                if (keyword) params.keyword = keyword;
                if (category) params.category = category;
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;

                const data = await getProducts(params);
                setProducts(data.products);
                setPages(data.pages);
                setTotal(data.totalProducts);
            } catch (error) {
                console.error('Failed to load products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const applyFilters = (e) => {
        e.preventDefault();
        const params = {};
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        setSearchParams(params);
    };

    const clearFilters = () => {
        setKeyword('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSearchParams({});
    };

    const goToPage = (p) => {
        const params = {};
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        params.page = p;
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="shop-page">
            <div className="page-header">
                <div className="container">
                    <h1>Our Collection</h1>
                    <p>Discover timeless pieces crafted with elegance</p>
                </div>
            </div>

            <div className="container shop-layout">
                {/* Filters Sidebar */}
                <aside className="filters">
                    <h3 className="filters-title">Filters</h3>
                    <form onSubmit={applyFilters}>
                        <div className="filter-group">
                            <label htmlFor="search">Search</label>
                            <input
                                id="search"
                                type="text"
                                placeholder="Search products..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Price Range</label>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    min="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <span>—</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    min="0"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter-actions">
                            <button type="submit" className="btn btn-primary">
                                Apply Filters
                            </button>
                            <button type="button" className="btn btn-outline" onClick={clearFilters}>
                                Clear
                            </button>
                        </div>
                    </form>
                </aside>

                {/* Products */}
                <div className="shop-products">
                    <div className="shop-results-bar">
                        <span>
                            {total} {total === 1 ? 'product' : 'products'} found
                        </span>
                    </div>

                    {loading ? (
                        <Loader />
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search terms.</p>
                            <button className="btn btn-primary" onClick={clearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {pages > 1 && (
                                <div className="pagination">
                                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            className={`page-btn ${p === page ? 'active' : ''}`}
                                            onClick={() => goToPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;