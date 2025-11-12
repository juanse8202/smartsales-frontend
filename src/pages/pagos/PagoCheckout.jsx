/**
 * Página de Checkout - Procesar pago de una venta con Stripe
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCreditCard,
  FaArrowLeft,
  FaShoppingCart
} from 'react-icons/fa';

import StripePaymentForm from '../../components/pagos/StripePaymentForm';
import { createPaymentIntent, verifyPayment } from '../../api/StripeApi';
import { getVentaById } from '../../api/VentaApi';
import { useCart } from '../../context/CartContext';

// Inicializar Stripe con la clave pública
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

console.log('🔑 Stripe Key disponible:', STRIPE_KEY ? 'Sí ✅' : 'No ❌');

if (!STRIPE_KEY) {
  console.error('❌ ERROR: VITE_STRIPE_PUBLISHABLE_KEY no está definida');
}

const stripePromise = loadStripe(STRIPE_KEY);

const PagoCheckout = ({ isEcommerce = false }) => {
  const { ventaId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingVenta, setLoadingVenta] = useState(true);
  const [error, setError] = useState('');
  const [pagoCompletado, setPagoCompletado] = useState(false);
  const [pagoInfo, setPagoInfo] = useState(null);
  const [paymentIntentCreated, setPaymentIntentCreated] = useState(false);
  
  // Información de la venta
  const [ventaInfo, setVentaInfo] = useState(null);

  // Cargar información de la venta
  useEffect(() => {
    const cargarVenta = async () => {
      try {
        setLoadingVenta(true);
        console.log('📦 Cargando venta:', ventaId);
        
        const venta = await getVentaById(ventaId);
        console.log('✅ Venta cargada:', venta);
        
        // Convertir valores numéricos que vienen como strings
        const ventaParsed = {
          ...venta,
          subtotal: parseFloat(venta.subtotal) || 0,
          impuesto: parseFloat(venta.impuesto) || 0,
          descuento: parseFloat(venta.descuento) || 0,
          costo_envio: parseFloat(venta.costo_envio) || 0,
          total: parseFloat(venta.total) || 0
        };
        
        console.log('✅ Venta parseada:', ventaParsed);
        setVentaInfo(ventaParsed);
        setError('');
      } catch (err) {
        console.error('❌ Error al cargar venta:', err);
        setError('No se pudo cargar la información de la venta');
      } finally {
        setLoadingVenta(false);
      }
    };

    if (ventaId) {
      cargarVenta();
    }
  }, [ventaId]);

  // Crear Payment Intent cuando la venta esté cargada (solo una vez)
  useEffect(() => {
    if (ventaInfo && !clientSecret && !pagoCompletado && !loadingVenta && !paymentIntentCreated) {
      handleCreatePaymentIntent();
    }
  }, [ventaInfo, loadingVenta, paymentIntentCreated]);

  const handleCreatePaymentIntent = async () => {
    // Evitar llamadas duplicadas
    if (paymentIntentCreated) {
      console.log('⚠️ Payment Intent ya fue creado, omitiendo...');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentIntentCreated(true); // Marcar como iniciado

    try {
      console.log('💳 Creando Payment Intent para venta:', ventaId);
      
      const response = await createPaymentIntent({
        venta_id: ventaId,
        monto: ventaInfo.total,
        moneda: 'BOB',
        descripcion: `Pago de Venta #${ventaId} - Cliente: ${ventaInfo.cliente_nombre || 'N/A'}`
      });

      if (response.reutilizado) {
        console.log('♻️ Payment Intent reutilizado:', response.payment_intent_id);
      } else {
        console.log('✅ Payment Intent creado:', response);
      }
      
      setClientSecret(response.client_secret);
    } catch (err) {
      console.error('❌ Error al crear Payment Intent:', err);
      setError(err.response?.data?.error || 'Error al inicializar el pago');
      setPaymentIntentCreated(false); // Resetear en caso de error para permitir reintentar
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = async (paymentIntent) => {
    try {
      setLoading(true);
      console.log('✅ Payment Intent exitoso:', paymentIntent);
      
      // Verificar el pago en el backend
      const verificacion = await verifyPayment(paymentIntent.id);
      console.log('✅ Pago verificado:', verificacion);
      
      // Vaciar el carrito ahora que el pago fue exitoso usando el contexto
      try {
        console.log('🛒 Intentando vaciar el carrito...');
        const result = await clearCart();
        if (result.success) {
          console.log('✅ Carrito vaciado exitosamente');
        } else {
          console.error('⚠️ Error al vaciar carrito:', result.error);
        }
      } catch (cartError) {
        console.error('⚠️ Error al vaciar carrito (no crítico):', cartError);
        // No mostrar error al usuario ya que el pago fue exitoso
      }
      
      setPagoInfo(verificacion.pago);
      setPagoCompletado(true);
    } catch (err) {
      console.error('❌ Error al verificar pago:', err);
      setError('El pago se procesó pero hubo un error al verificarlo');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeError = (error) => {
    console.error('❌ Error en pago con Stripe:', error);
    setError(error.message || 'Ocurrió un error al procesar el pago');
  };

  const handleVolverVentas = () => {
    if (isEcommerce) {
      navigate('/');
    } else {
      navigate('/dashboard/ventas');
    }
  };

  const handleVerDetalle = () => {
    if (isEcommerce) {
      navigate('/');
    } else {
      navigate(`/dashboard/ventas/${ventaId}`);
    }
  };

  // Vista de carga
  if (loadingVenta) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando información...</h2>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  // Error al cargar venta
  if (!ventaInfo && error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleVolverVentas}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isEcommerce ? 'Volver a la Tienda' : 'Volver a Ventas'}
          </button>
        </div>
      </div>
    );
  }

  // Validar monto
  if (ventaInfo && ventaInfo.total <= 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FaTimesCircle className="text-yellow-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Monto Inválido</h2>
          <p className="text-gray-600 mb-6">El monto de la venta debe ser mayor a 0</p>
          <button
            onClick={handleVolverVentas}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isEcommerce ? 'Volver a la Tienda' : 'Volver a Ventas'}
          </button>
        </div>
      </div>
    );
  }

  // Vista de éxito
  if (pagoCompletado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <FaCheckCircle className="text-green-600 text-5xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Pago Exitoso!</h2>
            <p className="text-gray-600">Tu pago se ha procesado correctamente</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Venta:</span>
              <span className="font-semibold">#{ventaId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-semibold">{ventaInfo.cliente_nombre || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Monto Pagado:</span>
              <span className="font-semibold text-green-600">Bs. {pagoInfo?.monto || ventaInfo.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                {pagoInfo?.estado || 'Completado'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {!isEcommerce && (
              <button
                onClick={handleVerDetalle}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Ver Detalle de la Venta
              </button>
            )}
            <button
              onClick={handleVolverVentas}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isEcommerce ? 'Volver a la Tienda' : 'Volver a Ventas'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal de pago
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleVolverVentas}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Procesar Pago</h1>
        </div>

        {/* Resumen de la venta */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaShoppingCart className="text-blue-600 text-2xl" />
            <h2 className="text-xl font-bold text-gray-800">Resumen de la Venta</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Venta:</span>
                <span className="font-semibold">#{ventaId}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-semibold">{ventaInfo.cliente_nombre || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Estado:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  ventaInfo.estado === 'completada' ? 'bg-green-100 text-green-800' :
                  ventaInfo.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ventaInfo.estado}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">Bs. {ventaInfo.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Impuesto:</span>
                <span className="font-semibold">Bs. {ventaInfo.impuesto?.toFixed(2)}</span>
              </div>
              {ventaInfo.descuento > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-semibold text-red-600">- Bs. {ventaInfo.descuento?.toFixed(2)}</span>
                </div>
              )}
              {ventaInfo.costo_envio > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">Bs. {ventaInfo.costo_envio?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-gray-700">Total a Pagar:</span>
                <span className="text-3xl font-bold text-blue-600">
                  Bs. {ventaInfo.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error general */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Advertencia si no hay Stripe Key */}
        {!STRIPE_KEY && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Configuración incompleta</h4>
            <p className="text-yellow-700 text-sm">
              La clave pública de Stripe no está configurada. Contacta con el administrador.
            </p>
          </div>
        )}

        {/* Formulario de pago con Stripe */}
        {clientSecret && STRIPE_KEY && (
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              clientSecret={clientSecret}
              onSuccess={handleStripeSuccess}
              onError={handleStripeError}
              monto={ventaInfo.total}
              ventaNumero={`Venta #${ventaId}`}
              loading={loading}
              isTestMode={true}
            />
          </Elements>
        )}

        {/* Cargando Payment Intent */}
        {!clientSecret && !error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Inicializando pago...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagoCheckout;
