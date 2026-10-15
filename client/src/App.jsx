import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Public pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Account from './pages/Account';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomization from './pages/admin/AdminCustomization';

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Private customer routes */}
                    <Route
                        path="/checkout"
                        element={
                            <PrivateRoute>
                                <Checkout />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/order-confirmation/:id"
                        element={
                            <PrivateRoute>
                                <OrderConfirmation />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/account"
                        element={
                            <PrivateRoute>
                                <Account />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin routes */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/products"
                        element={
                            <AdminRoute>
                                <AdminProducts />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/orders"
                        element={
                            <AdminRoute>
                                <AdminOrders />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/customization"
                        element={
                            <AdminRoute>
                                <AdminCustomization />
                            </AdminRoute>
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;