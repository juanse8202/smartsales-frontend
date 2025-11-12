/**
 * API para gestión de Pagos
 * Endpoints: /api/pagos/
 */
import axiosInstance from './axiosConfig';

/**
 * Obtener todos los pagos con filtros opcionales
 * @param {Object} params - Parámetros de filtro { venta, estado }
 * @returns {Promise} Lista de pagos
 */
export const getAllPagos = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/pagos/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    throw error;
  }
};

/**
 * Obtener un pago por ID
 * @param {number} id - ID del pago
 * @returns {Promise} Datos del pago
 */
export const getPagoById = async (id) => {
  try {
    const response = await axiosInstance.get(`/pagos/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener pago ${id}:`, error);
    throw error;
  }
};

/**
 * Registrar un nuevo pago
 * @param {Object} pagoData - Datos del pago
 * @returns {Promise} Pago creado
 */
export const createPago = async (pagoData) => {
  try {
    const response = await axiosInstance.post('/pagos/', pagoData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar pago:', error);
    throw error;
  }
};

/**
 * Actualizar un pago
 * @param {number} id - ID del pago
 * @param {Object} pagoData - Datos actualizados
 * @returns {Promise} Pago actualizado
 */
export const updatePago = async (id, pagoData) => {
  try {
    const response = await axiosInstance.patch(`/pagos/${id}/`, pagoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar pago ${id}:`, error);
    throw error;
  }
};

/**
 * Obtener pagos de una venta específica
 * @param {number} ventaId - ID de la venta
 * @returns {Promise} Lista de pagos
 */
export const getPagosByVenta = async (ventaId) => {
  try {
    const response = await axiosInstance.get('/pagos/', {
      params: { venta: ventaId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener pagos de venta ${ventaId}:`, error);
    throw error;
  }
};
