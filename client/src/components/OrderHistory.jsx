import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ESTADOS, ETIQUETAS } from '../lib/constants';
import { formatearFecha } from '../lib/format';
import EstadoCarga from './EstadoCarga';
import MensajeError from './MensajeError';

export default function OrderHistory() {
  const { id } = useParams();
  const { orden } = useOutletContext();
  const [eventos, setEventos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const filtro = encodeURIComponent(`orden="${id}"`);
    api('GET', `/collections/eventos/records?filter=${filtro}&sort=-created&perPage=100`)
      .then((datos) => setEventos(datos.items))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <MensajeError mensaje={error} />;
  if (!eventos) return <EstadoCarga />;

  const indiceActual = Math.max(0, ESTADOS.indexOf(orden.estado));

  return (
    <div className="detalle">
      <div className="detalle-columna">
        <section className="tarjeta">
          <div className="tarjeta-cabecera">
            <div>
              <span className="eyebrow">Trazabilidad · OT-{orden.id.slice(0, 6).toUpperCase()}</span>
              <h2>Historial de etapas</h2>
            </div>
            <Link to={`/ordenes/${id}`}>Volver al detalle</Link>
          </div>

          <div className="callout">
            <strong>Flujo secuencial obligatorio.</strong> No se permiten saltos de fase. Cada cambio queda registrado en la colección <strong>eventos</strong> como dato de solo lectura.
          </div>

          <div className="flujo" aria-label="Secuencia de etapas">
            {ESTADOS.map((estado, indice) => (
              <span
                className={`flujo-paso ${indice < indiceActual ? 'done' : ''} ${indice === indiceActual ? 'active' : ''}`}
                key={estado}
              >
                {ETIQUETAS[estado]}
              </span>
            ))}
          </div>

          {eventos.length === 0 ? (
            <p className="vacio">Todavía no hay cambios de etapa.</p>
          ) : (
            <ol className="linea-tiempo">
              {eventos.map((evento) => (
                <li key={evento.id}>
                  <strong>{ETIQUETAS[evento.de] || evento.de} → {ETIQUETAS[evento.a] || evento.a}</strong>
                  <small>{formatearFecha(evento.created)} · EVT-{evento.id.slice(0, 6).toUpperCase()}</small>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="detalle-columna">
        <section className="tarjeta">
          <span className="eyebrow">Auditoría</span>
          <h2>Registro inmutable</h2>
          <div className="datos-lista">
            <div className="dato-fila"><span>Orden</span><strong>OT-{orden.id.slice(0, 6).toUpperCase()}</strong></div>
            <div className="dato-fila"><span>Eventos</span><strong>{eventos.length}</strong></div>
            <div className="dato-fila"><span>Etapa actual</span><strong>{ETIQUETAS[orden.estado] || orden.estado}</strong></div>
            <div className="dato-fila"><span>Colección</span><strong>eventos</strong></div>
          </div>
          <div className="callout" style={{ marginTop: '1rem', marginBottom: 0 }}>
            El historial se genera desde los hooks de PocketBase; la interfaz no puede editarlo ni reordenarlo.
          </div>
        </section>
      </div>
    </div>
  );
}
