/**
 * Botón para iniciar el proceso de pago de una venta
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaLock } from 'react-icons/fa';

const BotonPagarVenta = ({ 
  ventaId, 
  ventaTotal, 
  ventaEstado,
  disabled = false,
  className = ''
}) => {
  const navigate = useNavigate();

  const handlePagar = () => {
    if (ventaId) {
      navigate(`/dashboard/ventas/pagar/${ventaId}`);
    }
  };

  // No mostrar el botón si la venta ya está completada o cancelada
  if (ventaEstado === 'completada' || ventaEstado === 'cancelada') {
    return null;
  }

  const isDisabled = disabled || !ventaId || ventaTotal <= 0;

  return (
    <button
      onClick={handlePagar}
      disabled={isDisabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
        transition-all duration-200
        ${isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
        }
        ${className}
      `}
      title={isDisabled ? 'No se puede procesar el pago' : 'Procesar pago con tarjeta'}
    >
      <FaCreditCard />
      <span>Pagar con Tarjeta</span>
      <FaLock className="text-sm" />
    </button>
  );
};

export default BotonPagarVenta;
