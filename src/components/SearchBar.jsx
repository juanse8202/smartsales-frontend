import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

/**
 * Un componente de barra de búsqueda reutilizable y controlado.
 * Busca en tiempo real mientras el usuario escribe.
 *
 * @param {string} value - El valor actual del término de búsqueda (controlado por el padre).
 * @param {function} onChange - Función que se llama cuando el usuario escribe (recibe el nuevo valor).
 * @param {string} placeholder - El texto a mostrar en el input.
 * @param {string} className - Clases CSS adicionales para el contenedor.
 */
function SearchBar({ 
  value = '', 
  onChange, 
  placeholder = "Buscar...",
  className = '' 
}) {
  
  // Manejador para actualizar el valor mientras el usuario escribe
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Manejador para limpiar la búsqueda
  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`flex items-center w-full max-w-2xl ${className}`}>
      <div className="relative w-full">
        {/* Icono de búsqueda */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="w-4 h-4 text-gray-500" />
        </div>
        
        {/* Input de búsqueda */}
        <input 
          type="text" 
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
        
        {/* Botón para limpiar (solo visible cuando hay texto) */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <FaTimes className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;