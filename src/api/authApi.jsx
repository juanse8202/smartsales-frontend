import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const authApi = axios.create({
    baseURL: API_URL,
    headers: {"Content-Type": "application/json"},
});

authApi.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== FUNCIONES DE AUTENTICACIÓN ====================

/**@returns {Promise} */
/**@param {string} username */
/**@param {string} password */

export const login = async (username, password) => {
    try{
        const response = await authApi.post('login/', { username, password });
        return response.data;
    }catch(error){
        console.error('Error al iniciar sesión', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Object} userData */

export const register = async (userData) => {
    try{
        const response = await authApi.post('register/', userData);
        return response.data;
    }catch(error){
        console.error('Error al registrarse', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {string} refreshToken */

export const logout = async (refreshToken) => {
    try{
        const response = await authApi.post('logout/', { refresh: refreshToken });
        return response.data;
    }catch(error){
        console.error('Error al cerrar sesión', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {string} refreshToken */

export const refreshToken = async (refreshToken) => {
    try{
        const response = await authApi.post('refresh/', { refresh: refreshToken });
        return response.data;
    }catch(error){
        console.error('Error al refrescar token', error);
        throw error;
    }
};

/**@returns {Promise} */

export const getProfile = async () => {
    try{
        const response = await authApi.get('profile/');
        return response.data;
    }catch(error){
        console.error('Error al obtener perfil', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Object} passwords */

export const changePassword = async (passwords) => {
    try{
        const response = await authApi.post('change-password/', passwords);
        return response.data;
    }catch(error){
        console.error('Error al cambiar contraseña', error);
        throw error;
    }
};

export default authApi;
