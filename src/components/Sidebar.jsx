import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsersCog, 
  FaShoppingCart, 
  FaBoxOpen, 
  FaLightbulb,
  FaChevronLeft, 
  FaChevronRight,
  FaChevronDown,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// 1. NUEVA ESTRUCTURA DE DATOS
// Ahora los items pueden tener un array 'submodules'
const navData = [
  { 
    name: 'Dashboard', 
    icon: <FaTachometerAlt size={20} />, 
    to: '/dashboard' 
  },
  { 
    name: 'Administracion', 
    icon: <FaUsersCog size={20} />, 
    to: '/admin', // Link principal para vista contraída
    submodules: [
      { name: 'Usuario', to: '/usuarios' },
      { name: 'Bitacora', to: '/bitacora' },
      { name: 'Rol', to: '/roles' },
    ]
  },
  { 
    name: 'Ventas', 
    icon: <FaShoppingCart size={20} />, 
    to: '/ventas',
    submodules: [
      { name: 'Cliente', to: '/clientes' },
      { name: 'Venta', to: '/dashboard/ventas' },
      { name: 'Pagos', to: '/dashboard/pagos' },
    ]
  },
  { 
    name: 'Catalogo', 
    icon: <FaBoxOpen size={20} />, 
    to: '/catalogo',
    submodules: [
      { name: 'Producto', to: '/productos' },
      { name: 'Catalogo', to: '/catalogos' }, // Como lo pediste
      { name: 'Garantia', to: '/garantias' },
    ]
  },
  { 
    name: 'Analisis', 
    icon: <FaLightbulb size={20} />, 
    to: '/bi',
    submodules: [
      { name: 'Reportes', to: '/reportes' },
      { name: 'Predicciones', to: '/predicciones' },
    ]
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 2. NUEVO ESTADO PARA SUBMENÚS
  // Guardará el 'name' del menú que está abierto, ej: "Administracion"
  const [openSubmenu, setOpenSubmenu] = useState('');

  // 3. FUNCIÓN PARA MANEJAR EL ACORDEÓN
  const handleSubmenuClick = (name) => {
    // Si hago clic en el que ya está abierto, lo cierro
    // Si hago clic en otro, abro ese y cierro el anterior
    setOpenSubmenu(openSubmenu === name ? '' : name);
  };

  // 4. FUNCIÓN PARA EXPANDIR SIDEBAR AL HACER CLIC EN ICONO CUANDO ESTÁ CONTRAÍDO
  const handleIconClick = (item, e) => {
    // Solo expandir si el item tiene submódulos
    if (!isExpanded && item.submodules && item.submodules.length > 0) {
      e.preventDefault(); // Prevenir navegación si tiene submódulos
      setIsExpanded(true);
      setOpenSubmenu(item.name);
    }
    // Si NO tiene submódulos, dejar que navegue normalmente sin expandir
  };

  return (
    <aside 
      className={`relative h-screen bg-white shadow-xl transition-all duration-300 ease-in-out
                  ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      
      {/* --- Botón de Expandir/Contraer (sin cambios) --- */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group absolute top-1/2 -right-3 z-10 flex h-6 w-6 transform items-center justify-center rounded-full bg-gray-200 text-gray-700 shadow-md transition-all duration-300 hover:bg-blue-600 hover:text-white"
        aria-label={isExpanded ? 'Contraer menú' : 'Expandir menú'}
      >
        <span className="absolute left-full ml-3 w-auto min-w-max scale-0 rounded-md bg-gray-800 px-3 py-1 text-xs font-medium text-white shadow-md transition-all duration-300 group-hover:scale-100">
          {isExpanded ? 'Contraer' : 'Expandir'}
        </span>
        {isExpanded ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
      </button>

      {/* --- Logo (sin cambios) --- */}
      <div className="flex h-20 items-center justify-center p-4">
        <span 
          className={`overflow-hidden whitespace-nowrap text-2xl font-bold text-blue-600 transition-all duration-300
                      ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
        >
          {isExpanded ? 'SmartSales' : ''}
        </span>
        {!isExpanded && (
           <span className="text-2xl font-bold text-blue-600">E</span>
        )}
      </div>

      {/* 4. LISTA DE ITEMS DE NAVEGACIÓN (ACTUALIZADA) */}
      <nav className="flex flex-col pt-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px - 140px)' }}>
        <ul className="flex flex-col space-y-1 px-4">
          
          {navData.map((item) => {
            const hasSubmodules = item.submodules && item.submodules.length > 0;
            const isOpen = openSubmenu === item.name;

            return (
              <li key={item.name} className="flex flex-col">
                
                {/* --- RENDERIZACIÓN DEL ITEM PRINCIPAL --- */}
                {isExpanded ? (
                  // -------- VISTA EXPANDIDA --------
                  hasSubmodules ? (
                    // Si TIENE submenús (es un BOTÓN)
                    <button
                      onClick={() => handleSubmenuClick(item.name)}
                      className="group flex w-full items-center justify-between rounded-md p-3 text-gray-700 transition-colors duration-200 hover:bg-blue-50"
                    >
                      <div className="flex items-center">
                        <div className="text-gray-500 transition-colors group-hover:text-blue-600">
                          {item.icon}
                        </div>
                        <span className="ml-4 whitespace-nowrap font-medium">
                          {item.name}
                        </span>
                      </div>
                      <FaChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </button>
                  ) : (
                    // Si NO tiene submenús (es un LINK)
                    <button
                      onClick={() => navigate(item.to)}
                      className="group flex items-center w-full rounded-md p-3 text-gray-700 transition-colors duration-200 hover:bg-blue-50"
                    >
                      <div className="text-gray-500 transition-colors group-hover:text-blue-600">
                        {item.icon}
                      </div>
                      <span className="ml-4 whitespace-nowrap font-medium">
                        {item.name}
                      </span>
                    </button>
                  )
                ) : (
                  // -------- VISTA CONTRAÍDA --------
                  hasSubmodules ? (
                    // Si TIENE submenús, expandir el sidebar al hacer clic
                    <button
                      onClick={(e) => handleIconClick(item, e)}
                      className="group relative flex justify-center rounded-md p-3 text-gray-700 transition-colors duration-200 hover:bg-blue-50"
                    >
                      <div className="text-gray-500 transition-colors group-hover:text-blue-600">
                        {item.icon}
                      </div>
                      {/* Tooltip para la vista contraída */}
                      <span className="absolute left-full ml-4 w-auto min-w-max scale-0 rounded-md bg-gray-800 px-3 py-1 text-xs font-medium text-white shadow-md transition-all duration-300 group-hover:scale-100">
                        {item.name}
                      </span>
                    </button>
                  ) : (
                    // Si NO tiene submenús, es un link directo (no expande el sidebar)
                    <button
                      onClick={() => navigate(item.to)}
                      className="group relative flex justify-center rounded-md p-3 text-gray-700 transition-colors duration-200 hover:bg-blue-50"
                    >
                      <div className="text-gray-500 transition-colors group-hover:text-blue-600">
                        {item.icon}
                      </div>
                      {/* Tooltip para la vista contraída */}
                      <span className="absolute left-full ml-4 w-auto min-w-max scale-0 rounded-md bg-gray-800 px-3 py-1 text-xs font-medium text-white shadow-md transition-all duration-300 group-hover:scale-100">
                        {item.name}
                      </span>
                    </button>
                  )
                )}

                {/* --- RENDERIZACIÓN DE SUBMÓDULOS --- */}
                {/* Solo se muestran si está expandido y el submenú está abierto */}
                {isExpanded && hasSubmodules && (
                  <ul
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
                  >
                    {item.submodules.map((subItem) => (
                      <li key={subItem.name} className="pl-8"> 
                        {/* El 'pl-8' (padding-left) crea la sangría */}
                        <button
                          onClick={() => navigate(subItem.to)}
                          className="flex items-center w-full text-left rounded-md py-2 px-3 text-sm text-gray-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {subItem.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
        
      {/* Botón de Cerrar Sesión - Posición fija */}
      <div className="border-t border-gray-200 px-4 py-4 bg-white">
          {isExpanded ? (
            <div className="mb-3 flex items-center gap-2 text-gray-700 px-3">
              <FaUser className="text-teal-600" size={16} />
              <span className="text-sm font-medium truncate">{user?.username}</span>
            </div>
          ) : null}
          
          <button
            onClick={logout}
            className={`group flex w-full items-center rounded-md p-3 text-white bg-red-600 transition-colors duration-200 hover:bg-red-700 ${
              isExpanded ? 'justify-start' : 'justify-center'
            }`}
          >
            <FaSignOutAlt size={18} />
            {isExpanded && (
              <span className="ml-3 whitespace-nowrap font-medium">
                Cerrar Sesión
              </span>
            )}
            {!isExpanded && (
              <span className="absolute left-full ml-4 w-auto min-w-max scale-0 rounded-md bg-gray-800 px-3 py-1 text-xs font-medium text-white shadow-md transition-all duration-300 group-hover:scale-100">
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>
    </aside>
  );
}

export default Sidebar;