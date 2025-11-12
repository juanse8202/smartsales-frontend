import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const usuarioApi = axios.create({baseURL: API_URL, headers: {'Content-Type': 'application/json',},});

usuarioApi.interceptors.request.use(
    (config) => { 
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
);
// ==================== FUNCIONES PARA USUARIOS ====================

/**@returns {Promise} */

export const getAllUsuarios = async () => {
    try{
        const response = await usuarioApi.get('administracion/users/');
        return response.data;
    }catch(error){
        console.error('Error al obtener todos los registros de usuario', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} id */

export const getUsuario = async (id) => {
    try{
        const response = await usuarioApi.get(`administracion/users/${id}/`);
        return response.data; 
    }catch(error){
        console.error(`Error al obtener el usuario ${id}: `, error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Object} usuarioData */

export const createUsuario = async (usuarioData) => {
    try{
        const response = await usuarioApi.post('administracion/users/', usuarioData);
        return response.data;
    }catch(error){
        console.error('Error al crear el usuario', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} id */
/**@param {Object} usuarioData */

export const updateUsuario = async (id, usuarioData) => {
    try{
        const response = await usuarioApi.put(`administracion/users/${id}/`, usuarioData);
        return response.data;
    }catch(error){
        console.error(`Error al editar el usuario ${id}: `, error);
        throw error;
    }
}

/**@returns {Promise} */
/**@param {Nmuber} id */

export const deleteUsuario = async (id) => {
    try{
        const response = await usuarioApi.delete(`administracion/users/${id}/`);
        return response.data;
    }catch(error){
        console.error(`Error al eliminar el usuario ${id}: `, error);
        throw error;
    }
}

export default usuarioApi;

