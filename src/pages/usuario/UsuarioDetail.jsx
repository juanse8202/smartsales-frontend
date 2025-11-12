import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUsuario } from '../../api/UsuarioApi';
import { FaUser } from 'react-icons/fa';
import DetailView from '../../components/DetailView';

const UsuarioDetail = () => {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsuarioDetail();
  }, [id]);

  const loadUsuarioDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getUsuario(id);
      setUsuario(data);
    } catch (err) {
      console.error('Error al cargar detalles del usuario:', err);
      setError('Error al cargar los detalles del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!usuario && !isLoading && !error) {
    return (
      <DetailView
        title="Usuario no encontrado"
        backRoute="/usuarios"
        error="No se encontró el usuario"
        isLoading={false}
      />
    );
  }

  const fields = usuario ? [
    { label: 'ID', value: usuario.id },
    { label: 'Nombre de Usuario', value: usuario.username },
    { label: 'Correo Electrónico', value: usuario.email },
    { 
      label: 'Rol', 
      value: (
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          usuario.role 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {usuario.role || 'Sin rol'}
        </span>
      )
    }
  ] : [];

  return (
    <DetailView
      title={usuario?.username || 'Usuario'}
      icon={<FaUser />}
      backRoute="/usuarios"
      editRoute={`/usuarios/edit/${id}`}
      fields={fields}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default UsuarioDetail;
