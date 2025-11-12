import React from 'react';
import ClienteList from './ClienteList';

const ClientePage = () => {
  return (
    /* No necesitamos clases extra aquí porque:
      1. AdminLayout ya da padding (p-8).
      2. RolList ya tiene su propio estilo de tarjeta (bg-white, shadow, etc.).
    */
    <ClienteList />
  );
};

export default ClientePage;