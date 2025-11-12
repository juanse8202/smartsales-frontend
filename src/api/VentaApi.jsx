/**
 * API para gestión de Ventas
 * Endpoints: /api/ventas/
 */
import axiosInstance from './axiosConfig';

/**
 * Obtener todas las ventas con filtros opcionales
 * @param {Object} params - Parámetros de filtro { cliente, estado }
 * @returns {Promise} Lista de ventas
 */
export const getAllVentas = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/ventas/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw error;
  }
};

/**
 * Obtener una venta por ID
 * @param {number} id - ID de la venta
 * @returns {Promise} Datos de la venta
 */
export const getVentaById = async (id) => {
  try {
    const response = await axiosInstance.get(`/ventas/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener venta ${id}:`, error);
    throw error;
  }
};

/**
 * Crear una nueva venta con sus detalles
 * @param {Object} ventaData - Datos de la venta
 * @returns {Promise} Venta creada
 */
export const createVenta = async (ventaData) => {
  try {
    const response = await axiosInstance.post('/ventas/', ventaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw error;
  }
};

/**
 * Actualizar una venta
 * @param {number} id - ID de la venta
 * @param {Object} ventaData - Datos actualizados
 * @returns {Promise} Venta actualizada
 */
export const updateVenta = async (id, ventaData) => {
  try {
    const response = await axiosInstance.patch(`/ventas/${id}/`, ventaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar venta ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar una venta
 * @param {number} id - ID de la venta
 * @returns {Promise}
 */
export const deleteVenta = async (id) => {
  try {
    const response = await axiosInstance.delete(`/ventas/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar venta ${id}:`, error);
    throw error;
  }
};

/**
 * Cambiar el estado de una venta
 * @param {number} id - ID de la venta
 * @param {string} estado - Nuevo estado (pendiente/completada/cancelada)
 * @returns {Promise} Venta actualizada
 */
export const cambiarEstadoVenta = async (id, estado) => {
  try {
    const response = await axiosInstance.post(`/ventas/${id}/cambiar_estado/`, { estado });
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de venta ${id}:`, error);
    throw error;
  }
};

/**
 * Obtener estadísticas de ventas
 * @returns {Promise} Estadísticas
 */
export const getEstadisticasVentas = async () => {
  try {
    const response = await axiosInstance.get('/ventas/estadisticas/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Obtener detalles de una venta específica
 * @param {number} ventaId - ID de la venta
 * @returns {Promise} Lista de detalles
 */
export const getDetallesVenta = async (ventaId) => {
  try {
    const response = await axiosInstance.get('/detalle-ventas/', {
      params: { venta: ventaId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalles de venta ${ventaId}:`, error);
    throw error;
  }
};
