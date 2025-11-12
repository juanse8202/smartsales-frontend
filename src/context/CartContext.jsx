import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyCart, addItemToCart, updateCartItemQuantity, removeCartItem, clearCart as clearCartApi } from '../api/CartApi';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar el carrito al montar el componente
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await getMyCart();
            setCart(data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar el carrito:', err);
            // Si no está autenticado (401), simplemente usar carrito vacío sin error
            if (err.response?.status === 401) {
                setCart({ items: [], total_price: 0 });
                setError(null);
            } else {
                setError('Error al cargar el carrito');
                setCart({ items: [], total_price: 0 });
            }
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (catalogoId, quantity = 1) => {
        try {
            setLoading(true);
            const data = await addItemToCart({ catalogo_id: catalogoId, quantity });
            setCart(data);
            setError(null);
            return { success: true };
        } catch (err) {
            console.error('Error al agregar al carrito:', err);
            // Mensaje específico para usuarios no autenticados
            if (err.response?.status === 401) {
                setError('Debes iniciar sesión para agregar productos al carrito');
                return { success: false, error: err, needsLogin: true };
            }
            setError('Error al agregar el producto');
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            setLoading(true);
            const data = await updateCartItemQuantity(itemId, quantity);
            setCart(data);
            setError(null);
        } catch (err) {
            console.error('Error al actualizar cantidad:', err);
            setError('Error al actualizar la cantidad');
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        try {
            setLoading(true);
            const data = await removeCartItem(itemId);
            setCart(data);
            setError(null);
        } catch (err) {
            console.error('Error al eliminar del carrito:', err);
            setError('Error al eliminar el producto');
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            const data = await clearCartApi();
            setCart(data.cart);
            setError(null);
            return { success: true };
        } catch (err) {
            console.error('Error al vaciar el carrito:', err);
            setError('Error al vaciar el carrito');
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const getItemCount = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        if (!cart) return 0;
        return cart.total_price || 0;
    };

    const value = {
        cart,
        loading,
        error,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        loadCart,
        getItemCount,
        getTotalPrice,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
