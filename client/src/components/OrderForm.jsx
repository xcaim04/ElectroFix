import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function OrderForm() {
  const navegar = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState('');
  const [equipo, setEquipo] = useState('');
  const [problema, setProblema] = useState('');
  const [fotos, setFotos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('GET', '/collections/clientes/records?perPage=100&sort=nombre')
      .then((datos) => {
        setClientes(datos.items);
        if (datos.items.length) setCliente(datos.items[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  function cambiarFotos(evento) {
    const seleccionadas = Array.from(evento.target.files || []);
    if (seleccionadas.length > 3) {
      setError('Máximo 3 fotos por orden.');
      setFotos(seleccionadas.slice(0, 3));
      return;
    }
    setError('');
    setFotos(seleccionadas);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    const datos = new FormData();
    datos.append('cliente', cliente);
    datos.append('equipo', equipo);
    datos.append('problema', problema);
    fotos.forEach((archivo) => datos.append('fotos', archivo));

    try {
      const orden = await api('POST', '/collections/ordenes/records', datos);
      navegar(`/ordenes/${orden.id}`);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="tarjeta estrecha">
      <span className="eyebrow">Recepción · Fase 1</span>
      <h1>Nueva orden de reparación</h1>
      <p>La orden se crea siempre en etapa <strong>solicitada</strong>.</p>

      <div className="pasos">
        <span className="paso activo"><span className="paso-numero">1</span> Cliente</span>
        <span className="paso"><span className="paso-numero">2</span> Equipo</span>
        <span className="paso"><span className="paso-numero">3</span> Falla y fotos</span>
      </div>

      <div className="callout">
        <strong>Estado inicial inmutable.</strong> El servidor fuerza la etapa <strong>solicitada</strong> al crear la orden y deja constancia en el historial.
      </div>

      {clientes.length === 0 && (
        <p className="alerta suave">
          Primero registra un <Link to="/clientes/nuevo">cliente</Link>.
        </p>
      )}
      <form onSubmit={enviar}>
        <label>
          Cliente
          <select value={cliente} onChange={(e) => setCliente(e.target.value)} required>
            <option value="">Selecciona un cliente</option>
            {clientes.map((item) => (
              <option key={item.id} value={item.id}>{item.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Equipo
          <input value={equipo} onChange={(e) => setEquipo(e.target.value)} placeholder="Ej. iPhone 12" required />
        </label>
        <label>
          Problema
          <textarea value={problema} onChange={(e) => setProblema(e.target.value)} rows="3" placeholder="Describe el síntoma reportado" required />
        </label>
        <label>
          Fotos (máximo 3) · {fotos.length}/3
          <input type="file" accept="image/*" multiple onChange={cambiarFotos} />
        </label>
        {error && <div className="alerta" role="alert">{error}</div>}
        <div className="acciones">
          <button className="boton" type="submit" disabled={!cliente}>Crear orden</button>
        </div>
      </form>
    </section>
  );
}
