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
    .reduce((total, estado) => total + resumen[estado], 0);

  return (
    <>
      <section className="cabecera">
        <div>
          <h1>Panel del taller</h1>
          <p>Vista rápida del trabajo pendiente y de las últimas órdenes.</p>
        </div>
        <Link className="boton" to="/ordenes/nueva">Registrar orden</Link>
      </section>

      <section className="rejilla">
        <article className="metrica destacada">
          <span>Órdenes abiertas</span>
          <strong>{abiertas}</strong>
        </article>
        {ESTADOS.slice(0, 6).map((estado) => (
          <article className="metrica" key={estado}>
            <span>{ETIQUETAS[estado]}</span>
            <strong>{resumen[estado]}</strong>
          </article>
        ))}
      </section>

      <section className="tarjeta">
        <div className="tarjeta-cabecera">
          <h2>Últimas órdenes</h2>
          <Link to="/ordenes">Ver todas</Link>
        </div>
        {recientes.length === 0 ? (
          <p className="vacio">Todavía no hay órdenes registradas.</p>
        ) : (
          <div className="lista-sencilla">
            {recientes.map((orden) => (
              <Link className="fila" key={orden.id} to={`/ordenes/${orden.id}`}>
                <div>
                  <strong>{orden.equipo}</strong>
                  <small>{orden.expand?.cliente?.nombre || 'Cliente'} · {formatearFecha(orden.created)}</small>
                </div>
                <div className="fila-derecha">
                  <StatusBadge estado={orden.estado} />
                  <span>{formatearMoneda(totalPresupuesto(orden))}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
