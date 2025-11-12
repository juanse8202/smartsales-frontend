import React from 'react';

function DashboardPage() {
  return (
    // Contenedor principal de la página
    <div>
      
      {/* --- TÍTULO --- */}
      <h1 className="text-3xl font-bold text-gray-800">
        Dashboard
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Bienvenido a tu panel de control de SmartSales.
      </p>

      {/* --- REJILLA DE WIDGETS ESTÁTICOS --- */}
      {/* - 'grid': Activa el modo de rejilla de Tailwind.
        - 'grid-cols-1': 1 columna en móviles.
        - 'md:grid-cols-2': 2 columnas en pantallas medianas.
        - 'lg:grid-cols-3': 3 columnas en pantallas grandes (responsive).
        - 'gap-6': Espacio entre las tarjetas.
      */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* --- TARJETA 1 (Card) --- */}
        {/* Estilos de la tarjeta:
          - 'bg-white': Fondo blanco.
          - 'p-6': Padding (relleno) interno.
          - 'rounded-lg': Bordes redondeados.
          - 'shadow-md': Una sombra suave.
        */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Ventas Totales</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            $12,450
          </p>
          <p className="mt-1 text-sm text-gray-500">+5% vs mes anterior</p>
        </div>

        {/* --- TARJETA 2 (Card) --- */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Nuevos Clientes</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">
            89
          </p>
          <p className="mt-1 text-sm text-gray-500">+12% vs mes anterior</p>
        </div>

        {/* --- TARJETA 3 (Card) --- */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Productos Activos</h2>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            314
          </p>
          <p className="mt-1 text-sm text-gray-500">Total en catálogo</p>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;