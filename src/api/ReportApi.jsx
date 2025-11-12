import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const reportApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

reportApi.interceptors.request.use(
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

/**
 * Generar reporte desde un prompt de texto o voz
 * @param {string} prompt - Descripción en lenguaje natural del reporte
 * @returns {Promise}
 */
export const generateReport = async (prompt) => {
    try {
        const response = await reportApi.post('reports/', { prompt });
        return response.data;
    } catch (error) {
        console.error('Error al generar reporte:', error);
        throw error;
    }
};

/**
 * Descargar reporte en formato específico (PDF o Excel)
 * @param {string} prompt - Descripción del reporte
 * @returns {Promise<Blob>}
 */
export const downloadReport = async (prompt) => {
    try {
        const response = await reportApi.post('reports/', 
            { prompt },
            { responseType: 'blob' }
        );
        return response.data;
    } catch (error) {
        console.error('Error al descargar reporte:', error);
        throw error;
    }
};

export default reportApi;
