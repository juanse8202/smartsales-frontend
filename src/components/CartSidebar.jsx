import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaShoppingCart, FaTrash, FaMinus, FaPlus, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { checkoutCart } from '../api/CartApi';

const CartSidebar = ({ isOpen, onClose }) => {
    const { cart, updateQuantity, removeItem, getItemCount, getTotalPrice, loading, loadCart } = useCart();
    const { user, isAuthenticated, openLoginModal } = useAuth();
    const navigate = useNavigate();
    
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    const handleCheckout = async () => {
        // Validar que el usuario esté autenticado
        if (!isAuthenticated || !user) {
            setCheckoutError('Debes iniciar sesión para realizar la compra');
            onClose();
            openLoginModal();
            return;
        }

        // Validar que el usuario tenga un cliente_id
        if (!user.cliente_id) {
            setCheckoutError('Error: No se encontró información de cliente. Por favor contacte al soporte.');
            return;
        }

        // Validar que el carrito tenga items
        if (!cart || !cart.items || cart.items.length === 0) {
            setCheckoutError('El carrito está vacío. Por favor agregue productos antes de continuar.');
            return;
        }

        try {
            setCheckoutLoading(true);
            setCheckoutError('');
            
            console.log('DEBUG - Carrito antes del checkout:', {
                items: cart.items.length,
                total: cart.total_price,
                cliente_id: user.cliente_id,
                username: user.username,
                items_detail: cart.items.map(i => ({ id: i.id, nombre: i.catalogo.nombre, qty: i.quantity }))
            });
            
            // Crear venta desde el carrito usando el cliente_id del usuario autenticado
            const venta = await checkoutCart({
                cliente_id: user.cliente_id,
                direccion: 'Dirección a confirmar',
                impuesto: 0,
                descuento: 0,
                costo_envio: 100 // Costo de envío por defecto
            });
            
            // NO recargar el carrito aquí - se vaciará cuando el pago sea exitoso
            // Esto permite que el usuario vuelva si cancela el pago
            
            // Cerrar sidebar
            onClose();
            
            // Redirigir a la página de pago con el ID de la venta creada
            navigate(`/checkout/pago/${venta.id}`);
            
        } catch (error) {
            console.error('Error en checkout:', error);
            console.error('Error response:', error.response?.data);
            
            let errorMessage = 'Error al procesar el checkout. Por favor intente nuevamente.';
            
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setCheckoutError(errorMessage);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleQuantityChange = async (itemId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity > 0) {
            await updateQuantity(itemId, newQuantity);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (window.confirm('¿Estás seguro de eliminar este producto del carrito?')) {
            await removeItem(itemId);
        }
    };

    return (
        <>
            {/* Overlay - Transparente para permitir clic fuera pero sin oscurecer */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FaShoppingCart className="mr-2 text-blue-600" />
                            Mi Carrito ({getItemCount()})
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                Cargando carrito...
                            </div>
                        ) : !cart || !cart.items || cart.items.length === 0 ? (
                            <div className="text-center py-12">
                                <FaShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg mb-2">Tu carrito está vacío</p>
                                <p className="text-gray-400 text-sm">
                                    Agrega productos para comenzar tu compra
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-gray-50 rounded-lg p-3 flex gap-3"
                                    >
                                        {/* Imagen */}
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.catalogo.imagen_url ? (
                                                <img
                                                    src={item.catalogo.imagen_url}
                                                    alt={item.catalogo.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FaShoppingCart className="text-gray-400" size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                                                {item.catalogo.nombre}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {item.catalogo.marca?.nombre}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-green-600">
                                                    Bs. {parseFloat(item.catalogo.precio).toFixed(2)}
                                                </p>
                                                
                                                {/* Controles de cantidad */}
                                                <div className="flex items-center border border-gray-300 rounded">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                        className="p-1 hover:bg-gray-200 transition-colors"
                                                        disabled={loading}
                                                    >
                                                        <FaMinus size={10} className="text-gray-600" />
                                                    </button>
                                                    <span className="px-3 text-sm font-semibold text-gray-800">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                        className="p-1 hover:bg-gray-200 transition-colors"
                                                        disabled={loading}
                                                    >
                                                        <FaPlus size={10} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Subtotal y eliminar */}
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-sm text-gray-600">
                                                    Subtotal: <span className="font-semibold">Bs. {parseFloat(item.subtotal).toFixed(2)}</span>
                                                </p>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    disabled={loading}
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart && cart.items && cart.items.length > 0 && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            {/* Total */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-semibold text-gray-800">Total:</span>
                                <span className="text-2xl font-bold text-green-600">
                                    Bs. {parseFloat(getTotalPrice()).toFixed(2)}
                                </span>
                            </div>

                            {/* Error de checkout */}
                            {checkoutError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-2">
                                    {checkoutError}
                                </div>
                            )}

                            {/* Botones */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    disabled={loading || checkoutLoading}
                                >
                                    {checkoutLoading ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Procesando...
                                        </>
                                    ) : (
                                        'Proceder al pago'
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Seguir comprando
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
