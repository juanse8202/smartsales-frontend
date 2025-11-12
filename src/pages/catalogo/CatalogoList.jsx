import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCatalogo, deleteCatalogo } from '../../api/CatalogoApi';
import Table from '../../components/Table';
import SearchBar from '../../components/SearchBar';
import { FaPlus, FaBook, FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

const CatalogoList = () => {
  const navigate = useNavigate();
  const [catalogos, setCatalogos] = useState([]);
  const [filteredCatalogos, setFilteredCatalogos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCatalogos();
  }, []);

  useEffect(() => {
    filterCatalogos();
  }, [searchTerm, catalogos]);

  const loadCatalogos = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCatalogo();
      setCatalogos(Array.isArray(data) ? data : []);
      setFilteredCatalogos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
      setError('Error al cargar los catálogos. Verifica que el endpoint /api/catalogo/ exista en el backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCatalogos = () => {
    if (!searchTerm.trim()) {
      setFilteredCatalogos(catalogos);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = catalogos.filter(catalogo =>
      catalogo.nombre.toLowerCase().includes(term) ||
      catalogo.sku.toLowerCase().includes(term) ||
      catalogo.marca?.nombre?.toLowerCase().includes(term) ||
      catalogo.categoria?.nombre?.toLowerCase().includes(term) ||
      catalogo.modelo?.toLowerCase().includes(term)
    );
    setFilteredCatalogos(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este catálogo? Esto también afectará a los productos asociados.')) {
      try {
        await deleteCatalogo(id);
        loadCatalogos();
      } catch (err) {
        console.error('Error al eliminar catálogo:', err);
        alert('Error al eliminar el catálogo');
      }
    }
  };

  const handleView = (id) => {
    navigate(`/catalogos/detail/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/catalogos/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/catalogos/create');
  };

  // Preparar los datos para la tabla formateando los valores
  const prepareDataForTable = () => {
    if (!Array.isArray(filteredCatalogos)) return [];
    return filteredCatalogos.map(catalogo => ({
      ...catalogo,
      sku_display: <span className="font-mono text-sm">{catalogo.sku}</span>,
      nombre_display: (
        <div>
          <div className="font-medium">{catalogo.nombre}</div>
          {catalogo.modelo && (
            <div className="text-xs text-gray-500">Modelo: {catalogo.modelo}</div>
          )}
        </div>
      ),
      marca_display: catalogo.marca?.nombre || 'N/A',
      categoria_display: catalogo.categoria?.nombre || 'N/A',
      precio_display: <span className="font-semibold text-green-600">Bs. {parseFloat(catalogo.precio).toFixed(2)}</span>,
      stock_display: (
        <span className={`font-semibold ${catalogo.stock_disponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {catalogo.stock_disponible}
        </span>
      ),
      estado_display: (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
          catalogo.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {catalogo.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </span>
      )
    }));
  };

  const columns = [
    { header: 'SKU', accessor: 'sku_display' },
    { header: 'Nombre', accessor: 'nombre_display' },
    { header: 'Marca', accessor: 'marca_display' },
    { header: 'Categoría', accessor: 'categoria_display' },
    { header: 'Precio', accessor: 'precio_display' },
    { header: 'Stock', accessor: 'stock_display' },
    { header: 'Estado', accessor: 'estado_display' }
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
        <div className="text-gray-600">Cargando catálogos...</div>
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
            <FaBook className="mr-3 text-blue-600" />
            Gestionar Catálogo
          </h1>
          <p className="text-gray-600 mt-1">
            Total de productos en catálogo: {filteredCatalogos.length}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <FaPlus className="mr-2" />
          Nuevo Catálogo
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por nombre, SKU, marca, categoría o modelo..."
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

export default CatalogoList;
