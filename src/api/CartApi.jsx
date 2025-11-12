import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const cartApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

cartApi.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== FUNCIONES PARA CARRITO ====================

/**
 * Obtener el carrito actual del usuario
 * @returns {Promise}
 */
export const getMyCart = async () => {
    try {
        const response = await cartApi.get('cart/my_cart/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        throw error;
    }
};

/**
 * Agregar un ítem al carrito
 * @param {Object} data - { catalogo_id: number, quantity: number }
 * @returns {Promise}
 */
export const addItemToCart = async (data) => {
    try {
        const response = await cartApi.post('cart/add_item/', data);
        return response.data;
    } catch (error) {
        console.error('Error al agregar ítem al carrito:', error);
        throw error;
    }
};

/**
 * Actualizar la cantidad de un ítem en el carrito
 * @param {Number} itemId - ID del CartItem
 * @param {Number} quantity - Nueva cantidad
 * @returns {Promise}
 */
export const updateCartItemQuantity = async (itemId, quantity) => {
    try {
        const response = await cartApi.patch(`cart/update_item/${itemId}/`, { quantity });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        throw error;
    }
};

/**
 * Eliminar un ítem del carrito
 * @param {Number} itemId - ID del CartItem
 * @returns {Promise}
 */
export const removeCartItem = async (itemId) => {
    try {
        const response = await cartApi.delete(`cart/remove_item/${itemId}/`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar ítem del carrito:', error);
        throw error;
    }
};

/**
 * Crear una venta desde el carrito (checkout)
 * @param {Object} data - { cliente_id: number, direccion: string, impuesto: number, descuento: number, costo_envio: number }
 * @returns {Promise} - Venta creada
 */
export const checkoutCart = async (data) => {
    try {
        const response = await cartApi.post('cart/checkout/', data);
        return response.data;
    } catch (error) {
        console.error('Error en checkout:', error);
        throw error;
    }
};

/**
 * Vaciar el carrito completamente
 * Se llama cuando el pago es exitoso
 * @returns {Promise}
 */
export const clearCart = async () => {
    try {
        const response = await cartApi.post('cart/clear_cart/');
        return response.data;
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        throw error;
    }
};

export default cartApi;
