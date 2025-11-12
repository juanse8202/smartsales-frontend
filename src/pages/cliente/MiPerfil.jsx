/**
 * Página para ver el perfil del cliente
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const MiPerfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clienteData, setClienteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClienteData();
  }, []);

  const loadClienteData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}administracion/mi-cliente/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos del cliente');
      }

      const data = await response.json();
      setClienteData(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar tu perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Información de tu cuenta</p>
        </div>

        {/* Perfil Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-teal-600 shadow-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{clienteData?.nombre}</h2>
                <p className="text-teal-100">@{user?.username}</p>
              </div>
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="border-b border-gray-200 pb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <FaUser className="text-gray-400" />
                  Nombre completo
                </label>
                <p className="text-gray-900 font-medium">{clienteData?.nombre || 'No especificado'}</p>
              </div>

              {/* Email */}
              <div className="border-b border-gray-200 pb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <FaEnvelope className="text-gray-400" />
                  Correo electrónico
                </label>
                <p className="text-gray-900 font-medium">{clienteData?.email || user?.email || 'No especificado'}</p>
              </div>

              {/* Teléfono */}
              <div className="border-b border-gray-200 pb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <FaPhone className="text-gray-400" />
                  Teléfono
                </label>
                <p className="text-gray-900 font-medium">{clienteData?.telefono || 'No especificado'}</p>
              </div>

              {/* Dirección */}
              <div className="border-b border-gray-200 pb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  Dirección
                </label>
                <p className="text-gray-900 font-medium">{clienteData?.direccion || 'No especificada'}</p>
              </div>

              {/* NIT */}
              <div className="border-b border-gray-200 pb-4">
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  NIT
                </label>
                <p className="text-gray-900 font-medium">{clienteData?.nit || 'No especificado'}</p>
              </div>

              {/* Cuenta desde */}
              <div className="border-b border-gray-200 pb-4">
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Miembro desde
                </label>
                <p className="text-gray-900 font-medium">
                  {clienteData?.fecha_registro 
                    ? new Date(clienteData.fecha_registro).toLocaleDateString('es-BO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>

            {/* Botón de editar */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/editar-perfil')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FaEdit />
                <span>Editar perfil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
