import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

/**
 * Componente reutilizable para mostrar detalles de cualquier entidad
 * @param {Object} props
 * @param {string} props.title - Título principal (ej: "Juan Pérez")
 * @param {React.ReactNode} props.icon - Ícono a mostrar en el título
 * @param {string} props.backRoute - Ruta a la que volver (ej: "/usuarios")
 * @param {string} props.editRoute - Ruta para editar (ej: "/usuarios/edit/1")
 * @param {Array} props.fields - Array de campos a mostrar [{label: "ID", value: "1"}, ...]
 * @param {React.ReactNode} props.badge - Badge opcional para mostrar al lado del título
 * @param {React.ReactNode} props.additionalContent - Contenido adicional después de la información
 * @param {boolean} props.isLoading - Estado de carga
 * @param {string} props.error - Mensaje de error
 */
const DetailView = ({
  title,
  icon,
  backRoute,
  editRoute,
  fields = [],
  badge,
  additionalContent,
  isLoading = false,
  error = null,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backRoute);
  };

  const handleEdit = () => {
    if (editRoute) {
      navigate(editRoute);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="text-gray-600">Cargando detalles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={handleBack}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow min-h-full overflow-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Volver a la lista
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center break-words">
            {icon && <span className="mr-3 text-blue-600 flex-shrink-0">{icon}</span>}
            <span className="break-words">{title}</span>
          </h1>
          {badge && <div className="mt-2">{badge}</div>}
        </div>
        {editRoute && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Editar
          </button>
        )}
      </div>

      {/* Información Completa */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Información Completa
        </h2>
        <div className="space-y-3 sm:space-y-4">
          {fields.map((field, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2">
              <div className="w-full sm:w-48 font-medium text-gray-700 flex-shrink-0">
                {field.label}:
              </div>
              <div className="flex-1 text-gray-900 break-words overflow-wrap-anywhere">
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido Adicional */}
      {additionalContent && (
        <div>
          {additionalContent}
        </div>
      )}
    </div>
  );
};

export default DetailView;
