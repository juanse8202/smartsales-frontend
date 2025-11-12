import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllDepartamentos, getAllCiudades } from '../../api/ubicacionApi.jsx';
import { createCliente } from '../../api/ClienteApi.jsx';
import './RegisterModal.css';

const RegisterModal = () => {
  const { showRegisterModal, closeRegisterModal, openLoginModal, register } = useAuth();
  const [step, setStep] = useState(1); // Paso actual (1 o 2)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Datos del usuario (Paso 1)
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  // Datos del cliente (Paso 2)
  const [clienteData, setClienteData] = useState({
    nombre: '',
    nit_ci: '',
    telefono: '',
    razon_social: 'natural',
    sexo: '',
    estado: 'activo',
    ciudad: '',
    departamento: '',
  });

  // Listas para los selects
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

  // Cargar departamentos al abrir el modal
  useEffect(() => {
    if (showRegisterModal) {
      cargarDepartamentos();
      cargarCiudades();
    }
  }, [showRegisterModal]);

  // Filtrar ciudades cuando cambia el departamento
  useEffect(() => {
    if (clienteData.departamento) {
      const filtered = ciudades.filter(
        (c) => {
          // El departamento puede venir como objeto {id, nombre} o como ID
          const depId = typeof c.departamento === 'object' 
            ? c.departamento.id 
            : c.departamento;
          return depId === parseInt(clienteData.departamento);
        }
      );
      setCiudadesFiltradas(filtered);
      console.log('Ciudades filtradas:', filtered); // Debug
    } else {
      setCiudadesFiltradas([]);
    }
  }, [clienteData.departamento, ciudades]);

  // Si el modal no está visible, no renderizar nada
  if (!showRegisterModal) return null;

  /**
   * Cargar departamentos desde el backend
   */
  const cargarDepartamentos = async () => {
    try {
      const data = await getAllDepartamentos();
      setDepartamentos(data);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
      setError('Error al cargar los departamentos');
    }
  };

  /**
   * Cargar ciudades desde el backend
   */
  const cargarCiudades = async () => {
    try {
      const data = await getAllCiudades();
      console.log('Ciudades cargadas:', data); // Debug
      setCiudades(data);
    } catch (error) {
      console.error('Error al cargar ciudades:', error);
      setError('Error al cargar las ciudades');
    }
  };

  /**
   * Manejar cambios en los inputs del usuario (Paso 1)
   */
  const handleUserChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  /**
   * Manejar cambios en los inputs del cliente (Paso 2)
   */
  const handleClienteChange = (e) => {
    setClienteData({
      ...clienteData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  /**
   * Validar y pasar al Paso 2
   */
  const handleSiguiente = (e) => {
    e.preventDefault();
    setError('');

    // Validaciones Paso 1
    if (!userData.username || !userData.email || !userData.password || !userData.password_confirm) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (userData.password !== userData.password_confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (userData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Pasar al siguiente paso
    setStep(2);
  };

  /**
   * Volver al Paso 1
   */
  const handleVolver = () => {
    setStep(1);
    setError('');
  };

  /**
   * Enviar registro completo (usuario + cliente)
   */
  const handleRegistrarSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones Paso 2
    if (!clienteData.nombre || !clienteData.nit_ci || !clienteData.telefono) {
      setError('Nombre completo, NIT/CI y Teléfono son obligatorios');
      return;
    }

    if (!clienteData.ciudad) {
      setError('Debes seleccionar una ciudad');
      return;
    }

    setLoading(true);

    try {
      // 1. Registrar usuario
      const result = await register(userData);

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // 2. Crear cliente asociado
      await createCliente({
        nombre: clienteData.nombre,
        nit_ci: clienteData.nit_ci,
        telefono: clienteData.telefono,
        razon_social: clienteData.razon_social,
        sexo: clienteData.sexo || null,
        estado: clienteData.estado,
        ciudad_id: parseInt(clienteData.ciudad),
      });

      // Registro exitoso, cerrar modal
      handleClose();
    } catch (error) {
      console.error('Error en el registro:', error);
      setError(error.message || 'Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar modal y resetear datos
   */
  const handleClose = () => {
    closeRegisterModal();
    setStep(1);
    setError('');
    setUserData({
      username: '',
      email: '',
      password: '',
      password_confirm: '',
    });
    setClienteData({
      nombre: '',
      nit_ci: '',
      telefono: '',
      razon_social: 'natural',
      sexo: '',
      estado: 'activo',
      ciudad: '',
      departamento: '',
    });
  };

  /**
   * Cambiar a modal de login
   */
  const handleOpenLogin = () => {
    closeRegisterModal();
    openLoginModal();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content register-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          &times;
        </button>

        <h2>
          {step === 1 ? 'Registrarse' : 'Completar Datos del Cliente'}
        </h2>

        {/* Indicador de pasos */}
        <div className="steps-indicator">
          <div className={`step ${step === 1 ? 'active' : 'completed'}`}>
            <span className="step-number">1</span>
            <span className="step-label">Cuenta</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step === 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Datos</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* PASO 1: Datos de Usuario */}
        {step === 1 && (
          <form onSubmit={handleSiguiente}>
            <div className="form-group">
              <label htmlFor="username">Usuario *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleUserChange}
                required
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleUserChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleUserChange}
                required
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_confirm">Confirmar Contraseña *</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={userData.password_confirm}
                onChange={handleUserChange}
                required
                placeholder="Repite tu contraseña"
              />
            </div>

            <button type="submit" className="btn-submit">
              Siguiente
            </button>
          </form>
        )}

        {/* PASO 2: Datos del Cliente */}
        {step === 2 && (
          <form onSubmit={handleRegistrarSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={clienteData.nombre}
                  onChange={handleClienteChange}
                  required
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nit_ci">NIT/CI *</label>
                <input
                  type="text"
                  id="nit_ci"
                  name="nit_ci"
                  value={clienteData.nit_ci}
                  onChange={handleClienteChange}
                  required
                  placeholder="Ej: 1234567"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={clienteData.telefono}
                  onChange={handleClienteChange}
                  required
                  placeholder="Ej: 71234567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="razon_social">Razón Social *</label>
                <select
                  id="razon_social"
                  name="razon_social"
                  value={clienteData.razon_social}
                  onChange={handleClienteChange}
                  required
                >
                  <option value="natural">Persona Natural</option>
                  <option value="juridica">Persona Jurídica</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={clienteData.sexo}
                  onChange={handleClienteChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado *</label>
                <select
                  id="estado"
                  name="estado"
                  value={clienteData.estado}
                  onChange={handleClienteChange}
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departamento">Departamento *</label>
                <select
                  id="departamento"
                  name="departamento"
                  value={clienteData.departamento}
                  onChange={handleClienteChange}
                  required
                >
                  <option value="">Seleccionar departamento...</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">Ciudad *</label>
                <select
                  id="ciudad"
                  name="ciudad"
                  value={clienteData.ciudad}
                  onChange={handleClienteChange}
                  required
                  disabled={!clienteData.departamento}
                >
                  <option value="">
                    {clienteData.departamento
                      ? 'Seleccionar ciudad...'
                      : 'Primero seleccione un departamento'}
                  </option>
                  {ciudadesFiltradas.map((ciudad) => (
                    <option key={ciudad.id} value={ciudad.id}>
                      {ciudad.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={handleVolver}
                className="btn-secondary"
              >
                Volver
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>
        )}

        {/* Link para volver a login */}
        <div className="toggle-mode">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button onClick={handleOpenLogin} className="link-button">
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
