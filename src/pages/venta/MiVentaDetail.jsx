/**
 * Página para ver el detalle de una venta del usuario autenticado
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft,
  FaUser,
  FaCalendar,
  FaBox,
  FaMoneyBillWave,
  FaTruck,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getVentaById } from '../../api/VentaApi';

const MiVentaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadVenta();
  }, [id, isAuthenticated]);

  const loadVenta = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getVentaById(id);
      setVenta(data);
    } catch (err) {
      console.error('Error al cargar venta:', err);
      setError('Error al cargar la venta');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'completada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando venta...</p>
        </div>
      </div>
    );
  }

  if (error || !venta) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Venta no encontrada</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/mis-pagos')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a mis pagos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/mis-pagos')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
            Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Detalle de Venta #{venta.id}</h1>
            <p className="text-gray-600">Información completa de tu compra</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información General */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Información General</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FaUser className="text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold text-gray-800">{venta.cliente_nombre}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCalendar className="text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(venta.fecha).toLocaleDateString('es-BO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaBox className="text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(venta.estado)}`}>
                    {venta.estado}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Dirección de Entrega</p>
                  <p className="font-semibold text-gray-800">{venta.direccion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Productos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {venta.detalles && venta.detalles.map((detalle, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detalle.catalogo_nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detalle.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Bs. {parseFloat(detalle.precio_unitario).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Bs. {parseFloat(detalle.subtotal).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        Bs. {parseFloat(detalle.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de Pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaMoneyBillWave />
              Resumen de Pago
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Bs. {parseFloat(venta.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600">Impuesto (13%)</span>
                <span className="font-semibold">Bs. {parseFloat(venta.impuesto).toFixed(2)}</span>
              </div>
              {venta.descuento > 0 && (
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-600">Descuento</span>
                  <span className="font-semibold text-red-600">- Bs. {parseFloat(venta.descuento).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaTruck />
                  Costo de Envío
                </span>
                <span className="font-semibold">Bs. {parseFloat(venta.costo_envio).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-xl font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  Bs. {parseFloat(venta.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiVentaDetail;
