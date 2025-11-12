import React from 'react';
import UsuarioList from './UsuarioList';

const UsuarioPage = () => {
  return (
    /* No necesitamos clases extra aquí porque:
      1. AdminLayout ya da padding (p-8).
      2. RolList ya tiene su propio estilo de tarjeta (bg-white, shadow, etc.).
    */
    <UsuarioList />
  );
};

export default UsuarioPage;