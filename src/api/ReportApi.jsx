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

/**
 * Generar reporte estándar predefinido
 * @param {string} reportKey - Clave del reporte predefinido (sales_this_month_excel, inventory_available_pdf)
 * @returns {Promise<Blob>}
 */
export const generateStandardReport = async (reportKey) => {
    try {
        const response = await reportApi.get(`standard/${reportKey}/`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error al generar reporte estándar:', error);
        throw error;
    }
};

/**
 * Descargar reporte de ventas del mes actual en Excel
 * @returns {Promise<Blob>}
 */
export const downloadSalesThisMonthExcel = async () => {
    return generateStandardReport('sales_this_month_excel');
};

/**
 * Descargar reporte de inventario disponible en PDF agrupado por categoría
 * @returns {Promise<Blob>}
 */
export const downloadInventoryAvailablePdf = async () => {
    return generateStandardReport('inventory_available_pdf');
};

export default reportApi;
