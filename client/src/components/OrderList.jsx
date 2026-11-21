import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ESTADOS, ETIQUETAS } from '../lib/constants';
import { formatearFecha, formatearMoneda, totalPresupuesto } from '../lib/format';
import EstadoCarga from './EstadoCarga';
import MensajeError from './MensajeError';
import StatusBadge from './StatusBadge';

export default function OrderList() {
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('GET', '/collections/ordenes/records?expand=cliente&sort=-created&perPage=100')
      .then((datos) => setOrdenes(datos.items))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return ordenes.filter((orden) => {
      const coincideEstado = !estado || orden.estado === estado;
      const contenido = [
        orden.id,
        orden.equipo,
        orden.problema,
        orden.expand?.cliente?.nombre || ''
      ].join(' ').toLowerCase();
      return coincideEstado && contenido.includes(texto);
    });
  }, [ordenes, busqueda, estado]);

  if (error) return <MensajeError mensaje={error} />;
  if (cargando) return <EstadoCarga />;

  return (
    <>
      <section className="cabecera">
        <div>
          <span className="eyebrow">Órdenes de reparación</span>
          <h1>Órdenes</h1>
          <p>Consulta rápida por número de OT, equipo, problema o cliente.</p>
        </div>
        <div className="cabecera-acciones">
          <Link className="boton" to="/ordenes/nueva">Nueva orden</Link>
        </div>
      </section>

      <section className="tarjeta">
        <div className="filtros">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar OT, equipo, cliente…"
            aria-label="Buscar órdenes"
          />
          <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {ESTADOS.map((item) => (
              <option key={item} value={item}>{ETIQUETAS[item]}</option>
            ))}
          </select>
          <span className="contador">{visibles.length} resultado(s)</span>
        </div>

        {visibles.length === 0 ? (
          <p className="vacio">No hay órdenes que coincidan.</p>
        ) : (
          <div className="tabla">
            <div className="tabla-cabecera">
              <span>OT / Equipo</span>
              <span>Cliente</span>
              <span>Estado</span>
              <span>Ingreso</span>
              <span className="derecha">Presupuesto</span>
            </div>
            {visibles.map((orden) => (
              <Link className="tabla-fila" key={orden.id} to={`/ordenes/${orden.id}`}>
                <span>
                  <strong>{orden.equipo}</strong>
                  <small>OT-{orden.id.slice(0, 6).toUpperCase()} · {orden.problema}</small>
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
