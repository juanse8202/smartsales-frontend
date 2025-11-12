import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

const LoginModal = () => {
  const { showLoginModal, closeLoginModal, openRegisterModal, login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si el modal no está visible, no renderizar nada
  if (!showLoginModal) return null;

  /**
   * Manejar cambios en los inputs
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Limpiar error al escribir
  };

  /**
   * Manejar envío del formulario de login
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  /**
   * Cerrar modal
   */
  const handleClose = () => {
    closeLoginModal();
    setError('');
    setFormData({
      username: '',
      password: '',
    });
  };

  /**
   * Cambiar a modal de registro
   */
  const handleOpenRegister = () => {
    closeLoginModal();
    openRegisterModal();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          &times;
        </button>

        <h2>Iniciar Sesión</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Ingresa tu usuario"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {/* Botón de envío */}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Link para ir a registro */}
        <div className="toggle-mode">
          <p>
            ¿No tienes cuenta?{' '}
            <button onClick={handleOpenRegister} className="link-button">
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
