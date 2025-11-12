import React from 'react';
import {BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/dashboard/DashboardPage.jsx';
import AdminLayout from '../layout/AdminLayout.jsx';
import EcommerceLayout from '../layout/EcommerceLayout.jsx';
import RolPage from '../pages/rol/RolPage.jsx';
import RolForm from '../pages/rol/RolForm.jsx';
import RolDetail from '../pages/rol/RolDetail.jsx';
import HomePage from '../pages/home/HomePage.jsx';
import UsuarioPage from '../pages/usuario/UsuarioPage.jsx';
import UsuarioForm from '../pages/usuario/UsuarioForm.jsx';
import UsuarioDetail from '../pages/usuario/UsuarioDetail.jsx';
import BitacoraPage from '../pages/bitacora/BitacoraPage.jsx';
import ClientePage from '../pages/cliente/ClientePage.jsx';
import ClienteForm from '../pages/cliente/ClienteForm.jsx';
import ClienteDetail from '../pages/cliente/ClienteDetail.jsx';
import ProductoList from '../pages/producto/ProductoList.jsx';
import ProductoForm from '../pages/producto/ProductoForm.jsx';
import ProductoDetail from '../pages/producto/ProductoDetail.jsx';
import CatalogoList from '../pages/catalogo/CatalogoList.jsx';
import CatalogoForm from '../pages/catalogo/CatalogoForm.jsx';
import CatalogoDetail from '../pages/catalogo/CatalogoDetail.jsx';
import ProductoCatalogo from '../pages/ecommerce/ProductoCatalogo.jsx';
import ProductoDetalle from '../pages/ecommerce/ProductoDetalle.jsx';
import { VentaList, VentaDetail, VentaForm } from '../pages/venta';
import { PagoCheckout, PagosList } from '../pages/pagos';
import MisPagos from '../pages/pagos/MisPagos.jsx';
import MiVentaDetail from '../pages/venta/MiVentaDetail.jsx';
import MiPerfil from '../pages/cliente/MiPerfil.jsx';
import EditarPerfil from '../pages/cliente/EditarPerfil.jsx';
import CambiarContrasena from '../pages/cliente/CambiarContrasena.jsx';

const AppRouter = () =>{
    return(
        <BrowserRouter>
            <Routes>
                {/* --- ZONA PÚBLICA (TIENDA) --- */}
                <Route element={<EcommerceLayout />}>
                    <Route path="/" element={<ProductoCatalogo />}/>
                    <Route path="/catalogo" element={<ProductoCatalogo />} />
                    <Route path="/producto/:id" element={<ProductoDetalle />} />
                    <Route path="/checkout/pago/:ventaId" element={<PagoCheckout isEcommerce={true} />} />
                    <Route path="/mis-pagos" element={<MisPagos />} />
                    <Route path="/mis-ventas/:id" element={<MiVentaDetail />} />
                    <Route path="/mi-perfil" element={<MiPerfil />} />
                    <Route path="/editar-perfil" element={<EditarPerfil />} />
                    <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
                </Route>
                {/* --- ZONA PRIVADA (ADMIN) --- */}
                <Route element={<AdminLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/roles" element={<RolPage />} />
                    <Route path="/roles/create" element={<RolForm />} />
                    <Route path="/roles/edit/:id" element={<RolForm />} />
                    <Route path="/roles/detail/:id" element={<RolDetail />} />
                    <Route path="/usuarios" element={<UsuarioPage/>} />
                    <Route path="/usuarios/create" element={<UsuarioForm />} />
                    <Route path="/usuarios/edit/:id" element={<UsuarioForm />} />
                    <Route path="/usuarios/detail/:id" element={<UsuarioDetail />} />
                    <Route path="/clientes" element={<ClientePage/>} />
                    <Route path="/clientes/create" element={<ClienteForm />} />
                    <Route path="/clientes/edit/:id" element={<ClienteForm />} />
                    <Route path="/clientes/detail/:id" element={<ClienteDetail />} />
                    <Route path="/productos" element={<ProductoList/>} />
                    <Route path="/productos/create" element={<ProductoForm />} />
                    <Route path="/productos/edit/:id" element={<ProductoForm />} />
                    <Route path="/productos/detail/:id" element={<ProductoDetail />} />
                    <Route path="/catalogos" element={<CatalogoList/>} />
                    <Route path="/catalogos/create" element={<CatalogoForm />} />
                    <Route path="/catalogos/edit/:id" element={<CatalogoForm />} />
                    <Route path="/catalogos/detail/:id" element={<CatalogoDetail />} />
                    <Route path="/dashboard/ventas" element={<VentaList/>} />
                    <Route path="/dashboard/ventas/crear" element={<VentaForm />} />
                    <Route path="/dashboard/ventas/:id" element={<VentaDetail />} />
                    <Route path="/dashboard/ventas/pagar/:ventaId" element={<PagoCheckout />} />
                    <Route path="/dashboard/pagos" element={<PagosList />} />
                    <Route path="/bitacora" element={<BitacoraPage/>} />
                </Route>
                {/* Redirección por defecto si la ruta no existe (opcional) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    ); 
};  
export default AppRouter;