/**
 * VentaList - Listado de ventas con filtros y estadísticas
 */
import React, { useState, useEffect } from 'react';
import { 
  getAllVentas, 
  deleteVenta, 
  cambiarEstadoVenta,
  getEstadisticasVentas 
} from '../../api/VentaApi';
import { getAllClientes } from '../../api/ClienteApi';
import Table from '../../components/Table';
import { FaEye, FaTrashAlt, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const VentaList = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cliente: '',
    estado: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ventasData, clientesData, statsData] = await Promise.all([
        getAllVentas(filters),
        getAllClientes(),
        getEstadisticasVentas()
      ]);
      setVentas(ventasData);
      setClientes(clientesData);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta venta?')) {
      try {
        await deleteVenta(id);
        alert('Venta eliminada correctamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar venta:', error);
        alert('Error al eliminar la venta');
      }
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await cambiarEstadoVenta(id, nuevoEstado);
      alert('Estado actualizado correctamente');
      loadData();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Cliente', accessor: 'cliente_display' },
    { header: 'Fecha', accessor: 'fecha_display' },
    { header: 'Total', accessor: 'total_display' },
    { header: 'Estado', accessor: 'estado_display' },
    { header: 'Productos', accessor: 'productos_display' }
  ];

  // Prepara los datos para la tabla con campos formateados
  const prepareDataForTable = () => {
    if (!Array.isArray(ventas)) return [];
    return ventas.map(v => ({
      ...v,
      cliente_display: v.cliente?.nombre || 'Consumidor Final',
      fecha_display: v.fecha ? new Date(v.fecha).toLocaleString('es-BO') : '-',
      total_display: `Bs. ${parseFloat(v.total || 0).toFixed(2)}`,
      estado_display: (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          v.estado === 'completada' ? 'bg-green-100 text-green-800' : 
          v.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {v.estado && (v.estado.charAt(0).toUpperCase() + v.estado.slice(1))}
        </span>
      ),
      productos_display: Array.isArray(v.items) ? v.items.length : (v.total_productos || 0)
    }));
  };

  const renderActions = (item) => (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => navigate(`/dashboard/ventas/${item.id}`)}
        className="p-2 text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded-full transition-colors"
        title="Ver detalles"
      >
        <FaEye size={16} />
      </button>

      <button
        onClick={() => {
          const nuevoEstado = prompt('Ingrese el nuevo estado (pendiente/completada/cancelada):', item.estado);
          if (nuevoEstado && ['pendiente', 'completada', 'cancelada'].includes(nuevoEstado)) {
            handleCambiarEstado(item.id, nuevoEstado);
          }
        }}
        className="p-2 text-gray-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-full transition-colors"
        title="Cambiar estado"
      >
        <FaEdit size={16} />
      </button>

      <button
        onClick={() => handleDelete(item.id)}
        className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
        title="Eliminar"
      >
        <FaTrashAlt size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header con título y botón */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Ventas</h1>
          <p className="text-gray-600">Administra y visualiza todas tus ventas</p>
        </div>
        <button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          onClick={() => navigate('/dashboard/ventas/crear')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Venta
        </button>
      </div>

      {/* Estadísticas - Cards mejorados */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Ventas */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Ventas</h3>
              <p className="text-4xl font-bold text-gray-800">{estadisticas.total_ventas}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
          </div>

          {/* Pendientes */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Pendientes</h3>
              <p className="text-4xl font-bold text-yellow-600">{estadisticas.ventas_pendientes}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2"></div>
          </div>

          {/* Completadas */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Completadas</h3>
              <p className="text-4xl font-bold text-green-600">{estadisticas.ventas_completadas}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
          </div>

          {/* Ingresos Totales */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Ingresos Totales</h3>
              <p className="text-3xl font-bold text-purple-600">
                Bs. {parseFloat(estadisticas.ingresos_totales || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2"></div>
          </div>
        </div>
      )}

      {/* Filtros modernos */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrar por Cliente:
            </label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={filters.cliente}
              onChange={(e) => setFilters({...filters, cliente: e.target.value})}
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrar por Estado:
            </label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={filters.estado}
              onChange={(e) => setFilters({...filters, estado: e.target.value})}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 font-medium">Cargando ventas...</p>
            </div>
          </div>
        ) : (
          <Table 
            columns={columns}
            data={prepareDataForTable()}
            renderActions={renderActions}
          />
        )}
      </div>
    </div>
  );
};

export default VentaList;
