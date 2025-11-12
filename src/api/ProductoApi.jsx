import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const productoApi = axios.create({baseURL: API_URL, headers: {'Content-Type': 'application/json',},});

productoApi.interceptors.request.use(
    (config) =>{
        const accessToken = localStorage.getItem('access_token')
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== FUNCIONES PARA PRODUCTOS ====================

/**@returns {Promise} */

export const getAllProductos = async () => {
    try{
        const response = await productoApi.get('productos/');
        return response.data;
    } catch(error){
        console.error('Error al obtener los productos', error);
        throw error;
    }
};

/**@param {number} id */
/**@returns {Promise} */

export const deleteProducto = async (id) => {
    try{
        const response = await productoApi.delete(`productos/${id}/`);
        return response.data;
    }catch (error){
        console.error(`Error al eliminar el producto ${id}: `, error);
        throw error;
    }
};

/**@param {Object} productoData */
/**@returns {Promise} */

export const createProducto = async (productoData) => {
    try{
        const response = productoApi.post('productos/', productoData);
        return (await response).data;
    }catch (error) {
        console.error('Error al crear el producto', error);
        throw error;
    }
}

/**@param {Object} productoData */
/**@param {Number} id */
/**@returns {Promise} */

export const updateProducto = async (id, productoData) => {
    try{
        const response = await productoApi.put(`productos/${id}/`, productoData);
        return response.data;
    }catch (error) {
        console.error(`Error al actualizar el producto ${id}:`, error);
        throw error;
    }
}

/**@returns {Promise} */
/**@param {Number} id */

export const getProducto = async (id) => {
    try{
        const response = await productoApi.get(`productos/${id}/`);
        return response.data;
    }catch(error){
        console.error(`Error al obtener el producto ${id}: `, error);
        throw error;
    }
};

export default productoApi;
