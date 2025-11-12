import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const bitacoraApi = axios.create({baseURL: API_URL, headers: {'Content-Type': 'application/json',},});

bitacoraApi.interceptors.request.use(
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

// ==================== FUNCIONES PARA BITACORA ====================

/**@returns {Promise} */

export const getAllBitacora = async () => {
    try{
        const response = await bitacoraApi.get('administracion/bitacoras/'); 
        return response.data;
    }catch (error) {
        console.error('Error al obtener los registros de la bitacora', error);
        throw error;
    }
};

export default bitacoraApi;