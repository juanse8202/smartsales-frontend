import React from 'react';

const HomePage = () => {
  // Datos de ejemplo para categorías y productos
  const categories = [
    { id: 1, name: 'Tecnología', icon: '💻' },
    { id: 2, name: 'Ropa', icon: '👕' },
    { id: 3, name: 'Hogar', icon: '🏠' },
    { id: 4, name: 'Deportes', icon: '⚽' },
  ];

  const featuredProducts = [
    { id: 1, name: 'Smartphone X', price: 599, image: 'https://via.placeholder.com/300' },
    { id: 2, name: 'Zapatillas Running', price: 89, image: 'https://via.placeholder.com/300' },
    { id: 3, name: 'Cafetera Automática', price: 129, image: 'https://via.placeholder.com/300' },
    { id: 4, name: 'Reloj Inteligente', price: 199, image: 'https://via.placeholder.com/300' },
    { id: 5, name: 'Auriculares Bluetooth', price: 79, image: 'https://via.placeholder.com/300' },
    { id: 6, name: 'Mochila Viaje', price: 49, image: 'https://via.placeholder.com/300' },
    { id: 7, name: 'Set de Pesas', price: 150, image: 'https://via.placeholder.com/300' },
    { id: 8, name: 'Lámpara Escritorio', price: 35, image: 'https://via.placeholder.com/300' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sección de Categorías */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Explora por Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white p-6 rounded-lg shadow-md text-center cursor-pointer hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="text-4xl mb-2">{cat.icon}</div>
              <h3 className="text-xl font-semibold text-gray-700">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Productos Destacados */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Productos Destacados</h2>
          <button className="text-blue-600 hover:text-blue-800 font-semibold">
            Ver todo →
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200">
              <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                 <img 
                   src={product.image} 
                   alt={product.name} 
                   className="object-cover h-full w-full opacity-80 hover:opacity-100 transition-opacity"
                 />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-3">Breve descripción del producto...</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">${product.price}</span>
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;