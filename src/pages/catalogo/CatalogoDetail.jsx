import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCatalogo } from '../../api/CatalogoApi';
import { FaBook, FaCalendar, FaCheckCircle, FaTimesCircle, FaBox } from 'react-icons/fa';
import DetailView from '../../components/DetailView';

const CatalogoDetail = () => {
  const { id } = useParams();
  const [catalogo, setCatalogo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCatalogoDetail();
  }, [id]);

  const loadCatalogoDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getCatalogo(id);
      setCatalogo(data);
    } catch (err) {
      console.error('Error al cargar detalles del catálogo:', err);
      setError('Error al cargar los detalles del catálogo');
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

  if (!catalogo && !isLoading && !error) {
    return (
      <DetailView
        title="Catálogo no encontrado"
        backRoute="/catalogos"
        error="No se encontró el catálogo"
        isLoading={false}
      />
    );
  }

  const fields = catalogo ? [
    { label: 'ID', value: catalogo.id },
    { 
      label: 'SKU', 
      value: <span className="font-mono">{catalogo.sku}</span>
    },
    { label: 'Nombre', value: catalogo.nombre },
    { 
      label: 'Precio', 
      value: `Bs. ${parseFloat(catalogo.precio).toFixed(2)}`
    },
    { 
      label: 'Marca', 
      value: catalogo.marca?.nombre || 'Sin marca'
    },
    { 
      label: 'Categoría', 
      value: catalogo.categoria?.nombre || 'Sin categoría'
    },
    { 
      label: 'Modelo', 
      value: catalogo.modelo || 'N/A'
    },
    { 
      label: 'Garantía', 
      value: `${catalogo.meses_garantia} meses`
    },
    { 
      label: 'Stock Disponible', 
      value: (
        <span className={`font-semibold ${catalogo.stock_disponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <FaBox className="inline mr-1" />
          {catalogo.stock_disponible} unidades
        </span>
      )
    },
    { 
      label: (
        <>
          <FaCalendar className="inline mr-2" />
          Fecha de Creación
        </>
      ), 
      value: formatDate(catalogo.fecha_creacion) 
    }
  ] : [];

  // Descripción e Imagen como contenido adicional
  const additionalContent = catalogo && (
    <div className="space-y-6">
      {/* Descripción */}
      {catalogo.descripcion && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Descripción
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{catalogo.descripcion}</p>
        </div>
      )}

      {/* Imagen */}
      {catalogo.imagen_url && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Imagen del Producto
          </h2>
          <div className="flex justify-center">
            <img 
              src={catalogo.imagen_url} 
              alt={catalogo.nombre}
              className="max-w-full h-auto rounded border border-gray-300 shadow-lg"
              style={{ maxHeight: '500px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.insertAdjacentHTML('afterend', '<p class="text-gray-500">Error al cargar la imagen</p>');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const badge = catalogo && (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
      catalogo.estado === 'activo' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {catalogo.estado === 'activo' ? (
        <><FaCheckCircle className="inline mr-1" /> Activo</>
      ) : (
        <><FaTimesCircle className="inline mr-1" /> Inactivo</>
      )}
    </span>
  );

  return (
    <DetailView
      title={catalogo?.nombre || 'Catálogo'}
      icon={<FaBook />}
      backRoute="/catalogos"
      editRoute={`/catalogos/edit/${id}`}
      fields={fields}
      badge={badge}
      additionalContent={additionalContent}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default CatalogoDetail;
