/**
 * VentaDetail - Ver detalle completo de una venta con sus items y pagos
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVentaById, cambiarEstadoVenta } from '../../api/VentaApi';
import { getPagosByVenta, createPago } from '../../api/PagoApi';
import BotonPagarVenta from '../../components/pagos/BotonPagarVenta';

const VentaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [nuevoPago, setNuevoPago] = useState({
    monto: '',
    moneda: 'BOB',
    proveedor: '',
    transaccion_id: '',
    estado: 'completado'
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ventaData, pagosData] = await Promise.all([
        getVentaById(id),
        getPagosByVenta(id)
      ]);
      setVenta(ventaData);
      setPagos(pagosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    try {
      await cambiarEstadoVenta(id, nuevoEstado);
      alert('Estado actualizado correctamente');
      loadData();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    try {
      await createPago({
        venta_id: parseInt(id),
        ...nuevoPago,
        monto: parseFloat(nuevoPago.monto)
      });
      alert('Pago registrado correctamente');
      setShowPagoModal(false);
      setNuevoPago({
        monto: '',
        moneda: 'BOB',
        proveedor: '',
        transaccion_id: '',
        estado: 'completado'
      });
      loadData();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!venta) {
    return <div className="alert alert-danger">Venta no encontrada</div>;
  }

  const totalPagado = pagos
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + parseFloat(p.monto), 0);

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <button className="btn btn-secondary mb-3" onClick={() => navigate('/dashboard/ventas')}>
            <i className="bi bi-arrow-left"></i> Volver
          </button>
          <h2>Detalle de Venta #{venta.id}</h2>
        </div>
      </div>

      {/* Información de la Venta */}
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Información General</h5>
            </div>
            <div className="card-body">
              <p><strong>Cliente:</strong> {venta.cliente.nombre}</p>
              <p><strong>NIT/CI:</strong> {venta.cliente.nit_ci}</p>
              <p><strong>Teléfono:</strong> {venta.cliente.telefono}</p>
              <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString('es-BO')}</p>
              <p><strong>Dirección de Entrega:</strong> {venta.direccion}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <span className={`badge ${
                  venta.estado === 'completada' ? 'bg-success' : 
                  venta.estado === 'pendiente' ? 'bg-warning' : 'bg-danger'
                }`}>
                  {venta.estado.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Resumen Financiero</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>Bs. {parseFloat(venta.subtotal).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Impuesto:</span>
                <span>Bs. {parseFloat(venta.impuesto).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Descuento:</span>
                <span className="text-danger">- Bs. {parseFloat(venta.descuento).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Costo de Envío:</span>
                <span>Bs. {parseFloat(venta.costo_envio).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="fs-4">Bs. {parseFloat(venta.total).toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-success">Total Pagado:</span>
                <span className="text-success">Bs. {totalPagado.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-danger">Saldo Pendiente:</span>
                <span className="text-danger">
                  Bs. {(parseFloat(venta.total) - totalPagado).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="btn-group" role="group">
            <button 
              className="btn btn-warning"
              onClick={() => handleCambiarEstado('pendiente')}
              disabled={venta.estado === 'pendiente'}
            >
              Marcar como Pendiente
            </button>
            <button 
              className="btn btn-success"
              onClick={() => handleCambiarEstado('completada')}
              disabled={venta.estado === 'completada'}
            >
              Marcar como Completada
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleCambiarEstado('cancelada')}
              disabled={venta.estado === 'cancelada'}
            >
              Cancelar Venta
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowPagoModal(true)}
            >
              <i className="bi bi-cash"></i> Registrar Pago
            </button>
          </div>
          
          {/* Botón de Pago con Stripe */}
          <div className="mt-3">
            <BotonPagarVenta 
              ventaId={venta.id}
              ventaTotal={venta.total}
              ventaEstado={venta.estado}
            />
          </div>
        </div>
      </div>

      {/* Detalles de Productos */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Productos</h5>
            </div>
            <div className="card-body">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unit.</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Descuento</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.detalles.map((detalle) => (
                    <tr key={detalle.id}>
                      <td>{detalle.catalogo.nombre}</td>
                      <td>Bs. {parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                      <td>{detalle.cantidad}</td>
                      <td>Bs. {parseFloat(detalle.subtotal).toFixed(2)}</td>
                      <td className="text-danger">- Bs. {parseFloat(detalle.descuento).toFixed(2)}</td>
                      <td><strong>Bs. {parseFloat(detalle.total).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Historial de Pagos</h5>
            </div>
            <div className="card-body">
              {pagos.length === 0 ? (
                <p className="text-muted">No hay pagos registrados</p>
              ) : (
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Moneda</th>
                      <th>Proveedor</th>
                      <th>Transacción ID</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map((pago) => (
                      <tr key={pago.id}>
                        <td>{new Date(pago.fecha_pago).toLocaleString('es-BO')}</td>
                        <td>Bs. {parseFloat(pago.monto).toFixed(2)}</td>
                        <td>{pago.moneda}</td>
                        <td>{pago.proveedor}</td>
                        <td><code>{pago.transaccion_id}</code></td>
                        <td>
                          <span className={`badge ${
                            pago.estado === 'completado' ? 'bg-success' : 
                            pago.estado === 'pendiente' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {pago.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Registro de Pago */}
      {showPagoModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Pago</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPagoModal(false)}
                ></button>
              </div>
              <form onSubmit={handleRegistrarPago}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Monto</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={nuevoPago.monto}
                      onChange={(e) => setNuevoPago({...nuevoPago, monto: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Moneda</label>
                    <select
                      className="form-select"
                      value={nuevoPago.moneda}
                      onChange={(e) => setNuevoPago({...nuevoPago, moneda: e.target.value})}
                    >
                      <option value="BOB">Bolivianos (BOB)</option>
                      <option value="USD">Dólares (USD)</option>
                      <option value="EUR">Euros (EUR)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Proveedor de Pago</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Stripe, PayPal, Transferencia"
                      value={nuevoPago.proveedor}
                      onChange={(e) => setNuevoPago({...nuevoPago, proveedor: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ID de Transacción</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ID único de la transacción"
                      value={nuevoPago.transaccion_id}
                      onChange={(e) => setNuevoPago({...nuevoPago, transaccion_id: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      value={nuevoPago.estado}
                      onChange={(e) => setNuevoPago({...nuevoPago, estado: e.target.value})}
                    >
                      <option value="completado">Completado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="fallido">Fallido</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowPagoModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Registrar Pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentaDetail;
