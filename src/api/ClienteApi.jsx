import axios from "axios";

const API_ULR = import.meta.env.VITE_API_URL;

const clienteApi = axios.create({baseURL: API_ULR, headers: {"Content-Type": "application/json"},},);

clienteApi.interceptors.request.use(
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

// ==================== FUNCIONES PARA CLIENTES ====================

/**@returns {Promise} */

export const getAllClientes = async () => {
    try{
        const response = await clienteApi.get('administracion/clientes/');
        return response.data;
    }catch(error){
        console.error('Error al obtener los registros de los clientes', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} id */

export const getCliente = async (id) => {
    try{
        const response = await clienteApi.get(`administracion/clientes/${id}/`);
        return response.data;
    }catch(error){
        console.error(`Error al obtener el cliente ${id}`, error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Object} clienteData */

export const createCliente = async (clienteData) => {
    try{
        const response = await clienteApi.post('administracion/clientes/', clienteData);
        return response.data;
    }catch(error){
        console.error('Error al crear el cliente', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} id */

export const deleteCliente = async (id) => {
    try{
        const response = await clienteApi.delete(`administracion/clientes/${id}/`);
        return response.data;
    }catch(error){
        console.error(`Error al eliminar el cliente ${id}`, error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} id */
/**@param {Object} clienteData */

export const updateCliente = async (id, clienteData) => {
    try{
        const response = await clienteApi.put(`administracion/clientes/${id}/`, clienteData);
        return response.data;
    }catch(error){
        console.error(`Error al editar el cliente ${id}`, error);
        throw error;
    }
};

export const getAllCiudades = async () => {
    try{
        const response = await clienteApi.get('administracion/ciudades/');
        return response.data;
    }catch(error){
        console.error('Error al obtener los registros de las ciudades', error);
        throw error;
    }
};

export const getAllDepartamentos = async () => {
    try{
        const response = await clienteApi.get('administracion/departamentos/');
        return response.data;
    }catch(error){
        console.error('Error al obtener los registros de los departamentos', error);
        throw error;
    }
};

export default clienteApi;