import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, urlArchivo } from '../lib/api';
import { CERRADOS, ETIQUETAS, TRANSICIONES } from '../lib/constants';
import { formatearFecha, formatearMoneda, piezasDe, totalPresupuesto } from '../lib/format';
import BudgetPanel from './BudgetPanel';
import MensajeError from './MensajeError';
import StatusBadge from './StatusBadge';

export default function OrderDetail() {
  const { orden, recargar } = useOutletContext();
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const piezas = piezasDe(orden.piezas);
  const total = totalPresupuesto(orden);
  const cerrada = CERRADOS.includes(orden.estado);
  const transiciones = (TRANSICIONES[orden.estado] || []).filter((estado) => (
    !(orden.estado === 'en_diagnostico' && estado === 'presupuestada')
  ));

  async function cambiarEstado(estado) {
    setError('');
    setProcesando(true);
    try {
      await api('PATCH', `/collections/ordenes/records/${orden.id}`, { estado });
      recargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="detalle">
      <div className="detalle-columna">
        <section className="tarjeta">
          <div className="tarjeta-cabecera">
            <div>
              <span className="eyebrow">Ficha técnica</span>
              <h2>Datos de la orden</h2>
            </div>
            <StatusBadge estado={orden.estado} />
          </div>
          <dl className="datos">
            <div><dt>Cliente</dt><dd>{orden.expand?.cliente?.nombre || '—'}</dd></div>
            <div><dt>Teléfono</dt><dd>{orden.expand?.cliente?.telefono || '—'}</dd></div>
            <div><dt>Equipo</dt><dd>{orden.equipo}</dd></div>
            <div><dt>Problema</dt><dd>{orden.problema}</dd></div>
            <div><dt>Creada</dt><dd>{formatearFecha(orden.created)}</dd></div>
            <div><dt>Actualizada</dt><dd>{formatearFecha(orden.updated)}</dd></div>
          </dl>

          {orden.fotos?.length > 0 && (
            <div className="fotos">
              <h3>Fotos de recepción</h3>
              <div className="galeria">
                {orden.fotos.map((archivo, indice) => (
                  <figure key={archivo}>
                    <a href={urlArchivo(orden, archivo)} target="_blank" rel="noreferrer">
                      <img src={urlArchivo(orden, archivo)} alt={`Foto ${indice + 1} de ${orden.equipo}`} />
                    </a>
                    <figcaption>Foto {indice + 1}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="tarjeta">
          <div className="tarjeta-cabecera">
            <div>
              <span className="eyebrow">Cierre económico</span>
              <h2>Presupuesto registrado</h2>
            </div>
          </div>
          {orden.estado === 'solicitada' ? (
            <p className="vacio">El presupuesto se registra cuando la orden entra en diagnóstico.</p>
          ) : (
            <>
              <p><strong>Diagnóstico:</strong> {orden.diagnostico || 'Pendiente'}</p>
              {piezas.length > 0 ? (
                <table className="tabla-piezas">
                  <thead>
                    <tr><th>Pieza</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {piezas.map((pieza, indice) => (
                      <tr key={indice}>
                        <td>{pieza.descripcion}</td>
                        <td>{pieza.cantidad}</td>
                        <td>{formatearMoneda(pieza.precio)}</td>
                        <td>{formatearMoneda((Number(pieza.cantidad) || 0) * (Number(pieza.precio) || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="vacio">Sin piezas registradas.</p>
              )}
              <p><strong>Mano de obra:</strong> {formatearMoneda(orden.manoObra)}</p>
              <div className="total">Total calculado <strong>{formatearMoneda(total)}</strong></div>
            </>
          )}
        </section>
      </div>

      <div className="detalle-columna">
        <div className="callout">
          <strong>Regla del sistema.</strong> El presupuesto solo se edita en <strong>En diagnóstico</strong>; al registrar la etapa siguiente queda bloqueado.
        </div>

        <BudgetPanel orden={orden} onGuardado={recargar} />

        {!cerrada && transiciones.length > 0 && (
          <section className="tarjeta">
            <span className="eyebrow">Máquina de estados</span>
            <h2>Siguiente paso</h2>
            <MensajeError mensaje={error} />
            <p className="vacio">Solo se permiten transiciones secuenciales; los saltos de fase son rechazados por el servidor.</p>
            <div className="acciones">
              {transiciones.map((estado) => (
                <button
                  className="boton"
                  key={estado}
                  type="button"
                  disabled={procesando}
                  onClick={() => cambiarEstado(estado)}
                >
                  {ETIQUETAS[estado]}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
