import axios from "axios";

const API_ULR = import.meta.env.VITE_API_URL;

const ubicacionApi = axios.create({
    baseURL: API_ULR, 
    headers: {"Content-Type": "application/json"},
});

ubicacionApi.interceptors.request.use(
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

// ==================== FUNCIONES PARA DEPARTAMENTOS ====================

/**@returns {Promise} */

export const getAllDepartamentos = async () => {
    try{
        const response = await ubicacionApi.get('administracion/departamentos/');
        return response.data;
    }catch(error){
        console.error('Error al obtener los departamentos', error);
        throw error;
    }
};

// ==================== FUNCIONES PARA CIUDADES ====================

/**@returns {Promise} */

export const getAllCiudades = async () => {
    try{
        const response = await ubicacionApi.get('administracion/ciudades/');
        return response.data;
    }catch(error){
        console.error('Error al obtener las ciudades', error);
        throw error;
    }
};

/**@returns {Promise} */
/**@param {Number} departamentoId */

export const getCiudadesByDepartamento = async (departamentoId) => {
    try{
        const response = await ubicacionApi.get(`administracion/ciudades/?departamento=${departamentoId}`);
        return response.data;
    }catch(error){
        console.error(`Error al obtener las ciudades del departamento ${departamentoId}`, error);
        throw error;
    }
};

export default ubicacionApi;
