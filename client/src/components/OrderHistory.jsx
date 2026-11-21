import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ETIQUETAS } from '../lib/constants';
import { formatearFecha } from '../lib/format';
import EstadoCarga from './EstadoCarga';
import MensajeError from './MensajeError';

export default function OrderHistory() {
  const { id } = useParams();
  const [eventos, setEventos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const filtro = encodeURIComponent(`orden="${id}"`);
    api('GET', `/collections/eventos/records?filter=${filtro}&sort=created&perPage=100`)
      .then((datos) => setEventos(datos.items))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <MensajeError mensaje={error} />;
  if (!eventos) return <EstadoCarga />;

  return (
    <section className="tarjeta">
      <div className="tarjeta-cabecera">
        <h2>Historial de etapas</h2>
        <Link to={`/ordenes/${id}`}>Volver al detalle</Link>
      </div>
      {eventos.length === 0 ? (
        <p className="vacio">Todavía no hay cambios de etapa.</p>
      ) : (
        <ol className="linea-tiempo">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <strong>{ETIQUETAS[evento.de] || evento.de} → {ETIQUETAS[evento.a] || evento.a}</strong>
              <small>{formatearFecha(evento.created)}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
