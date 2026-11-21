import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import EstadoCarga from './EstadoCarga';
import MensajeError from './MensajeError';
import StatusBadge from './StatusBadge';

export default function OrderLayout() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    setError('');
    api('GET', `/collections/ordenes/records/${id}?expand=cliente`)
      .then(setOrden)
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error) return <MensajeError mensaje={error} />;
  if (!orden) return <EstadoCarga />;

  return (
    <>
      <section className="cabecera">
        <div>
          <Link className="volver" to="/ordenes">← Volver a órdenes</Link>
          <h1>{orden.equipo}</h1>
          <p>
            {orden.expand?.cliente?.nombre || 'Cliente'} · <StatusBadge estado={orden.estado} />
          </p>
        </div>
      </section>

      <nav className="pestanas">
        <NavLink to={`/ordenes/${id}`} end>Detalle</NavLink>
        <NavLink to={`/ordenes/${id}/historial`}>Historial</NavLink>
      </nav>

      <Outlet context={{ orden, recargar: cargar }} />
    </>
  );
}
