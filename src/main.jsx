import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './routers/AppRouter.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import LoginModal from './components/auth/LoginModal.jsx'
import RegisterModal from './components/auth/RegisterModal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <AppRouter />
        <LoginModal />
        <RegisterModal />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
