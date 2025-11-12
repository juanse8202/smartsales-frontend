/**
 * Página para ver el historial de pagos del usuario autenticado
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCreditCard, 
  FaFilter, 
  FaSearch,
  FaEye,
  FaArrowLeft,
  FaMoneyBillWave
} from 'react-icons/fa';
import { SiStripe } from 'react-icons/si';
import { useAuth } from '../../context/AuthContext';
import { fetchPagos, formatMonto, getEstadoColor } from '../../api/StripeApi';

const MisPagos = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filtros, setFiltros] = useState({
    venta: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadMisPagos();
  }, [filtros, isAuthenticated]);

  const loadMisPagos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Llamar al nuevo endpoint que solo trae los pagos del usuario autenticado
      const response = await fetch(`${import.meta.env.VITE_API_URL}finanzas/mis-pagos/?venta=${filtros.venta || ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar pagos');
      }
      
      const data = await response.json();
      setPagos(data);
    } catch (err) {
      console.error('Error al cargar mis pagos:', err);
      setError('Error al cargar tus pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerVenta = (ventaId) => {
    navigate(`/mis-ventas/${ventaId}`);
  };

  const limpiarFiltros = () => {
    setFiltros({
      venta: ''
    });
  };

  const getProveedorIcon = (proveedor) => {
    switch (proveedor) {
      case 'Stripe':
        return <SiStripe className="text-purple-600" />;
      case 'Efectivo':
        return <FaMoneyBillWave className="text-green-600" />;
      default:
        return <FaCreditCard className="text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
            Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Pagos</h1>
            <p className="text-gray-600">Historial de tus pagos realizados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filtros</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venta ID
              </label>
              <input
                type="text"
                name="venta"
                value={filtros.venta}
                onChange={handleFiltroChange}
                placeholder="Buscar por venta..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus pagos...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Lista de pagos */}
        {!loading && !error && (
          <>
            {pagos.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FaSearch className="text-gray-400 text-5xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No tienes pagos registrados
                </h3>
                <p className="text-gray-600 mb-6">
                  {filtros.venta
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Aún no has realizado ningún pago'
                  }
                </p>
                <button
                  onClick={() => navigate('/catalogo')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ir al catálogo
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Venta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proveedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pagos.map((pago) => (
                        <tr key={pago.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{pago.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => handleVerVenta(pago.venta_id)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Venta #{pago.venta_id}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {pago.moneda} {parseFloat(pago.monto).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              {getProveedorIcon(pago.proveedor)}
                              <span>{pago.proveedor}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(pago.estado)}`}>
                              {pago.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(pago.fecha_pago).toLocaleDateString('es-BO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleVerVenta(pago.venta_id)}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              <FaEye />
                              Ver Venta
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer con totales */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Total de pagos: <span className="font-semibold">{pagos.length}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Suma total: <span className="font-semibold text-green-600">
                        Bs. {pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MisPagos;
