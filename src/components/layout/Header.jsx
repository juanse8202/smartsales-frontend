import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHistory, FaUserCircle, FaUserEdit, FaChevronDown, FaLock } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CartSidebar from '../CartSidebar';
import VoiceAssistant from '../VoiceAssistant';

const Header = () => {
  // Estado para controlar la visibilidad del menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { getItemCount } = useCart();
  const { user, isAuthenticated, openLoginModal, openRegisterModal, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Cerrar el menú de perfil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
  };

  const handleNavigateProfile = (path) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <a className="block text-teal-600" href="#">
              <span className="sr-only">Home</span>
              {/* SVG Logo */}
              <svg className="h-8" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0C16.7507 0 19.7186 1.02234 22.1261 2.90424C24.5336 4.7861 26.2422 7.4194 26.98 10.3847H25.78C23.7557 10.3549 21.7729 10.9599 20.11 12.1147C20.014 12.1842 19.9138 12.2477 19.81 12.3047H19.67C19.5662 12.2477 19.466 12.1842 19.37 12.1147C17.6924 10.9866 15.7166 10.3841 13.695 10.3841C11.6734 10.3841 9.6976 10.9866 8.02 12.1147C7.924 12.1842 7.8238 12.2477 7.72 12.3047H7.58C7.4762 12.2477 7.376 12.1842 7.28 12.1147C5.6171 10.9599 3.6343 10.3549 1.61 10.3847H0.41ZM23.62 16.6547C24.236 16.175 24.9995 15.924 25.78 15.9447H27.39V12.7347H25.78C24.4052 12.7181 23.0619 13.146 21.95 13.9547C21.3243 14.416 20.5674 14.6649 19.79 14.6649C19.0126 14.6649 18.2557 14.416 17.63 13.9547C16.4899 13.1611 15.1341 12.7356 13.745 12.7356C12.3559 12.7356 11.0001 13.1611 9.86 13.9547C9.2343 14.416 8.4774 14.6649 7.7 14.6649C6.9226 14.6649 6.1657 14.416 5.54 13.9547C4.4144 13.1356 3.0518 12.7072 1.66 12.7347H0V15.9447H1.61C2.39051 15.924 3.154 16.175 3.77 16.6547C4.908 17.4489 6.2623 17.8747 7.65 17.8747C9.0377 17.8747 10.392 17.4489 11.53 16.6547C12.1468 16.1765 12.9097 15.9257 13.69 15.9447C14.4708 15.9223 15.2348 16.1735 15.85 16.6547C16.9901 17.4484 18.3459 17.8738 19.735 17.8738C21.1241 17.8738 22.4799 17.4484 23.62 16.6547ZM23.62 22.3947C24.236 21.915 24.9995 21.664 25.78 21.6847H27.39V18.4747H25.78C24.4052 18.4581 23.0619 18.886 21.95 19.6947C21.3243 20.156 20.5674 20.4049 19.79 20.4049C19.0126 20.4049 18.2557 20.156 17.63 19.6947C16.4899 18.9011 15.1341 18.4757 13.745 18.4757C12.3559 18.4757 11.0001 18.9011 9.86 19.6947C9.2343 20.156 8.4774 20.4049 7.7 20.4049C6.9226 20.4049 6.1657 20.156 5.54 19.6947C4.4144 18.8757 3.0518 18.4472 1.66 18.4747H0V21.6847H1.61C2.39051 21.664 3.154 21.915 3.77 22.3947C4.908 23.1889 6.2623 23.6147 7.65 23.6147C9.0377 23.6147 10.392 23.1889 11.53 22.3947C12.1468 21.9165 12.9097 21.6657 13.69 21.6847C14.4708 21.6623 15.2348 21.9135 15.85 22.3947C16.9901 23.1884 18.3459 23.6138 19.735 23.6138C21.1241 23.6138 22.4799 23.1884 23.62 22.3947Z" fill="currentColor"></path>
              </svg>
            </a>
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                    <Link 
                        className="text-gray-700 font-semibold transition hover:text-blue-600" 
                        to="/"
                    >
                        Inicio
                    </Link>
                </li>
                <li><a className="text-gray-500 transition hover:text-gray-500/75" href="#">Ofertas</a></li>
                <li><a className="text-gray-500 transition hover:text-gray-500/75" href="#">Nosotros</a></li>
                <li><a className="text-gray-500 transition hover:text-gray-500/75" href="#">Contacto</a></li>
                {/* Mostrar Admin Panel solo si el usuario es administrador */}
                {isAuthenticated && user?.is_staff && (
                  <li>
                      <Link 
                          className="rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-700 hover:bg-yellow-200 transition" 
                          to="/dashboard"
                      >
                          Admin Panel
                      </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              {/* Asistente de voz */}
              <VoiceAssistant />

              {/* Historial de pagos - Solo para usuarios autenticados NO admin */}
              {isAuthenticated && !user?.is_staff && (
                <button
                  onClick={() => navigate('/mis-pagos')}
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="Historial de pagos"
                  title="Mis pagos"
                >
                  <FaHistory size={22} />
                </button>
              )}

              {/* Botón del carrito */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Carrito de compras"
              >
                <FaShoppingCart size={24} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>

              <div className="sm:flex sm:gap-4">
                {isAuthenticated ? (
                  // Usuario autenticado
                  <>
                    {user?.is_staff ? (
                      // Admin - Mostrar nombre y botón de cerrar sesión
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaUser className="text-teal-600" />
                          <span className="hidden sm:inline font-medium">{user?.username}</span>
                        </div>
                        <button
                          onClick={logout}
                          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition"
                        >
                          <FaSignOutAlt />
                          <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                      </div>
                    ) : (
                      // Cliente - Mostrar menú dropdown con avatar
                      <div className="relative" ref={profileMenuRef}>
                        <button
                          onClick={toggleProfileMenu}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                            {user?.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="hidden sm:inline font-medium text-gray-700">
                            {user?.username}
                          </span>
                          <FaChevronDown className={`text-gray-600 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileMenuOpen && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-200">
                              <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            
                            <button
                              onClick={() => handleNavigateProfile('/mi-perfil')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                            >
                              <FaUserCircle className="text-blue-600" size={18} />
                              <span>Ver perfil</span>
                            </button>
                            
                            <button
                              onClick={() => handleNavigateProfile('/editar-perfil')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                            >
                              <FaUserEdit className="text-green-600" size={18} />
                              <span>Editar perfil</span>
                            </button>
                            
                            <button
                              onClick={() => handleNavigateProfile('/cambiar-contrasena')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                            >
                              <FaLock className="text-orange-600" size={18} />
                              <span>Cambiar contraseña</span>
                            </button>
                            
                            <div className="border-t border-gray-200 my-2"></div>
                            
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                              <FaSignOutAlt size={18} />
                              <span>Cerrar sesión</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  // Usuario no autenticado
                  <>
                    <button
                      onClick={openLoginModal}
                      className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition"
                    >
                      Login
                    </button>
                    <button
                      onClick={openRegisterModal}
                      className="hidden sm:flex rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-teal-600 hover:text-teal-600/75 transition"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>

              <div className="block md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="rounded-sm bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Menu (opcional, si lo necesitas implementar) */}
         {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
             <nav aria-label="Global">
                <ul className="flex flex-col gap-4 text-sm">
                  <li>
                    <Link className="text-gray-700 font-semibold transition hover:text-blue-600 block" to="/">
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link className="text-gray-700 font-semibold transition hover:text-blue-600 block" to="/catalogo">
                      Catálogo
                    </Link>
                  </li>
                  <li><a className="text-gray-500 transition hover:text-gray-500/75 block" href="#">Ofertas</a></li>
                  <li><a className="text-gray-500 transition hover:text-gray-500/75 block" href="#">Nosotros</a></li>
                  <li><a className="text-gray-500 transition hover:text-gray-500/75 block" href="#">Contacto</a></li>
                  {/* Mostrar Admin Panel solo si el usuario es administrador */}
                  {isAuthenticated && user?.is_staff && (
                    <li>
                      <Link 
                          className="rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-700 hover:bg-yellow-200 transition inline-block" 
                          to="/dashboard"
                      >
                          Admin Panel
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
         )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;