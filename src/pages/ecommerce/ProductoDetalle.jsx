import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCatalogo } from '../../api/CatalogoApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FaShoppingCart, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle,
  FaBox,
  FaTag,
  FaShieldAlt,
  FaBoxOpen
} from 'react-icons/fa';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { openLoginModal } = useAuth();
  const [producto, setProducto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProducto();
  }, [id]);

  const loadProducto = async () => {
    try {
      setIsLoading(true);
      const data = await getCatalogo(id);
      setProducto(data);
    } catch (err) {
      console.error('Error al cargar producto:', err);
      setError('Error al cargar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCantidadChange = (valor) => {
    const nuevaCantidad = cantidad + valor;
    if (nuevaCantidad >= 1 && nuevaCantidad <= producto.stock_disponible) {
      setCantidad(nuevaCantidad);
    }
  };

  const handleAgregarCarrito = async () => {
    setAdding(true);
    const result = await addItem(parseInt(id), cantidad);
    setAdding(false);
    
    if (result.success) {
      alert(`✅ ${cantidad} unidad(es) de "${producto.nombre}" agregadas al carrito`);
      setCantidad(1); // Resetear cantidad
    } else if (result.needsLogin) {
      // Usuario no autenticado
      alert('⚠️ Debes iniciar sesión para agregar productos al carrito');
      openLoginModal();
    } else {
      alert('❌ Error al agregar al carrito. Por favor intenta nuevamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando producto...</div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Producto no encontrado</h2>
        <button
          onClick={() => navigate('/catalogo')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <button
          onClick={() => navigate('/catalogo')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Volver al catálogo
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Columna izquierda - Imagen */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaShoppingCart size={120} className="text-gray-400" />
                )}
              </div>

              {/* Información adicional en cards pequeñas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <FaShieldAlt className="mx-auto text-blue-600 mb-2" size={24} />
                  <p className="text-xs font-semibold text-gray-700">Garantía</p>
                  <p className="text-sm text-blue-600">{producto.meses_garantia} meses</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <FaBox className="mx-auto text-green-600 mb-2" size={24} />
                  <p className="text-xs font-semibold text-gray-700">Stock</p>
                  <p className="text-sm text-green-600">{producto.stock_disponible} unid.</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <FaTag className="mx-auto text-purple-600 mb-2" size={24} />
                  <p className="text-xs font-semibold text-gray-700">SKU</p>
                  <p className="text-xs text-purple-600 font-mono">{producto.sku}</p>
                </div>
              </div>
            </div>

            {/* Columna derecha - Información */}
            <div className="space-y-6">
              {/* Badges superiores */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {producto.marca?.nombre}
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {producto.categoria?.nombre}
                </span>
                {producto.estado === 'activo' ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <FaCheckCircle className="mr-1" /> Activo
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <FaTimesCircle className="mr-1" /> Inactivo
                  </span>
                )}
              </div>

              {/* Título */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  {producto.nombre}
                </h1>
                {producto.modelo && (
                  <p className="text-lg text-gray-600">Modelo: {producto.modelo}</p>
                )}
              </div>

              {/* Precio */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Precio</p>
                <p className="text-4xl font-bold text-green-600">
                  Bs. {parseFloat(producto.precio).toFixed(2)}
                </p>
                {/* Calculadora de cuotas (ejemplo) */}
                <p className="text-sm text-gray-600 mt-2">
                  o hasta 12 cuotas de Bs. {(parseFloat(producto.precio) / 12).toFixed(2)}
                </p>
              </div>

              {/* Disponibilidad */}
              <div className="border-t border-b border-gray-200 py-4">
                {producto.stock_disponible > 0 ? (
                  <div className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-2" />
                    <span className="font-semibold">
                      Disponible - {producto.stock_disponible} unidades en stock
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <FaTimesCircle className="mr-2" />
                    <span className="font-semibold">Producto agotado</span>
                  </div>
                )}
              </div>

              {/* Selector de cantidad */}
              {producto.stock_disponible > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad:
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleCantidadChange(-1)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        disabled={cantidad <= 1}
                      >
                        -
                      </button>
                      <span className="px-6 py-2 font-semibold text-gray-800 border-x border-gray-300">
                        {cantidad}
                      </span>
                      <button
                        onClick={() => handleCantidadChange(1)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        disabled={cantidad >= producto.stock_disponible}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Total: Bs. {(parseFloat(producto.precio) * cantidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3">
                {producto.stock_disponible > 0 ? (
                  <>
                    <button
                      onClick={handleAgregarCarrito}
                      disabled={adding}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      <FaShoppingCart className="mr-2" />
                      {adding ? 'Agregando...' : 'Agregar al carrito'}
                    </button>
                    <button 
                      onClick={handleAgregarCarrito}
                      disabled={adding}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                      {adding ? 'Procesando...' : 'Comprar ahora'}
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-4 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Producto no disponible
                  </button>
                )}
              </div>

              {/* Información de garantía */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FaShieldAlt className="mr-2 text-blue-600" />
                  Garantía del fabricante
                </h3>
                <p className="text-sm text-gray-600">
                  Este producto cuenta con {producto.meses_garantia} meses de garantía 
                  directamente del fabricante {producto.marca?.nombre}.
                </p>
              </div>

              {/* Características */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-lg">
                  <FaBoxOpen className="mr-2 text-blue-600" />
                  Características
                </h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">Marca</dt>
                    <dd className="font-medium text-gray-800">{producto.marca?.nombre}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Categoría</dt>
                    <dd className="font-medium text-gray-800">{producto.categoria?.nombre}</dd>
                  </div>
                  {producto.modelo && (
                    <div>
                      <dt className="text-sm text-gray-600">Modelo</dt>
                      <dd className="font-medium text-gray-800">{producto.modelo}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-600">SKU</dt>
                    <dd className="font-medium text-gray-800 font-mono text-sm">{producto.sku}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Garantía</dt>
                    <dd className="font-medium text-gray-800">{producto.meses_garantia} meses</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Estado</dt>
                    <dd className="font-medium text-gray-800 capitalize">{producto.estado}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
