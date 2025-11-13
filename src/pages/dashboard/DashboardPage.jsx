import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  FaShoppingCart, FaUsers, FaDollarSign, FaChartLine,
  FaCheckCircle, FaClock, FaTimesCircle, FaBrain, FaBoxOpen 
} from 'react-icons/fa';
import { getEstadisticasVentas, getSalesOverTime, getTopClients, getSalesPredictions } from '../../api/VentaApi';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, salesOverTime, clientsData, predictionsData] = await Promise.all([
        getEstadisticasVentas(),
        getSalesOverTime(),
        getTopClients(),
        getSalesPredictions().catch(() => [])
      ]);
      
      setStats(statsData);
      
      // Formatear datos de ventas por fecha
      const formattedSales = salesOverTime.map(item => ({
        fecha: new Date(item.day).toLocaleDateString('es-BO', { month: 'short', day: 'numeric' }),
        ventas: parseFloat(item.total_ventas || 0)
      }));
      setSalesData(formattedSales);
      
      // Formatear datos de top clientes
      const formattedClients = clientsData.map(item => ({
        nombre: item.cliente__nombre || 'Sin nombre',
        nit: item.cliente__nit_ci || 'N/A',
        compras: item.cantidad_compras || 0,
        total: parseFloat(item.monto_total || 0)
      }));
      setTopClients(formattedClients);
      
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

  // Colores para los gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Datos MOCK de productos más vendidos (visual)
  const topProductsData = [
    { nombre: 'TV LG 55" 4K', ventas: 45, color: '#3B82F6' },
    { nombre: 'Refrigerador Samsung 380L', ventas: 38, color: '#10B981' },
    { nombre: 'Lavadora Samsung 22kg AI', ventas: 32, color: '#F59E0B' },
    { nombre: 'Aire Midea 12000 BTU', ventas: 28, color: '#EF4444' },
    { nombre: 'Cocina Mabe 4 Hornallas', ventas: 25, color: '#8B5CF6' }
  ];

  // Datos para el gráfico de pastel de estados
  const estadosPieData = stats ? [
    { name: 'Completadas', value: stats.ventas_completadas, color: '#10B981' },
    { name: 'Pendientes', value: stats.ventas_pendientes, color: '#F59E0B' },
    { name: 'Canceladas', value: stats.ventas_canceladas, color: '#EF4444' }
  ].filter(item => item.value > 0) : [];

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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ventas por Fecha */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Ventas en el Tiempo
          </h2>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
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
                  strokeWidth={2}
                  name="Ventas (Bs.)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No hay datos de ventas disponibles</p>
          )}
        </div>

        {/* Gráfico de Estados */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Distribución de Estados
          </h2>
          {estadosPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadosPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {estadosPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No hay datos de estados disponibles</p>
          )}
        </div>
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
        {/* Top Clientes */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-600" />
            Top 5 Clientes
          </h2>
          {topClients.length > 0 ? (
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

        {/* Productos Más Vendidos (VISUAL) */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaBoxOpen className="mr-2 text-green-600" />
            Top 5 Productos Más Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nombre" type="category" width={150} />
              <Tooltip formatter={(value) => [`${value} unidades`, 'Ventas']} />
              <Legend />
              <Bar dataKey="ventas" name="Unidades Vendidas">
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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