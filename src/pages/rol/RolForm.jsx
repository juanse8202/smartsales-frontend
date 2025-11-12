import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRole, updateRole, getRoleById, getAllPermissions } from '../../api/RolApi';

const RolForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    permission_ids: []
  });
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPermissions();
    if (isEditMode) {
      loadRole();
    }
  }, [id]);

  const loadPermissions = async () => {
    try {
      const data = await getAllPermissions();
      setPermissions(data);
    } catch (err) {
      console.error('Error al cargar permisos:', err);
      setError('Error al cargar los permisos disponibles');
    }
  };

  const loadRole = async () => {
    try {
      setIsLoading(true);
      const data = await getRoleById(id);
      setFormData({
        name: data.name,
        permission_ids: data.permissions.map(p => p.id)
      });
    } catch (err) {
      console.error('Error al cargar rol:', err);
      setError('Error al cargar el rol');
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
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }));
  };

  const handleSelectAll = () => {
    if (formData.permission_ids.length === permissions.length) {
      setFormData(prev => ({ ...prev, permission_ids: [] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        permission_ids: permissions.map(p => p.id) 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre del rol es requerido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (isEditMode) {
        await updateRole(id, formData);
        alert('Rol actualizado exitosamente');
      } else {
        await createRole(formData);
        alert('Rol creado exitosamente');
      }
      
      navigate('/roles');
    } catch (err) {
      console.error('Error al guardar rol:', err);
      setError(err.response?.data?.message || 'Error al guardar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  if (isLoading && isEditMode) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow min-h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
          {isEditMode ? 'Editar Rol' : 'Crear Nuevo Rol'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded break-words">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
        {/* Nombre del Rol */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Rol *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Administrador, Vendedor, etc."
            required
          />
        </div>

        {/* Permisos */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Permisos
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {formData.permission_ids.length === permissions.length
                ? 'Deseleccionar todos'
                : 'Seleccionar todos'}
            </button>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
            {permissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay permisos disponibles
              </p>
            ) : (
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start p-3 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permission_ids.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {permission.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {permission.codename}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {formData.permission_ids.length} permiso(s) seleccionado(s)
          </p>
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

export default RolForm;
