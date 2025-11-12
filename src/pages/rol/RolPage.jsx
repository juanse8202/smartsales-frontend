import React from 'react';
import RolList from './RolList';

const RolPage = () => {
  return (
    /* No necesitamos clases extra aquí porque:
      1. AdminLayout ya da padding (p-8).
      2. RolList ya tiene su propio estilo de tarjeta (bg-white, shadow, etc.).
    */
    <RolList />
  );
};

export default RolPage;