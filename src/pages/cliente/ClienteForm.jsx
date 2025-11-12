import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCliente, updateCliente, getCliente, getAllCiudades, getAllDepartamentos } from '../../api/ClienteApi';
import { FaUser, FaPhone, FaIdCard, FaMapMarkerAlt, FaVenusMars, FaBuilding } from 'react-icons/fa';

const ClienteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    nit_ci: '',
    ciudad_id: '',
    razon_social: 'natural',
    sexo: '',
    estado: 'activo'
  });

  const [ciudades, setCiudades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [filteredCiudades, setFilteredCiudades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, [id]);

  useEffect(() => {
    filterCiudadesByDepartamento();
  }, [selectedDepartamento, ciudades]);

  const loadInitialData = async () => {
    try {
      const [ciudadesData, departamentosData] = await Promise.all([
        getAllCiudades(),
        getAllDepartamentos()
      ]);
      
      setCiudades(ciudadesData);
      setDepartamentos(departamentosData);

      if (isEditMode) {
        await loadCliente();
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos necesarios');
    }
  };

  const loadCliente = async () => {
    try {
      setIsLoading(true);
      const data = await getCliente(id);
      
      setFormData({
        nombre: data.nombre || '',
        telefono: data.telefono || '',
        nit_ci: data.nit_ci || '',
        ciudad_id: data.ciudad?.id || '',
        razon_social: data.razon_social || 'natural',
        sexo: data.sexo || '',
        estado: data.estado || 'activo'
      });

      // Establecer el departamento si existe la ciudad
      if (data.ciudad?.departamento?.id) {
        setSelectedDepartamento(data.ciudad.departamento.id);
      }
    } catch (err) {
      console.error('Error al cargar cliente:', err);
      setError('Error al cargar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCiudadesByDepartamento = () => {
    if (selectedDepartamento) {
      const filtered = ciudades.filter(
        ciudad => ciudad.departamento?.id === parseInt(selectedDepartamento)
      );
      setFilteredCiudades(filtered);
    } else {
      setFilteredCiudades([]);
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

  const handleDepartamentoChange = (e) => {
    const value = e.target.value;
    setSelectedDepartamento(value);
    setFormData(prev => ({
      ...prev,
      ciudad_id: '' // Resetear ciudad cuando cambia el departamento
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.nit_ci?.trim()) {
      errors.nit_ci = 'El NIT/CI es requerido';
    }

    if (!formData.ciudad_id) {
      errors.ciudad_id = 'Debe seleccionar una ciudad';
    }

    if (formData.razon_social === 'natural' && !formData.sexo) {
      errors.sexo = 'El sexo es requerido para personas naturales';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const dataToSend = {
        nombre: formData.nombre,
        telefono: formData.telefono || null,
        nit_ci: formData.nit_ci,
        ciudad_id: parseInt(formData.ciudad_id),
        razon_social: formData.razon_social,
        sexo: formData.razon_social === 'natural' ? formData.sexo : null,
        estado: formData.estado
      };

      if (isEditMode) {
        await updateCliente(id, dataToSend);
        alert('Cliente actualizado exitosamente');
      } else {
        await createCliente(dataToSend);
        alert('Cliente creado exitosamente');
      }

      navigate('/clientes');
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      
      if (err.response?.data) {
        const backendErrors = err.response.data;
        if (typeof backendErrors === 'object') {
          setValidationErrors(backendErrors);
        } else {
          setError(backendErrors.message || 'Error al guardar el cliente');
        }
      } else {
        setError('Error al guardar el cliente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clientes');
  };

  if (isLoading && isEditMode && !formData.nombre) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow min-h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
          {isEditMode ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded break-words">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2 text-gray-500" />
              Nombre Completo *
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
              placeholder="Ej: Juan Pérez"
              disabled={isLoading}
            />
            {validationErrors.nombre && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.nombre}</p>
            )}
          </div>

          {/* NIT/CI */}
          <div>
            <label htmlFor="nit_ci" className="block text-sm font-medium text-gray-700 mb-2">
              <FaIdCard className="inline mr-2 text-gray-500" />
              NIT/CI *
            </label>
            <input
              type="text"
              id="nit_ci"
              name="nit_ci"
              value={formData.nit_ci}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                validationErrors.nit_ci ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Ej: 1234567"
              disabled={isLoading}
            />
            {validationErrors.nit_ci && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.nit_ci}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              <FaPhone className="inline mr-2 text-gray-500" />
              Teléfono
            </label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 71234567"
              disabled={isLoading}
            />
          </div>

          {/* Razón Social */}
          <div>
            <label htmlFor="razon_social" className="block text-sm font-medium text-gray-700 mb-2">
              <FaBuilding className="inline mr-2 text-gray-500" />
              Razón Social *
            </label>
            <select
              id="razon_social"
              name="razon_social"
              value={formData.razon_social}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="natural">Persona Natural</option>
              <option value="juridica">Persona Jurídica</option>
            </select>
          </div>

          {/* Sexo (solo para persona natural) */}
          {formData.razon_social === 'natural' && (
            <div>
              <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-2">
                <FaVenusMars className="inline mr-2 text-gray-500" />
                Sexo *
              </label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  validationErrors.sexo ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={isLoading}
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {validationErrors.sexo && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.sexo}</p>
              )}
            </div>
          )}

          {/* Estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Departamento */}
          <div>
            <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
              Departamento *
            </label>
            <select
              id="departamento"
              value={selectedDepartamento}
              onChange={handleDepartamentoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Seleccionar departamento...</option>
              {departamentos.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Ciudad */}
          <div>
            <label htmlFor="ciudad_id" className="block text-sm font-medium text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
              Ciudad *
            </label>
            <select
              id="ciudad_id"
              name="ciudad_id"
              value={formData.ciudad_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                validationErrors.ciudad_id ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={isLoading || !selectedDepartamento}
            >
              <option value="">
                {selectedDepartamento ? 'Seleccionar ciudad...' : 'Primero seleccione un departamento'}
              </option>
              {filteredCiudades.map((ciudad) => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre}
                </option>
              ))}
            </select>
            {validationErrors.ciudad_id && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.ciudad_id}</p>
            )}
          </div>
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

export default ClienteForm;
