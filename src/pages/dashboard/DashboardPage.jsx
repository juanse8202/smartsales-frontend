import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  FaShoppingCart, FaUsers, FaDollarSign, FaChartLine,
  FaCheckCircle, FaClock, FaTimesCircle, FaBrain, FaBoxOpen,
  FaCalendarDay, FaCalendarAlt, FaCalendar, FaSortAmountUp, FaSortAmountDown 
} from 'react-icons/fa';
import { getEstadisticasVentas, getSalesOverTime, getTopClients, getSalesPredictions, getTopProducts } from '../../api/VentaApi';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [periodo, setPeriodo] = useState('dia'); // 'dia', 'mes', 'anio'
  const [ordenClientes, setOrdenClientes] = useState('desc'); // 'desc' = Top 5, 'asc' = Bottom 5
  const [ordenProductos, setOrdenProductos] = useState('desc'); // 'desc' = Top 5, 'asc' = Bottom 5
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, salesOverTime, clientsData, productsData, predictionsData] = await Promise.all([
        getEstadisticasVentas(),
        getSalesOverTime(periodo),
        getTopClients(ordenClientes),
        getTopProducts(ordenProductos),
        getSalesPredictions().catch(() => [])
      ]);
      
      setStats(statsData);
      
      // Formatear datos de ventas por fecha según periodo
      const formattedSales = salesOverTime.map(item => {
        const date = new Date(item.fecha);
        let fechaLabel = '';
        
        if (periodo === 'dia') {
          fechaLabel = date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
        } else if (periodo === 'mes') {
          fechaLabel = date.toLocaleDateString('es-BO', { year: 'numeric', month: 'short' });
        } else if (periodo === 'anio') {
          fechaLabel = date.getFullYear().toString();
        }
        
        return {
          fecha: fechaLabel,
          ventas: parseFloat(item.total_ventas || 0)
        };
      });
      setSalesData(formattedSales);
      
      // Formatear datos de top clientes
      const formattedClients = clientsData.map(item => ({
        nombre: item.cliente__nombre || 'Sin nombre',
        nit: item.cliente__nit_ci || 'N/A',
        compras: item.cantidad_compras || 0,
        total: parseFloat(item.monto_total || 0)
      }));
      setTopClients(formattedClients);
      
      // Formatear datos de productos
      const formattedProducts = productsData.map(item => ({
        nombre: item.catalogo__nombre || 'Sin nombre',
        ventas: parseFloat(item.monto_total_vendido || 0)
      }));
      setTopProducts(formattedProducts);
      
      // Formatear datos de predicciones
      const formattedPredictions = predictionsData.map(item => ({
        mes: item.label,
        prediccion: parseFloat(item.predicted_sales || 0)
      }));
      setPredictions(formattedPredictions);
      
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar periodo de ventas
  const handlePeriodoChange = async (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);
    setLoadingSales(true);
    try {
      const salesOverTime = await getSalesOverTime(nuevoPeriodo);
      const formattedSales = salesOverTime.map(item => {
        const date = new Date(item.fecha);
        let fechaLabel = '';
        
        if (nuevoPeriodo === 'dia') {
          fechaLabel = date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
        } else if (nuevoPeriodo === 'mes') {
          fechaLabel = date.toLocaleDateString('es-BO', { year: 'numeric', month: 'short' });
        } else if (nuevoPeriodo === 'anio') {
          fechaLabel = date.getFullYear().toString();
        }
        
        return {
          fecha: fechaLabel,
          ventas: parseFloat(item.total_ventas || 0)
        };
      });
      setSalesData(formattedSales);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoadingSales(false);
    }
  };

  // Función para cambiar orden de clientes
  const handleOrdenClientesChange = async (nuevoOrden) => {
    setOrdenClientes(nuevoOrden);
    setLoadingClients(true);
    try {
      const clientsData = await getTopClients(nuevoOrden);
      const formattedClients = clientsData.map(item => ({
        nombre: item.cliente__nombre || 'Sin nombre',
        nit: item.cliente__nit_ci || 'N/A',
        compras: item.cantidad_compras || 0,
        total: parseFloat(item.monto_total || 0)
      }));
      setTopClients(formattedClients);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  // Función para cambiar orden de productos
  const handleOrdenProductosChange = async (nuevoOrden) => {
    setOrdenProductos(nuevoOrden);
    setLoadingProducts(true);
    try {
      const productsData = await getTopProducts(nuevoOrden);
      const formattedProducts = productsData.map(item => ({
        nombre: item.catalogo__nombre || 'Sin nombre',
        ventas: parseFloat(item.monto_total_vendido || 0)
      }));
      setTopProducts(formattedProducts);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Colores para los gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaChartLine className="mr-3 text-blue-600" />
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Panel de control de SmartSales - Vista general de tu negocio
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Ventas */}
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <FaShoppingCart className="text-2xl text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Ventas</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {stats?.total_ventas || 0}
          </p>
        </div>

        {/* Completadas */}
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Completadas</h3>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {stats?.ventas_completadas || 0}
          </p>
        </div>

        {/* Pendientes */}
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 rounded-full p-3">
              <FaClock className="text-2xl text-yellow-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {stats?.ventas_pendientes || 0}
          </p>
        </div>

        {/* Ingresos Totales */}
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-full p-3">
              <FaDollarSign className="text-2xl text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Ingresos Totales</h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            Bs. {parseFloat(stats?.ingresos_totales || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Gráfico de Ventas por Fecha */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Ventas en el Tiempo
          </h2>
          {/* Botones de filtro por periodo */}
          <div className="flex gap-2">
            <button
              onClick={() => handlePeriodoChange('dia')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'dia' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={loadingSales}
            >
              <FaCalendarDay className="mr-1.5" size={14} />
              Día
            </button>
            <button
              onClick={() => handlePeriodoChange('mes')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'mes' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={loadingSales}
            >
              <FaCalendarAlt className="mr-1.5" size={14} />
              Mes
            </button>
            <button
              onClick={() => handlePeriodoChange('anio')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'anio' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={loadingSales}
            >
              <FaCalendar className="mr-1.5" size={14} />
              Año
            </button>
          </div>
        </div>
        {loadingSales ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip formatter={(value) => `Bs. ${value.toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ventas" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Ventas (Bs.)"
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-20">No hay datos de ventas disponibles</p>
        )}
      </div>

      {/* Predicciones de Ventas con IA */}
      {predictions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 shadow-md border border-purple-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaBrain className="mr-2 text-purple-600" />
            Predicciones de Ventas (Próximos 6 Meses)
          </h2>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-800 flex items-center">
              <FaBrain className="mr-2" />
              <span className="font-semibold">Predicciones generadas por Inteligencia Artificial</span>
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Basado en el análisis histórico de ventas usando Machine Learning
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => `Bs. ${value.toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="prediccion" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Ventas Predichas (Bs.)"
                dot={{ fill: '#8B5CF6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráficos en Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top/Bottom Clientes */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
              <FaUsers className="mr-2 text-blue-600" />
              {ordenClientes === 'desc' ? 'Top 5 Clientes' : 'Bottom 5 Clientes'}
            </h2>
            {/* Botones de filtro Top/Bottom */}
            <div className="flex gap-2">
              <button
                onClick={() => handleOrdenClientesChange('desc')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  ordenClientes === 'desc' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={loadingClients}
                title="Clientes que más gastaron"
              >
                <FaSortAmountDown className="mr-1.5" size={14} />
                Top 5
              </button>
              <button
                onClick={() => handleOrdenClientesChange('asc')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  ordenClientes === 'asc' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={loadingClients}
                title="Clientes que menos gastaron"
              >
                <FaSortAmountUp className="mr-1.5" size={14} />
                Bottom 5
              </button>
            </div>
          </div>
          {loadingClients ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : topClients.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip formatter={(value) => `Bs. ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="total" fill="#3B82F6" name="Total Gastado (Bs.)">
                  {topClients.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No hay datos de clientes disponibles</p>
          )}
        </div>

        {/* Top/Bottom Productos */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
              <FaBoxOpen className="mr-2 text-green-600" />
              {ordenProductos === 'desc' ? 'Top 5 Productos' : 'Bottom 5 Productos'}
            </h2>
            {/* Botones de filtro Top/Bottom */}
            <div className="flex gap-2">
              <button
                onClick={() => handleOrdenProductosChange('desc')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  ordenProductos === 'desc' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={loadingProducts}
                title="Productos más vendidos"
              >
                <FaSortAmountDown className="mr-1.5" size={14} />
                Top 5
              </button>
              <button
                onClick={() => handleOrdenProductosChange('asc')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  ordenProductos === 'asc' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={loadingProducts}
                title="Productos menos vendidos"
              >
                <FaSortAmountUp className="mr-1.5" size={14} />
                Bottom 5
              </button>
            </div>
          </div>
          {loadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          ) : topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" width={150} />
                <Tooltip formatter={(value) => [`Bs. ${value.toFixed(2)}`, 'Total Vendido']} />
                <Legend />
                <Bar dataKey="ventas" name="Monto Total (Bs.)">
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No hay datos de productos disponibles</p>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <FaChartLine className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Ticket Promedio: Bs. {parseFloat(stats?.ticket_promedio || 0).toFixed(2)}
            </p>
            <p className="text-xs text-blue-700">
              Promedio de ingresos por venta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;