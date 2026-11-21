import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ClientForm() {
  const navegar = useNavigate();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    try {
      await api('POST', '/collections/clientes/records', { nombre, telefono });
      navegar('/ordenes/nueva');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="tarjeta estrecha">
      <span className="eyebrow">Recepción · Datos básicos</span>
      <h1>Nuevo cliente</h1>
      <p>Los datos básicos se usan para identificar las órdenes del taller.</p>
      <form onSubmit={enviar}>
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellido" required />
        </label>
        <label>
          Teléfono
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 600 000 000" required />
        </label>
        {error && <div className="alerta" role="alert">{error}</div>}
        <div className="acciones">
          <button className="boton" type="submit">Guardar cliente</button>
        </div>
      </form>
    </section>
  );
}
