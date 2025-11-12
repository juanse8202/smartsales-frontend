import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCliente } from '../../api/ClienteApi';
import { FaUser, FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DetailView from '../../components/DetailView';

const ClienteDetail = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClienteDetail();
  }, [id]);

  const loadClienteDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getCliente(id);
      setCliente(data);
    } catch (err) {
      console.error('Error al cargar detalles del cliente:', err);
      setError('Error al cargar los detalles del cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSexoLabel = (sexo) => {
    if (sexo === 'M') return 'Masculino';
    if (sexo === 'F') return 'Femenino';
    return 'N/A';
  };

  const getRazonSocialLabel = (razon) => {
    if (razon === 'natural') return 'Persona Natural';
    if (razon === 'juridica') return 'Persona Jurídica';
    return razon;
  };

  if (!cliente && !isLoading && !error) {
    return (
      <DetailView
        title="Cliente no encontrado"
        backRoute="/clientes"
        error="No se encontró el cliente"
        isLoading={false}
      />
    );
  }

  const fields = cliente ? [
    { label: 'ID', value: cliente.id },
    { label: 'Nombre', value: cliente.nombre },
    { label: 'NIT/CI', value: cliente.nit_ci || 'N/A' },
    { label: 'Teléfono', value: cliente.telefono || 'N/A' },
    { 
      label: 'Ciudad', 
      value: (
        <>
          {cliente.ciudad?.nombre || 'N/A'}
          {cliente.ciudad?.departamento && (
            <span className="text-gray-600 text-sm ml-2">
              ({cliente.ciudad.departamento.nombre})
            </span>
          )}
        </>
      )
    },
    { label: 'Razón Social', value: getRazonSocialLabel(cliente.razon_social) },
    ...(cliente.razon_social === 'natural' ? [
      { label: 'Sexo', value: getSexoLabel(cliente.sexo) }
    ] : []),
    { 
      label: 'Estado', 
      value: (
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          cliente.estado === 'activo' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    { 
      label: (
        <>
          <FaCalendar className="inline mr-2" />
          Fecha Registro
        </>
      ), 
      value: formatDate(cliente.fecha_registro) 
    }
  ] : [];

  const badge = cliente && (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
      cliente.estado === 'activo' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {cliente.estado === 'activo' ? (
        <><FaCheckCircle className="inline mr-1" /> Activo</>
      ) : (
        <><FaTimesCircle className="inline mr-1" /> Inactivo</>
      )}
    </span>
  );

  return (
    <DetailView
      title={cliente?.nombre || 'Cliente'}
      icon={<FaUser />}
      backRoute="/clientes"
      editRoute={`/clientes/edit/${id}`}
      fields={fields}
      badge={badge}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default ClienteDetail;
