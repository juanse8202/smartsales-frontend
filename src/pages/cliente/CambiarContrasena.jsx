/**
 * Página para cambiar la contraseña del usuario
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaSave, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const CambiarContrasena = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar contraseña en tiempo real
    if (name === 'new_password') {
      setValidations({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        match: value === formData.confirm_password && value !== ''
      });
    }

    if (name === 'confirm_password') {
      setValidations(prev => ({
        ...prev,
        match: value === formData.new_password && value !== ''
      }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (formData.new_password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}administracion/cambiar-contrasena/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      setSuccess('Contraseña cambiada exitosamente');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/mi-perfil');
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/mi-perfil')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Cambiar Contraseña</h1>
          <p className="text-gray-600 mt-2">Actualiza tu contraseña de acceso</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 flex items-center gap-2">
              <FaCheckCircle />
              {success}
            </p>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Contraseña actual */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaLock className="text-gray-400" />
                Contraseña actual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaLock className="text-gray-400" />
                Nueva contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Requisitos de contraseña */}
              {formData.new_password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
                  <ul className="space-y-1 text-xs">
                    <li className={`flex items-center gap-2 ${validations.length ? 'text-green-600' : 'text-gray-500'}`}>
                      {validations.length ? '✓' : '○'} Al menos 8 caracteres
                    </li>
                    <li className={`flex items-center gap-2 ${validations.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {validations.uppercase ? '✓' : '○'} Al menos una mayúscula
                    </li>
                    <li className={`flex items-center gap-2 ${validations.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {validations.lowercase ? '✓' : '○'} Al menos una minúscula
                    </li>
                    <li className={`flex items-center gap-2 ${validations.number ? 'text-green-600' : 'text-gray-500'}`}>
                      {validations.number ? '✓' : '○'} Al menos un número
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaLock className="text-gray-400" />
                Confirmar nueva contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formData.confirm_password && (
                <p className={`mt-2 text-xs ${validations.match ? 'text-green-600' : 'text-red-600'}`}>
                  {validations.match ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || !validations.length || !validations.match}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaSave />
                <span>{saving ? 'Guardando...' : 'Cambiar contraseña'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/mi-perfil')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Consejos de seguridad */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos de seguridad:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Usa una contraseña única que no uses en otros sitios</li>
            <li>• Combina letras, números y símbolos</li>
            <li>• No compartas tu contraseña con nadie</li>
            <li>• Cambia tu contraseña periódicamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CambiarContrasena;
