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
    { key: 'id', label: 'ID' },
    { key: 'cliente_nombre', label: 'Cliente' },
    { 
      key: 'fecha', 
      label: 'Fecha',
      render: (item) => new Date(item.fecha).toLocaleDateString('es-BO')
    },
    { 
      key: 'total', 
      label: 'Total',
      render: (item) => `Bs. ${parseFloat(item.total).toFixed(2)}`
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (item) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          item.estado === 'completada' ? 'bg-green-100 text-green-800' : 
          item.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {item.estado === 'completada' && (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {item.estado === 'pendiente' && (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
          {item.estado === 'cancelada' && (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
        </span>
      )
    },
    { 
      key: 'total_productos', 
      label: 'Productos'
    }
  ];

  const actions = [
    {
      label: 'Ver',
      className: 'btn-info',
      onClick: (item) => navigate(`/dashboard/ventas/${item.id}`)
    },
    {
      label: 'Cambiar Estado',
      className: 'btn-warning',
      onClick: (item) => {
        const nuevoEstado = prompt(
          'Ingrese el nuevo estado (pendiente/completada/cancelada):',
          item.estado
        );
        if (nuevoEstado && ['pendiente', 'completada', 'cancelada'].includes(nuevoEstado)) {
          handleCambiarEstado(item.id, nuevoEstado);
        }
      }
    },
    {
      label: 'Eliminar',
      className: 'btn-danger',
      onClick: (item) => handleDelete(item.id)
    }
  ];

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
            data={ventas}
            columns={columns}
            actions={actions}
          />
        )}
      </div>
    </div>
  );
};

export default VentaList;
