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
          <span className="eyebrow">Orden de reparación · OT-{orden.id.slice(0, 6).toUpperCase()}</span>
          <h1>{orden.equipo}</h1>
          <p>
            {orden.expand?.cliente?.nombre || 'Cliente'} · <StatusBadge estado={orden.estado} />
          </p>
        </div>
        <div className="cabecera-acciones">
          <button type="button" className="boton secundario" onClick={() => window.print()}>Imprimir ficha</button>
        </div>
      </section>

      <nav className="pestanas">
        <NavLink to={`/ordenes/${id}`} end>Detalle y presupuesto</NavLink>
        <NavLink to={`/ordenes/${id}/historial`}>Historial de etapas</NavLink>
      </nav>

      <Outlet context={{ orden, recargar: cargar }} />
    </>
  );
}
