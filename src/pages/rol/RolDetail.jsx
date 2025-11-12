import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoleById } from '../../api/RolApi';
import { FaUserShield, FaKey } from 'react-icons/fa';
import DetailView from '../../components/DetailView';

const RolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRoleDetail();
  }, [id]);

  const loadRoleDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getRoleById(id);
      setRole(data);
    } catch (err) {
      console.error('Error al cargar detalles del rol:', err);
      setError('Error al cargar los detalles del rol');
    } finally {
      setIsLoading(false);
    }
  };

  if (!role && !isLoading && !error) {
    return (
      <DetailView
        title="Rol no encontrado"
        backRoute="/roles"
        error="No se encontró el rol"
        isLoading={false}
      />
    );
  }

  const fields = role ? [
    { label: 'ID', value: role.id },
    { label: 'Nombre del Rol', value: role.name }
  ] : [];

  const permisosContent = role && (
    <>
      <div className="flex items-center mb-4 border-b pb-2">
        <FaKey className="text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-700">
          Permisos Asignados
        </h2>
        <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {role.permissions?.length || 0}
        </span>
      </div>

      {role.permissions && role.permissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {role.permissions.map((permission) => (
            <div
              key={permission.id}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {permission.id}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {permission.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {permission.codename}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Este rol no tiene permisos asignados
          </p>
          <button
            onClick={() => navigate(`/roles/edit/${id}`)}
            className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
          >
            Asignar permisos →
          </button>
        </div>
      )}
    </>
  );

  return (
    <DetailView
      title={role?.name || 'Rol'}
      icon={<FaUserShield />}
      backRoute="/roles"
      editRoute={`/roles/edit/${id}`}
      fields={fields}
      additionalContent={permisosContent}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default RolDetail;
