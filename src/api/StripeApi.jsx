/**
 * API para gestión de pagos con Stripe - SmartSales365
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

// Configurar axios con interceptores para autenticación
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ==================== FUNCIONES DE STRIPE ====================

/**
 * Crear un Payment Intent de Stripe para una venta
 * @param {Object} data - Datos para crear el payment intent
 * @param {number} data.venta_id - ID de la venta
 * @param {number} [data.monto] - Monto a cobrar (opcional, usa el total de la venta)
 * @param {string} [data.moneda] - Moneda (BOB, USD, EUR)
 * @param {string} [data.descripcion] - Descripción del pago
 * @returns {Promise<Object>} Client secret y datos del payment intent
 */
export const createPaymentIntent = async (data) => {
  try {
    console.log('🔄 Creando Payment Intent con datos:', data);
    const response = await apiClient.post('finanzas/stripe/create-payment-intent/', data);
    console.log('✅ Payment Intent creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear Payment Intent:', error);
    throw error;
  }
};

/**
 * Confirmar un pago de Stripe automáticamente (solo pruebas)
 * @param {string} paymentIntentId - ID del Payment Intent
 * @returns {Promise<Object>} Confirmación del pago
 */
export const confirmPaymentAuto = async (paymentIntentId) => {
  try {
    console.log('🔄 Confirmando pago automáticamente:', paymentIntentId);
    const response = await apiClient.post('finanzas/stripe/confirm-payment-auto/', {
      payment_intent_id: paymentIntentId
    });
    console.log('✅ Pago confirmado automáticamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al confirmar pago automáticamente:', error);
    throw error;
  }
};

/**
 * Confirmar un pago de Stripe con tarjeta
 * @param {Object} data - Datos de confirmación
 * @param {string} data.payment_intent_id - ID del Payment Intent
 * @param {string} [data.payment_method_id] - ID del payment method
 * @param {string} [data.card_number] - Número de tarjeta (alternativa)
 * @returns {Promise<Object>} Confirmación del pago
 */
export const confirmPaymentWithCard = async (data) => {
  try {
    console.log('🔄 Confirmando pago con tarjeta:', data);
    const response = await apiClient.post('finanzas/stripe/confirm-payment-with-card/', data);
    console.log('✅ Pago confirmado con tarjeta:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al confirmar pago con tarjeta:', error);
    throw error;
  }
};

/**
 * Verificar el estado de un pago
 * @param {string} paymentIntentId - ID del Payment Intent
 * @returns {Promise<Object>} Estado del pago
 */
export const verifyPayment = async (paymentIntentId) => {
  try {
    console.log('🔍 Verificando pago:', paymentIntentId);
    const response = await apiClient.post('finanzas/stripe/verify-payment/', {
      payment_intent_id: paymentIntentId
    });
    console.log('✅ Estado del pago:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al verificar pago:', error);
    throw error;
  }
};

// ==================== FUNCIONES DE CONSULTA ====================

/**
 * Obtener todos los pagos (con filtros opcionales)
 * @param {Object} filters - Filtros opcionales (venta, estado, proveedor, cliente)
 * @returns {Promise<Array>} Lista de pagos
 */
export const fetchPagos = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.venta) params.append('venta', filters.venta);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.proveedor) params.append('proveedor', filters.proveedor);
    if (filters.cliente) params.append('cliente', filters.cliente);
    
    const response = await apiClient.get(`finanzas/pagos-stripe/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    throw error;
  }
};

/**
 * Obtener un pago por ID
 * @param {number} id - ID del pago
 * @returns {Promise<Object>} Datos del pago
 */
export const fetchPagoById = async (id) => {
  try {
    const response = await apiClient.get(`finanzas/pagos-stripe/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pago:', error);
    throw error;
  }
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Formatear monto en bolivianos
 * @param {number} monto - Monto a formatear
 * @returns {string} Monto formateado
 */
export const formatMonto = (monto) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(monto);
};

/**
 * Obtener el color del badge según el estado del pago
 * @param {string} estado - Estado del pago
 * @returns {string} Clase CSS para el color
 */
export const getEstadoColor = (estado) => {
  const colores = {
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'completado': 'bg-green-100 text-green-800',
    'fallido': 'bg-red-100 text-red-800',
    'reembolsado': 'bg-purple-100 text-purple-800',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtener el ícono según el proveedor de pago
 * @param {string} proveedor - Proveedor de pago
 * @returns {string} Nombre del ícono
 */
export const getProveedorIcon = (proveedor) => {
  const iconos = {
    'Stripe': 'FaStripe',
    'Efectivo': 'FaMoneyBillWave',
    'Transferencia': 'FaExchangeAlt',
  };
  return iconos[proveedor] || 'FaCreditCard';
};

export default {
  createPaymentIntent,
  confirmPaymentAuto,
  confirmPaymentWithCard,
  verifyPayment,
  fetchPagos,
  fetchPagoById,
  formatMonto,
  getEstadoColor,
  getProveedorIcon,
};
