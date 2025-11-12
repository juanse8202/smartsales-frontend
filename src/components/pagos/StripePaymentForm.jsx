/**
 * Formulario de pago con Stripe usando Elements
 */
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaCreditCard, FaLock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StripePaymentForm = ({
  clientSecret,
  onSuccess,
  onError,
  monto,
  ventaNumero,
  loading: externalLoading = false,
  isTestMode = true
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : '');
    setCardComplete(event.complete);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe no está listo. Por favor, intenta de nuevo.');
      return;
    }

    if (!cardComplete) {
      setError('Por favor, completa los datos de la tarjeta.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      console.log('💳 Procesando pago con Stripe...');
      
      const cardElement = elements.getElement(CardElement);
      
      // Confirmar el pago con Stripe Elements
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Cliente SmartSales365'
            }
          }
        }
      );

      if (stripeError) {
        console.error('❌ Error de Stripe:', stripeError);
        setError(stripeError.message);
        if (onError) onError(stripeError);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Pago exitoso:', paymentIntent);
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      } else {
        console.warn('⚠️ Estado del pago:', paymentIntent.status);
        setError(`Estado del pago: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err);
      setError('Ocurrió un error al procesar el pago. Por favor, intenta de nuevo.');
      if (onError) onError(err);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  const isLoading = processing || externalLoading || !stripe || !elements;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaCreditCard className="text-blue-600" />
            Pago con Tarjeta
          </h3>
          <FaLock className="text-green-600" title="Pago seguro" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Venta</p>
              <p className="font-semibold text-gray-800">{ventaNumero || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total a pagar</p>
              <p className="text-2xl font-bold text-blue-600">Bs. {monto?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Información de tarjeta de prueba oculta por solicitud del usuario */}
        {/* {isTestMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800 font-semibold mb-2">
              🧪 Modo de Prueba - Tarjeta de Prueba:
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-yellow-700">Número:</p>
                <p className="font-mono font-semibold text-yellow-900">4242 4242 4242 4242</p>
              </div>
              <div>
                <p className="text-yellow-700">Fecha:</p>
                <p className="font-mono font-semibold text-yellow-900">12/25</p>
              </div>
              <div>
                <p className="text-yellow-700">CVV:</p>
                <p className="font-mono font-semibold text-yellow-900">123</p>
              </div>
            </div>
          </div>
        )} */}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Stripe Card Element */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Datos de la Tarjeta
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
            <CardElement 
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <FaTimesCircle className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Información de seguridad */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaLock className="text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs font-semibold text-gray-800 mb-1">Pago 100% Seguro</p>
              <p className="text-xs text-gray-600">
                Tus datos están protegidos con encriptación SSL. No almacenamos información de tu tarjeta.
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !cardComplete}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading || !cardComplete
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <FaCheckCircle />
                Pagar Bs. {monto?.toFixed(2) || '0.00'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Nota adicional */}
      {isTestMode && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Este es un entorno de prueba. No se realizarán cargos reales.
          </p>
        </div>
      )}
    </div>
  );
};

export default StripePaymentForm;
