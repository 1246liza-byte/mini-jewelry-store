import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item._id === product._id);

            if (existingItem) {
                return prevItems.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [
                ...prevItems,
                {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.images && product.images[0] ? product.images[0] : '',
                    stock: product.stock,
                    quantity,
                },
            ];
        });
    };

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === id ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                cartSubtotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};