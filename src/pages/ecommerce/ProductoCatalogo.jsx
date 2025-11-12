import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCatalogo } from '../../api/CatalogoApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';

const ProductoCatalogo = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openLoginModal } = useAuth();
  const [catalogos, setCatalogos] = useState([]);
  const [filteredCatalogos, setFilteredCatalogos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('all');
  const [selectedMarca, setSelectedMarca] = useState('all');
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    loadCatalogos();
  }, []);

  useEffect(() => {
    filterCatalogos();
  }, [searchTerm, selectedCategoria, selectedMarca, catalogos]);

  const loadCatalogos = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCatalogo();
      const catalogosActivos = Array.isArray(data) 
        ? data.filter(cat => cat.estado === 'activo') 
        : [];
      setCatalogos(catalogosActivos);
      setFilteredCatalogos(catalogosActivos);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
      setCatalogos([]);
      setFilteredCatalogos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCatalogos = () => {
    let filtered = [...catalogos];

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.nombre.toLowerCase().includes(term) ||
        cat.sku.toLowerCase().includes(term) ||
        cat.marca?.nombre?.toLowerCase().includes(term) ||
        cat.modelo?.toLowerCase().includes(term)
      );
    }

    // Filtro por categoría
    if (selectedCategoria !== 'all') {
      filtered = filtered.filter(cat => cat.categoria?.id === parseInt(selectedCategoria));
    }

    // Filtro por marca
    if (selectedMarca !== 'all') {
      filtered = filtered.filter(cat => cat.marca?.id === parseInt(selectedMarca));
    }

    setFilteredCatalogos(filtered);
  };

  const handleProductClick = (id) => {
    navigate(`/producto/${id}`);
  };

  const handleAddToCart = async (e, catalogoId, nombre) => {
    e.stopPropagation();
    setAddingToCart(catalogoId);
    const result = await addItem(catalogoId, 1);
    setAddingToCart(null);
    
    if (result.success) {
      alert(`✅ "${nombre}" agregado al carrito`);
    } else if (result.needsLogin) {
      // Usuario no autenticado
      alert('⚠️ Debes iniciar sesión para agregar productos al carrito');
      openLoginModal();
    } else {
      alert('❌ Error al agregar al carrito');
    }
  };

  // Obtener categorías y marcas únicas
  const categorias = [...new Map(catalogos.map(cat => [cat.categoria?.id, cat.categoria])).values()].filter(Boolean);
  const marcas = [...new Map(catalogos.map(cat => [cat.marca?.id, cat.marca])).values()].filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Buscador */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por Categoría */}
            <div>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Marca */}
            <div>
              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las marcas</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredCatalogos.length} de {catalogos.length} productos
          </div>
        </div>

        {/* Grid de Productos */}
        {filteredCatalogos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCatalogos.map((catalogo) => (
              <div
                key={catalogo.id}
                onClick={() => handleProductClick(catalogo.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
              >
                {/* Imagen del producto */}
                <div className="relative overflow-hidden bg-gray-100 h-64">
                  {catalogo.imagen_url ? (
                    <img
                      src={catalogo.imagen_url}
                      alt={catalogo.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaShoppingCart size={64} />
                    </div>
                  )}
                  
                  {/* Badge de stock */}
                  {catalogo.stock_disponible > 0 ? (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Disponible
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Agotado
                    </span>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  {/* Marca y categoría */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="bg-gray-100 px-2 py-1 rounded">{catalogo.marca?.nombre}</span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{catalogo.categoria?.nombre}</span>
                  </div>

                  {/* Nombre del producto */}
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {catalogo.nombre}
                  </h3>

                  {/* Modelo */}
                  {catalogo.modelo && (
                    <p className="text-xs text-gray-500 mb-2">Modelo: {catalogo.modelo}</p>
                  )}

                  {/* SKU */}
                  <p className="text-xs font-mono text-gray-400 mb-3">{catalogo.sku}</p>

                  {/* Precio y stock */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          Bs. {parseFloat(catalogo.precio).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Stock: {catalogo.stock_disponible}</p>
                      </div>
                    </div>
                    
                    {/* Botones */}
                    <div className="flex gap-2">
                      {catalogo.stock_disponible > 0 ? (
                        <button
                          onClick={(e) => handleAddToCart(e, catalogo.id, catalogo.nombre)}
                          disabled={addingToCart === catalogo.id}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold disabled:bg-green-400 flex items-center justify-center"
                        >
                          <FaShoppingCart className="mr-1" size={12} />
                          {addingToCart === catalogo.id ? 'Agregando...' : 'Agregar'}
                        </button>
                      ) : null}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(catalogo.id);
                        }}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        Ver más
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoCatalogo;
