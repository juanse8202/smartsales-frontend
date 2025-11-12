import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const catalogoApi = axios.create({baseURL: API_URL, headers: {'Content-Type': 'application/json',},});

catalogoApi.interceptors.request.use(
    (config) =>{
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
);

// ==================== FUNCIONES PARA CATALOGOS ====================

/**@returns {Promise} */

export const getAllCatalogo = async () => {
    try {
        const response = await catalogoApi.get('catalogo/');
        return response.data;
    }catch (error){
        console.error('Error al obtener los registros de los catalogos', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} id */

export const getCatalogo = async (id) => {
    try{
        const response = await catalogoApi.get(`catalogo/${id}/`);
        return response.data;
    }catch (error){
        console.error(`Error al obtner el catlogo ${id}: `, error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} id */

export const deleteCatalogo = async (id) => {
    try{
        const response = await catalogoApi.delete(`catalogo/${id}/`);
        return response.data;
    }catch(error){
        console.error(`Error al eliminar el catalogo ${id}: `, error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {FormData} catalogoData - FormData con los datos del catálogo (el backend maneja la subida de imagen) */

export const createCatalogo = async (catalogoData) => {
    try{
        const response = await catalogoApi.post('catalogo/', catalogoData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }catch(error){
        console.error('Error al crear el catalogo', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} id */
/**@param {FormData} catalogoData - FormData con los datos del catálogo (el backend maneja la subida de imagen) */

export const updateCatalogo = async (id, catalogoData) => {
    try{
        const response = await catalogoApi.put(`catalogo/${id}/`, catalogoData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }catch(error){
        console.error(`Error al actualizar el catalogo ${id}: `, error);
        throw error;
    }
};

/**@returns {Promise} */

export const getAllCategorias = async () => {
    try{
        const response = await catalogoApi.get('categorias/');
        return response.data;
    }catch(error){
        console.error('Error al obtener los registros de categoria', error);
        throw error;
    }
};

/**@returns {Promise} */

export const getAllMarcas = async () => {
    try{
        const response = await catalogoApi.get('marcas/');
        return response.data;
    }catch(error){
        console.error('Error al obtener los registros de marca', error);
        throw error;
    }
};

export default catalogoApi;