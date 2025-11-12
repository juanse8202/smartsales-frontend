import React from 'react';

/**
 * Un componente de tabla dinámico y reutilizable con soporte responsivo.
 *
 * @param {Array} columns - Array de objetos para definir las cabeceras.
 * Ej: [{ header: 'Nombre', accessor: 'name' }]
 * @param {Array} data - Array de objetos con los datos a mostrar.
 * Ej: [{ id: 1, name: 'Producto A' }]
 * @param {Function} renderActions - Una función que recibe el 'item' (la fila)
 * y devuelve el JSX para la celda de acciones.
 */
function DynamicTable({ columns, data, renderActions }) {
  
  // Si no hay datos, muestra un mensaje
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No hay datos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full text-sm text-left text-gray-500">
        
        {/* === CABECERA DINÁMICA === */}
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-200">
          <tr>
            {/* 1. Mapea las columnas que le pasaste */}
            {columns.map((col) => (
              <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap" key={col.accessor}>
                {col.header}
              </th>
            ))}
            
            {/* 2. Si pasaste la función 'renderActions', añade la columna "Acciones" */}
            {renderActions && (
              <th scope="col" className="px-4 py-3 font-semibold text-center whitespace-nowrap" key="actions-header">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        
        {/* === CUERPO DINÁMICO === */}
        <tbody className="divide-y divide-gray-200">
          {/* 3. Mapea los datos para crear cada fila */}
          {data.map((item, index) => (
            <tr 
              key={item.id || index}
              className="hover:bg-gray-50 transition-colors"
            >
              
              {/* 4. Mapea las columnas OTRA VEZ por cada fila */}
              {columns.map((col, colIndex) => {
                // Obtiene el valor de la celda. Ej: item['name']
                const cellValue = item[col.accessor];
                
                // Si es la primera columna, la pone como <th> (scope="row")
                if (colIndex === 0) {
                  return (
                    <th 
                      scope="row" 
                      className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap"
                      key={col.accessor}
                    >
                      {cellValue}
                    </th>
                  );
                }
                
                // Para las demás columnas, las pone como <td>
                return (
                  <td className="px-4 py-3" key={col.accessor}>
                    {cellValue}
                  </td>
                );
              })}
              
              {/* 5. Si pasaste la función 'renderActions', la llama */}
              {renderActions && (
                <td className="px-4 py-3" key="actions-cell">
                  {/* Aquí llamamos a tu función, pasándole la fila actual */}
                  {renderActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DynamicTable;