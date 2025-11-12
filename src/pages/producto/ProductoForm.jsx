import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProducto, updateProducto, getProducto } from '../../api/ProductoApi';
import { getAllCatalogo } from '../../api/CatalogoApi';
import { FaBox, FaDollarSign, FaBarcode, FaInfoCircle } from 'react-icons/fa';

const ProductoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    numero_serie: '',
    costo: '',
    estado: 'disponible',
    catalogo_id: ''
  });
  const [catalogos, setCatalogos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const estadoOptions = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'reservado', label: 'Reservado' },
    { value: 'vendido', label: 'Vendido' },
    { value: 'en_reparacion', label: 'En Reparación' },
    { value: 'dado_de_baja', label: 'Dado de Baja' }
  ];

  useEffect(() => {
    loadCatalogos();
    if (isEditMode) {
      loadProducto();
    }
  }, [id]);

  const loadCatalogos = async () => {
    try {
      const data = await getAllCatalogo();
      setCatalogos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
      setError('Error al cargar los catálogos disponibles');
    }
  };

  const loadProducto = async () => {
    try {
      setIsLoading(true);
      const data = await getProducto(id);
      setFormData({
        numero_serie: data.numero_serie,
        costo: data.costo,
        estado: data.estado,
        catalogo_id: data.catalogo?.id || ''
      });
    } catch (err) {
      console.error('Error al cargar producto:', err);
      setError('Error al cargar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error de validación del campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.numero_serie.trim()) {
      errors.numero_serie = 'El número de serie es requerido';
    }

    if (!formData.costo || parseFloat(formData.costo) <= 0) {
      errors.costo = 'El costo debe ser mayor a 0';
    }

    if (!formData.catalogo_id) {
      errors.catalogo_id = 'Debe seleccionar un catálogo';
    }

    if (!formData.estado) {
      errors.estado = 'Debe seleccionar un estado';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const productoData = {
        numero_serie: formData.numero_serie.trim(),
        costo: parseFloat(formData.costo),
        estado: formData.estado,
        catalogo_id: parseInt(formData.catalogo_id)
      };

      if (isEditMode) {
        await updateProducto(id, productoData);
      } else {
        await createProducto(productoData);
      }

      navigate('/productos');
    } catch (err) {
      console.error('Error al guardar producto:', err);
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          setValidationErrors(err.response.data);
        } else {
          setError(err.response.data);
        }
      } else {
        setError('Error al guardar el producto');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/productos');
  };

  if (isLoading && isEditMode && !formData.numero_serie) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow min-h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
          {isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded break-words">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-full lg:max-w-2xl">
        {/* Número de Serie */}
        <div>
          <label htmlFor="numero_serie" className="block text-sm font-medium text-gray-700 mb-2">
            <FaBarcode className="inline mr-2 text-gray-500" />
            Número de Serie *
          </label>
          <input
            type="text"
            id="numero_serie"
            name="numero_serie"
            value={formData.numero_serie}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              validationErrors.numero_serie ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Ej: NS-2024-001"
            disabled={isLoading}
          />
          {validationErrors.numero_serie && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.numero_serie}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Número de serie único del producto
          </p>
        </div>

        {/* Catálogo */}
        <div>
          <label htmlFor="catalogo_id" className="block text-sm font-medium text-gray-700 mb-2">
            <FaBox className="inline mr-2 text-gray-500" />
            Catálogo (Producto) *
          </label>
          <select
            id="catalogo_id"
            name="catalogo_id"
            value={formData.catalogo_id}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              validationErrors.catalogo_id ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            disabled={isLoading}
          >
            <option value="">Seleccione un catálogo</option>
            {catalogos.map(catalogo => (
              <option key={catalogo.id} value={catalogo.id}>
                {catalogo.nombre} - {catalogo.sku} (Bs. {parseFloat(catalogo.precio).toFixed(2)})
              </option>
            ))}
          </select>
          {validationErrors.catalogo_id && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.catalogo_id}</p>
          )}
        </div>

        {/* Costo */}
        <div>
          <label htmlFor="costo" className="block text-sm font-medium text-gray-700 mb-2">
            <FaDollarSign className="inline mr-2 text-gray-500" />
            Costo (Bs.) *
          </label>
          <input
            type="number"
            id="costo"
            name="costo"
            value={formData.costo}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full px-4 py-2 border ${
              validationErrors.costo ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="0.00"
            disabled={isLoading}
          />
          {validationErrors.costo && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.costo}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Costo de adquisición del producto
          </p>
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
            <FaInfoCircle className="inline mr-2 text-gray-500" />
            Estado *
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              validationErrors.estado ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            disabled={isLoading}
          >
            {estadoOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {validationErrors.estado && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.estado}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductoForm;
