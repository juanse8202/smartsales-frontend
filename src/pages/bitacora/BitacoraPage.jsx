import React from 'react';
import BitacoraList from './BitacoraList';

const BitacoraPage = () => {
  return (
    /* No necesitamos clases extra aquí porque:
      1. AdminLayout ya da padding (p-8).
      2. RolList ya tiene su propio estilo de tarjeta (bg-white, shadow, etc.).
    */
    <BitacoraList />
  );
};

export default BitacoraPage;