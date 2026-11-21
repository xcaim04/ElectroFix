import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ESTADOS, ETIQUETAS } from '../lib/constants';
import { formatearFecha, totalPresupuesto, formatearMoneda } from '../lib/format';
import EstadoCarga from './EstadoCarga';
import MensajeError from './MensajeError';
import StatusBadge from './StatusBadge';

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    Promise.all([
      api('GET', '/taller/resumen'),
      api('GET', '/collections/ordenes/records?expand=cliente&sort=-created&perPage=5')
    ])
      .then(([datosResumen, datosOrdenes]) => {
        if (!activo) return;
        setResumen(datosResumen);
        setRecientes(datosOrdenes.items);
      })
      .catch((e) => activo && setError(e.message));
    return () => {
      activo = false;
    };
  }, []);

  if (error) return <MensajeError mensaje={error} />;
  if (!resumen) return <EstadoCarga />;

  const abiertas = ESTADOS.filter((estado) => !['entregada', 'rechazada', 'cancelada'].includes(estado))
    .reduce((total, estado) => total + (resumen[estado] || 0), 0);
  const total = ESTADOS.reduce((suma, estado) => suma + (resumen[estado] || 0), 0);
  const carga = Math.min(100, Math.round((abiertas / 20) * 100));
  const fecha = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <>
      <section className="cabecera">
        <div>
          <span className="eyebrow">Resumen operativo · {fecha}</span>
          <h1>Panel del taller</h1>
          <p>Vista rápida de la carga de trabajo y de las últimas órdenes registradas.</p>
        </div>
        <div className="cabecera-acciones">
          <Link className="boton secundario" to="/clientes/nuevo">Nuevo cliente</Link>
          <Link className="boton" to="/ordenes/nueva">Nueva orden</Link>
        </div>
      </section>

      <section className="rejilla">
        <article className="metrica destacada">
          <span>Órdenes abiertas</span>
          <strong>{abiertas}</strong>
          <small>{total} órdenes en total</small>
        </article>
        {ESTADOS.slice(0, 6).map((estado) => (
          <article className="metrica" key={estado}>
            <span>{ETIQUETAS[estado]}</span>
            <strong>{resumen[estado] || 0}</strong>
          </article>
        ))}
      </section>

      <section className="panel-grid">
        <article className="tarjeta">
          <div className="tarjeta-cabecera">
            <div>
              <span className="eyebrow">Carga activa</span>
              <h2>Distribución de trabajo</h2>
            </div>
            <strong>{carga}%</strong>
          </div>
          <div className="progreso" aria-hidden="true">
            <span style={{ width: `${carga}%` }} />
            <span style={{ width: `${Math.min(100 - carga, (resumen.en_diagnostico || 0) * 5)}%` }} />
            <span style={{ width: `${Math.min(100 - carga, (resumen.en_reparacion || 0) * 5)}%` }} />
          </div>
          <div className="datos-lista">
            <div className="dato-fila"><span>Solicitadas</span><strong>{resumen.solicitada || 0}</strong></div>
            <div className="dato-fila"><span>En diagnóstico</span><strong>{resumen.en_diagnostico || 0}</strong></div>
            <div className="dato-fila"><span>En reparación</span><strong>{resumen.en_reparacion || 0}</strong></div>
          </div>
        </article>
        <article className="tarjeta">
          <div className="tarjeta-cabecera">
            <div>
              <span className="eyebrow">Servidor local</span>
              <h2>PocketBase</h2>
            </div>
          </div>
          <div className="datos-lista">
            <div className="dato-fila"><span>Resumen</span><strong>/api/taller/resumen</strong></div>
            <div className="dato-fila"><span>Colecciones</span><strong>3</strong></div>
            <div className="dato-fila"><span>Hooks activos</span><strong>ordenes.pb.js</strong></div>
          </div>
        </article>
      </section>

      <section className="tarjeta">
        <div className="tarjeta-cabecera">
          <div>
            <span className="eyebrow">Actividad reciente</span>
            <h2>Últimas órdenes</h2>
          </div>
          <Link to="/ordenes">Ver todas</Link>
        </div>
        {recientes.length === 0 ? (
          <p className="vacio">Todavía no hay órdenes registradas.</p>
        ) : (
          <div className="tabla">
            <div className="tabla-cabecera">
              <span>OT / Equipo</span>
              <span>Cliente</span>
              <span>Estado</span>
              <span>Ingreso</span>
              <span className="derecha">Importe</span>
            </div>
            {recientes.map((orden) => (
              <Link className="tabla-fila" key={orden.id} to={`/ordenes/${orden.id}`}>
                <span>
                  <strong>{orden.equipo}</strong>
                  <small>OT-{orden.id.slice(0, 6).toUpperCase()}</small>
                </span>
                <span>{orden.expand?.cliente?.nombre || '—'}</span>
                <span><StatusBadge estado={orden.estado} /></span>
                <span>{formatearFecha(orden.created)}</span>
                <span className="derecha">{formatearMoneda(totalPresupuesto(orden))}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
