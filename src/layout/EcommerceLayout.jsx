import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';

// 1. ZONA DE CONTROL (Header)


// 2. ZONA CALIENTE (Hero)
const Hero = () => (
  <section className="bg-blue-600 text-white py-20 text-center">
    <h1 className="text-5xl font-bold mb-4">¡OFERTA DE VERANO!</h1>
    <p className="text-xl mb-8">Hasta 50% de descuento en seleccionados</p>
    <button className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition">
      Ver Ofertas
    </button>
  </section>
);

// 3. ZONA DE DESCUBRIMIENTO (Cuerpo Principal)
const Discovery = () => {
  // Simulamos algunos productos
  const categories = ['Tecnología', 'Ropa', 'Hogar', 'Deportes'];
  
  return (
    <main className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Explora por Categorías</h2>
      
      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {categories.map((cat) => (
          <div key={cat} className="bg-gray-100 h-40 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer transition">
            {cat}
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold mb-8 text-gray-800">Productos Destacados</h2>
       {/* Grid de Productos (Ejemplo simple) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
             <div key={item} className="border rounded-lg p-4 hover:shadow-lg transition">
                 <div className="bg-gray-200 h-48 mb-4 rounded"></div>
                 <h3 className="font-bold">Producto {item}</h3>
                 <p className="text-blue-600 font-semibold">$99.99</p>
             </div>
         ))}
      </div>
    </main>
  );
};

// 4. ZONA DE INFORMACIÓN (Footer)


// COMPONENTE PRINCIPAL QUE UNE TODO
const EcommerceLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Hero podría ser opcional dependiendo de la página, pero dejémoslo fijo por ahora si quieres */}
      <Hero /> 
      <main className="flex-grow">
          {/* AQUÍ se renderizarán tus rutas hijas (HomePage, ProductPage, etc.) */}
          <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default EcommerceLayout;