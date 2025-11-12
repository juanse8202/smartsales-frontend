import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProducto } from '../../api/ProductoApi';
import { FaBox, FaCalendar } from 'react-icons/fa';
import DetailView from '../../components/DetailView';

const ProductoDetail = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductoDetail();
  }, [id]);

  const loadProductoDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getProducto(id);
      setProducto(data);
    } catch (err) {
      console.error('Error al cargar detalles del producto:', err);
      setError('Error al cargar los detalles del producto');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
        {label}
      </span>
    );
  };

  if (!producto && !isLoading && !error) {
    return (
      <DetailView
        title="Producto no encontrado"
        backRoute="/productos"
        error="No se encontró el producto"
        isLoading={false}
      />
    );
  }

  const fields = producto ? [
    { label: 'ID', value: producto.id },
    { 
      label: 'Número de Serie', 
      value: <span className="font-mono">{producto.numero_serie}</span>
    },
    { 
      label: 'Costo', 
      value: `Bs. ${parseFloat(producto.costo).toFixed(2)}`
    },
    { 
      label: 'Estado', 
      value: getEstadoBadge(producto.estado)
    },
    { 
      label: (
        <>
          <FaCalendar className="inline mr-2" />
          Fecha de Ingreso
        </>
      ), 
      value: formatDate(producto.fecha_ingreso) 
    },
    ...(producto.fecha_venta ? [
      { 
        label: (
          <>
            <FaCalendar className="inline mr-2" />
            Fecha de Venta
          </>
        ), 
        value: formatDate(producto.fecha_venta) 
      }
    ] : []),
    ...(producto.fecha_fin_garantia && producto.estado === 'vendido' ? [
      { 
        label: 'Garantía', 
        value: (
          <div>
            <div className={`font-semibold ${producto.garantia_vigente ? 'text-green-600' : 'text-red-600'}`}>
              {producto.garantia_vigente ? '✓ Vigente' : '✗ Vencida'}
            </div>
            <div className="text-sm text-gray-600">
              Vence: {formatDate(producto.fecha_fin_garantia)}
            </div>
          </div>
        )
      }
    ] : [])
  ] : [];

  // Información del catálogo
  const catalogoContent = producto?.catalogo && (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
        Información del Catálogo
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
            Nombre:
          </div>
          <div className="flex-1 text-gray-900 break-words">
            {producto.catalogo.nombre}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
            SKU:
          </div>
          <div className="flex-1 text-gray-900 break-words">
            {producto.catalogo.sku}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
            Precio:
          </div>
          <div className="flex-1 text-gray-900">
            Bs. {parseFloat(producto.catalogo.precio).toFixed(2)}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
            Marca:
          </div>
          <div className="flex-1 text-gray-900">
            {producto.catalogo.marca || 'N/A'}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
            Modelo:
          </div>
          <div className="flex-1 text-gray-900">
            {producto.catalogo.modelo || 'N/A'}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
            Categoría:
          </div>
          <div className="flex-1 text-gray-900">
            {producto.catalogo.categoria || 'N/A'}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
            Garantía:
          </div>
          <div className="flex-1 text-gray-900">
            {producto.catalogo.meses_garantia ? `${producto.catalogo.meses_garantia} meses` : 'N/A'}
          </div>
        </div>
        {producto.catalogo.imagen_url && (
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 lg:col-span-2">
            <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
              Imagen:
            </div>
            <div className="flex-1">
              <img 
                src={producto.catalogo.imagen_url} 
                alt={producto.catalogo.nombre}
                className="max-w-xs rounded border border-gray-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const badge = producto && getEstadoBadge(producto.estado);

  return (
    <DetailView
      title={producto ? `N/S: ${producto.numero_serie}` : 'Producto'}
      icon={<FaBox />}
      backRoute="/productos"
      editRoute={`/productos/edit/${id}`}
      fields={fields}
      badge={badge}
      additionalContent={catalogoContent}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default ProductoDetail;
