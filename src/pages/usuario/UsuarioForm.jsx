import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createUsuario, updateUsuario, getUsuario } from '../../api/UsuarioApi';
import { getAllRoles } from '../../api/RolApi';
import { FaUser, FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';

const UsuarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: ''
  });
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadRoles();
    if (isEditMode) {
      loadUsuario();
    }
  }, [id]);

  const loadRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error('Error al cargar roles:', err);
      setError('Error al cargar los roles disponibles');
    }
  };

  const loadUsuario = async () => {
    try {
      setIsLoading(true);
      const data = await getUsuario(id);
      setFormData({
        username: data.username,
        email: data.email,
        password: '', // No mostrar la contraseña actual
        role_id: data.role_id || ''
      });
    } catch (err) {
      console.error('Error al cargar usuario:', err);
      setError('Error al cargar el usuario');
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

    // Validar username
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.includes(' ')) {
      errors.username = 'El nombre de usuario no puede tener espacios';
    } else if (formData.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Validar password (solo en creación o si se está cambiando)
    if (!isEditMode || formData.password) {
      if (!formData.password) {
        errors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/\d/.test(formData.password)) {
        errors.password = 'La contraseña debe contener al menos un número';
      } else if (!/[a-zA-Z]/.test(formData.password)) {
        errors.password = 'La contraseña debe contener al menos una letra';
      }
    }

    // Validar rol
    if (!formData.role_id) {
      errors.role_id = 'Debe seleccionar un rol';
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

      // Preparar datos para enviar
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        role_id: parseInt(formData.role_id)
      };

      // Solo incluir contraseña si se proporcionó
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      if (isEditMode) {
        await updateUsuario(id, dataToSend);
        alert('Usuario actualizado exitosamente');
      } else {
        await createUsuario(dataToSend);
        alert('Usuario creado exitosamente');
      }

      navigate('/usuarios');
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      
      // Manejar errores específicos del backend
      if (err.response?.data) {
        const backendErrors = err.response.data;
        if (typeof backendErrors === 'object') {
          setValidationErrors(backendErrors);
        } else {
          setError(backendErrors.message || 'Error al guardar el usuario');
        }
      } else {
        setError('Error al guardar el usuario');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

  if (isLoading && isEditMode) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow min-h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
          {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded break-words">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-full lg:max-w-2xl">
        {/* Nombre de Usuario */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            <FaUser className="inline mr-2 text-gray-500" />
            Nombre de Usuario *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              validationErrors.username ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Ej: juanperez"
            disabled={isLoading}
          />
          {validationErrors.username && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 3 caracteres, sin espacios
          </p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <FaEnvelope className="inline mr-2 text-gray-500" />
            Correo Electrónico *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="ejemplo@correo.com"
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            <FaLock className="inline mr-2 text-gray-500" />
            Contraseña {isEditMode ? '(dejar en blanco para no cambiar)' : '*'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              validationErrors.password ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder={isEditMode ? 'Nueva contraseña (opcional)' : 'Mínimo 8 caracteres'}
            disabled={isLoading}
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 8 caracteres, debe contener letras y números
          </p>
        </div>

        {/* Rol */}
        <div>
          <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-2">
            <FaUserShield className="inline mr-2 text-gray-500" />
            Rol *
          </label>
          <select
            id="role_id"
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              validationErrors.role_id ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            disabled={isLoading}
          >
            <option value="">Seleccionar rol...</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {validationErrors.role_id && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.role_id}</p>
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

export default UsuarioForm;
