import { createContext, useState, useEffect, useContext } from 'react';
import * as authAPI from '../api/authApi.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Verificar si hay usuario guardado al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('access_token');
    
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Iniciar sesión
   */
  const loginUser = async (username, password) => {
    try {
      const data = await authAPI.login(username, password);
      const { access, refresh, user: userData } = data;
      
      // Guardar tokens y usuario
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setShowLoginModal(false);
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.response?.data?.detail || 'Error al iniciar sesión' };
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const registerUser = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      const { access, refresh, user: newUser } = data;
      
      // Guardar tokens y usuario
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setShowRegisterModal(false);
      return { success: true };
    } catch (error) {
      console.error('Error en register:', error);
      return { success: false, error: error.response?.data?.error || 'Error al registrarse' };
    }
  };

  /**
   * Cerrar sesión
   */
  const logoutUser = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar todo
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Recargar la página para limpiar el estado del carrito
      window.location.href = '/';
    }
  };

  /**
   * Abrir modal de login
   */
  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  /**
   * Cerrar modal de login
   */
  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  /**
   * Abrir modal de registro
   */
  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  /**
   * Cerrar modal de registro
   */
  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const value = {
    user,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    loading,
    isAuthenticated: !!user,
    showLoginModal,
    openLoginModal,
    closeLoginModal,
    showRegisterModal,
    openRegisterModal,
    closeRegisterModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
