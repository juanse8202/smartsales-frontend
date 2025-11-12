/**
 * VentaForm - Formulario para crear una nueva venta
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVenta } from '../../api/VentaApi';
import { getAllClientes } from '../../api/ClienteApi';
import { getAllCatalogo } from '../../api/CatalogoApi';

const VentaForm = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [venta, setVenta] = useState({
    cliente_id: '',
    direccion: '',
    subtotal: 0,
    impuesto: 0,
    descuento: 0,
    costo_envio: 0,
    estado: 'pendiente',
    detalles: []
  });

  const [nuevoDetalle, setNuevoDetalle] = useState({
    catalogo_id: '',
    cantidad: 1,
    precio_unitario: 0,
    descuento: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientesData, productosData] = await Promise.all([
        getAllClientes(),
        getAllCatalogo()
      ]);
      setClientes(clientesData.filter(c => c.estado));
      setProductos(productosData.filter(p => p.estado));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const handleProductoSelect = (e) => {
    const productoId = e.target.value;
    const producto = productos.find(p => p.id === parseInt(productoId));
    
    if (producto) {
      setNuevoDetalle({
        ...nuevoDetalle,
        catalogo_id: productoId,
        precio_unitario: producto.precio
      });
    }
  };

  const agregarDetalle = () => {
    if (!nuevoDetalle.catalogo_id || nuevoDetalle.cantidad < 1) {
      alert('Seleccione un producto y una cantidad válida');
      return;
    }

    // Verificar que no esté duplicado
    if (venta.detalles.some(d => d.catalogo_id === nuevoDetalle.catalogo_id)) {
      alert('Este producto ya está agregado');
      return;
    }

    const producto = productos.find(p => p.id === parseInt(nuevoDetalle.catalogo_id));
    const detalleConNombre = {
      ...nuevoDetalle,
      nombre_producto: producto.nombre
    };

    setVenta({
      ...venta,
      detalles: [...venta.detalles, detalleConNombre]
    });

    // Resetear formulario de detalle
    setNuevoDetalle({
      catalogo_id: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0
    });

    // Recalcular totales
    calcularTotales([...venta.detalles, detalleConNombre]);
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = venta.detalles.filter((_, i) => i !== index);
    setVenta({
      ...venta,
      detalles: nuevosDetalles
    });
    calcularTotales(nuevosDetalles);
  };

  const calcularTotales = (detalles) => {
    const subtotal = detalles.reduce((sum, d) => {
      const subtotalDetalle = d.precio_unitario * d.cantidad - d.descuento;
      return sum + subtotalDetalle;
    }, 0);

    setVenta(prev => ({
      ...prev,
      subtotal: subtotal,
      detalles: detalles
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (venta.detalles.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    if (!venta.cliente_id) {
      alert('Debe seleccionar un cliente');
      return;
    }

    try {
      // Preparar datos para el backend
      const ventaData = {
        cliente_id: parseInt(venta.cliente_id),
        direccion: venta.direccion,
        subtotal: venta.subtotal.toString(),
        impuesto: venta.impuesto.toString(),
        descuento: venta.descuento.toString(),
        costo_envio: venta.costo_envio.toString(),
        estado: venta.estado,
        detalles: venta.detalles.map(d => ({
          catalogo_id: parseInt(d.catalogo_id),
          cantidad: parseInt(d.cantidad),
          precio_unitario: d.precio_unitario.toString(),
          descuento: d.descuento.toString()
        }))
      };

      await createVenta(ventaData);
      alert('Venta creada exitosamente');
      navigate('/dashboard/ventas');
    } catch (error) {
      console.error('Error al crear venta:', error);
      alert('Error al crear la venta: ' + (error.response?.data?.detail || error.message));
    }
  };

  const calcularTotal = () => {
    return venta.subtotal + venta.impuesto + venta.costo_envio - venta.descuento;
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

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <button className="btn btn-secondary mb-3" onClick={() => navigate('/dashboard/ventas')}>
            <i className="bi bi-arrow-left"></i> Volver
          </button>
          <h2>Nueva Venta</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Información del Cliente */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Información del Cliente</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Cliente *</label>
                  <select
                    className="form-select"
                    value={venta.cliente_id}
                    onChange={(e) => setVenta({...venta, cliente_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.nit_ci}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Dirección de Entrega *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={venta.direccion}
                    onChange={(e) => setVenta({...venta, direccion: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={venta.estado}
                    onChange={(e) => setVenta({...venta, estado: e.target.value})}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">Información Financiera</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Subtotal</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={venta.subtotal}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Impuesto (13%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={venta.impuesto}
                    onChange={(e) => setVenta({...venta, impuesto: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descuento</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={venta.descuento}
                    onChange={(e) => setVenta({...venta, descuento: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Costo de Envío</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={venta.costo_envio}
                    onChange={(e) => setVenta({...venta, costo_envio: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong className="fs-4">Bs. {calcularTotal().toFixed(2)}</strong>
                </div>
                <button
                  type="button"
                  className="btn btn-info w-100 mt-2"
                  onClick={() => {
                    const impuesto = venta.subtotal * 0.13;
                    setVenta({...venta, impuesto: impuesto});
                  }}
                >
                  Calcular Impuesto (13%)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Agregar Productos */}
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Agregar Productos</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label">Producto</label>
                    <select
                      className="form-select"
                      value={nuevoDetalle.catalogo_id}
                      onChange={handleProductoSelect}
                    >
                      <option value="">Seleccione un producto</option>
                      {productos.map(producto => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre} - Bs. {producto.precio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={nuevoDetalle.cantidad}
                      onChange={(e) => setNuevoDetalle({...nuevoDetalle, cantidad: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Precio Unit.</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={nuevoDetalle.precio_unitario}
                      onChange={(e) => setNuevoDetalle({...nuevoDetalle, precio_unitario: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Descuento</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={nuevoDetalle.descuento}
                      onChange={(e) => setNuevoDetalle({...nuevoDetalle, descuento: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">&nbsp;</label>
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={agregarDetalle}
                    >
                      <i className="bi bi-plus-circle"></i> Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">Productos Agregados ({venta.detalles.length})</h5>
              </div>
              <div className="card-body">
                {venta.detalles.length === 0 ? (
                  <p className="text-muted">No hay productos agregados</p>
                ) : (
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio Unit.</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Descuento</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venta.detalles.map((detalle, index) => {
                        const subtotal = detalle.precio_unitario * detalle.cantidad;
                        const total = subtotal - detalle.descuento;
                        return (
                          <tr key={index}>
                            <td>{detalle.nombre_producto}</td>
                            <td>Bs. {detalle.precio_unitario.toFixed(2)}</td>
                            <td>{detalle.cantidad}</td>
                            <td>Bs. {subtotal.toFixed(2)}</td>
                            <td className="text-danger">- Bs. {detalle.descuento.toFixed(2)}</td>
                            <td><strong>Bs. {total.toFixed(2)}</strong></td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => eliminarDetalle(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-end gap-2">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard/ventas')}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={venta.detalles.length === 0}
              >
                <i className="bi bi-save"></i> Crear Venta
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VentaForm;
