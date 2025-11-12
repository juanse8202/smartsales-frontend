import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProductos, deleteProducto } from '../../api/ProductoApi';
import Table from '../../components/Table';
import SearchBar from '../../components/SearchBar';
import { FaPlus, FaBox, FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

const ProductoList = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProductos();
  }, []);

  useEffect(() => {
    filterProductos();
  }, [searchTerm, productos]);

  const loadProductos = async () => {
    try {
      setIsLoading(true);
      const data = await getAllProductos();
      setProductos(data);
      setFilteredProductos(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProductos = () => {
    if (!searchTerm.trim()) {
      setFilteredProductos(productos);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = productos.filter(producto =>
      producto.numero_serie.toLowerCase().includes(term) ||
      producto.catalogo?.nombre?.toLowerCase().includes(term) ||
      producto.catalogo?.sku?.toLowerCase().includes(term) ||
      producto.estado.toLowerCase().includes(term)
    );
    setFilteredProductos(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await deleteProducto(id);
        loadProductos();
      } catch (err) {
        console.error('Error al eliminar producto:', err);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleView = (id) => {
    navigate(`/productos/detail/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/productos/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/productos/create');
  };

  const getEstadoBadge = (estado) => {
    const estadoMap = {
      'disponible': { label: 'Disponible', color: 'bg-green-100 text-green-800' },
      'reservado': { label: 'Reservado', color: 'bg-yellow-100 text-yellow-800' },
      'vendido': { label: 'Vendido', color: 'bg-blue-100 text-blue-800' },
      'en_reparacion': { label: 'En Reparación', color: 'bg-orange-100 text-orange-800' },
      'dado_de_baja': { label: 'Dado de Baja', color: 'bg-red-100 text-red-800' }
    };
    
    const { label, color } = estadoMap[estado] || { label: estado, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
        {label}
      </span>
    );
  };

  // Preparar los datos para la tabla formateando los valores
  const prepareDataForTable = () => {
    if (!Array.isArray(filteredProductos)) return [];
    return filteredProductos.map(producto => ({
      ...producto,
      numero_serie_display: <span className="font-mono text-sm">{producto.numero_serie}</span>,
      catalogo_display: (
        <div>
          <div className="font-medium">{producto.catalogo?.nombre || 'N/A'}</div>
          <div className="text-xs text-gray-500">SKU: {producto.catalogo?.sku || 'N/A'}</div>
        </div>
      ),
      costo_display: `Bs. ${parseFloat(producto.costo).toFixed(2)}`,
      estado_display: getEstadoBadge(producto.estado),
      fecha_display: new Date(producto.fecha_ingreso).toLocaleDateString('es-ES')
    }));
  };

  const columns = [
    { header: 'Número de Serie', accessor: 'numero_serie_display' },
    { header: 'Producto', accessor: 'catalogo_display' },
    { header: 'Costo', accessor: 'costo_display' },
    { header: 'Estado', accessor: 'estado_display' },
    { header: 'Fecha Ingreso', accessor: 'fecha_display' }
  ];

  const renderActions = (item) => (
    <div className="flex justify-center items-center gap-2">
      <button 
        onClick={() => handleView(item.id)} 
        className="p-2 text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded-full transition-colors" 
        title="Ver detalles"
      >
        <FaEye size={18} />
      </button>
      <button 
        onClick={() => handleEdit(item.id)} 
        className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors" 
        title="Editar"
      >
        <FaEdit size={18} />
      </button>
      <button 
        onClick={() => handleDelete(item.id)} 
        className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors" 
        title="Eliminar"
      >
        <FaTrashAlt size={18} />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="text-gray-600">Cargando productos...</div>
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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <FaBox className="mr-3 text-blue-600" />
            Gestionar Productos
          </h1>
          <p className="text-gray-600 mt-1">
            Total de productos: {filteredProductos.length}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <FaPlus className="mr-2" />
          Nuevo Producto
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por número de serie, nombre, SKU o estado..."
      />

      {/* Table */}
      <Table
        columns={columns}
        data={prepareDataForTable()}
        renderActions={renderActions}
      />
    </div>
  );
};

export default ProductoList;
