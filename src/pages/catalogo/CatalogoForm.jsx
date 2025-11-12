import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCatalogo, updateCatalogo, getCatalogo, getAllMarcas, getAllCategorias } from '../../api/CatalogoApi';
import { FaBook, FaDollarSign, FaBarcode, FaImage, FaInfoCircle, FaTags } from 'react-icons/fa';

const CatalogoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    precio: '',
    meses_garantia: '12',
    modelo: '',
    marca_id: '',
    categoria_id: '',
    estado: 'activo'
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenActual, setImagenActual] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadMarcasYCategorias();
    if (isEditMode) {
      loadCatalogo();
    }
  }, [id]);

  const loadMarcasYCategorias = async () => {
    try {
      const [marcasData, categoriasData] = await Promise.all([
        getAllMarcas(),
        getAllCategorias()
      ]);
      setMarcas(Array.isArray(marcasData) ? marcasData : []);
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
    } catch (err) {
      console.error('Error al cargar marcas y categorías:', err);
      setError('Error al cargar marcas y categorías');
      setMarcas([]);
      setCategorias([]);
    }
  };

  const loadCatalogo = async () => {
    try {
      setIsLoading(true);
      const data = await getCatalogo(id);
      setFormData({
        sku: data.sku,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        precio: data.precio,
        meses_garantia: data.meses_garantia,
        modelo: data.modelo || '',
        marca_id: data.marca?.id || '',
        categoria_id: data.categoria?.id || '',
        estado: data.estado
      });
      if (data.imagen_url) {
        setImagenActual(data.imagen_url);
        setImagenPreview(data.imagen_url);
      }
    } catch (err) {
      console.error('Error al cargar catálogo:', err);
      setError('Error al cargar el catálogo');
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
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({
          ...prev,
          imagen_url: 'Solo se permiten archivos de imagen'
        }));
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          imagen_url: 'La imagen no debe superar los 5MB'
        }));
        return;
      }

      setImagenFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error
      if (validationErrors.imagen_url) {
        setValidationErrors(prev => ({
          ...prev,
          imagen_url: null
        }));
      }
    }
  };

  const removeImage = () => {
    setImagenFile(null);
    setImagenPreview(isEditMode ? imagenActual : null);
    document.getElementById('imagen_url').value = '';
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.sku.trim()) {
      errors.sku = 'El SKU es requerido';
    }

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      errors.precio = 'El precio debe ser mayor a 0';
    }

    if (!formData.meses_garantia || parseInt(formData.meses_garantia) < 0) {
      errors.meses_garantia = 'Los meses de garantía deben ser un número positivo';
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

      // Crear FormData para enviar (el backend maneja la subida a ImgBB)
      const formDataToSend = new FormData();
      formDataToSend.append('sku', formData.sku.trim());
      formDataToSend.append('nombre', formData.nombre.trim());
      formDataToSend.append('descripcion', formData.descripcion.trim());
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('meses_garantia', formData.meses_garantia);
      formDataToSend.append('modelo', formData.modelo.trim());
      formDataToSend.append('estado', formData.estado);
      
      // Agregar marca y categoría si están seleccionados
      if (formData.marca_id) {
        formDataToSend.append('marca_id', formData.marca_id);
      }
      if (formData.categoria_id) {
        formDataToSend.append('categoria_id', formData.categoria_id);
      }

      // Agregar imagen si hay una nueva
      if (imagenFile) {
        formDataToSend.append('imagen_url', imagenFile);
      }

      if (isEditMode) {
        await updateCatalogo(id, formDataToSend);
      } else {
        await createCatalogo(formDataToSend);
      }

      navigate('/catalogos');
    } catch (err) {
      console.error('Error al guardar catálogo:', err);
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          setValidationErrors(err.response.data);
        } else {
          setError(err.response.data);
        }
      } else {
        setError('Error al guardar el catálogo');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/catalogos');
  };

  if (isLoading && isEditMode && !formData.sku) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow min-h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
          {isEditMode ? 'Editar Catálogo' : 'Crear Nuevo Catálogo'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded break-words">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              <FaBarcode className="inline mr-2 text-gray-500" />
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                validationErrors.sku ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Ej: LAP-HP-001"
              disabled={isLoading}
            />
            {validationErrors.sku && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.sku}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              <FaBook className="inline mr-2 text-gray-500" />
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                validationErrors.nombre ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Ej: Laptop HP Pavilion"
              disabled={isLoading}
            />
            {validationErrors.nombre && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.nombre}</p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
              <FaDollarSign className="inline mr-2 text-gray-500" />
              Precio (Bs.) *
            </label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border ${
                validationErrors.precio ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="0.00"
              disabled={isLoading}
            />
            {validationErrors.precio && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.precio}</p>
            )}
          </div>

          {/* Marca */}
          <div>
            <label htmlFor="marca_id" className="block text-sm font-medium text-gray-700 mb-2">
              <FaTags className="inline mr-2 text-gray-500" />
              Marca
            </label>
            <select
              id="marca_id"
              name="marca_id"
              value={formData.marca_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                validationErrors.marca_id ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={isLoading}
            >
              <option value="">Sin marca</option>
              {marcas.map(marca => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
            {validationErrors.marca_id && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.marca_id}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-2">
              <FaTags className="inline mr-2 text-gray-500" />
              Categoría
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                validationErrors.categoria_id ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={isLoading}
            >
              <option value="">Sin categoría</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {validationErrors.categoria_id && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.categoria_id}</p>
            )}
          </div>

          {/* Modelo */}
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 mb-2">
              <FaInfoCircle className="inline mr-2 text-gray-500" />
              Modelo
            </label>
            <input
              type="text"
              id="modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Pavilion 15-eg0001la"
              disabled={isLoading}
            />
          </div>

          {/* Meses de Garantía */}
          <div>
            <label htmlFor="meses_garantia" className="block text-sm font-medium text-gray-700 mb-2">
              <FaInfoCircle className="inline mr-2 text-gray-500" />
              Meses de Garantía *
            </label>
            <input
              type="number"
              id="meses_garantia"
              name="meses_garantia"
              value={formData.meses_garantia}
              onChange={handleChange}
              min="0"
              className={`w-full px-4 py-2 border ${
                validationErrors.meses_garantia ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={isLoading}
            />
            {validationErrors.meses_garantia && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.meses_garantia}</p>
            )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Descripción - Ancho completo */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
            <FaInfoCircle className="inline mr-2 text-gray-500" />
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descripción detallada del producto..."
            disabled={isLoading}
          />
        </div>

        {/* Imagen */}
        <div>
          <label htmlFor="imagen_url" className="block text-sm font-medium text-gray-700 mb-2">
            <FaImage className="inline mr-2 text-gray-500" />
            Imagen del Producto
          </label>
          <input
            type="file"
            id="imagen_url"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {validationErrors.imagen_url && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.imagen_url}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
          </p>

          {/* Preview de imagen */}
          {imagenPreview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
              <div className="relative inline-block">
                <img 
                  src={imagenPreview} 
                  alt="Preview" 
                  className="w-48 h-48 object-cover rounded border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            </div>
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

export default CatalogoForm;
