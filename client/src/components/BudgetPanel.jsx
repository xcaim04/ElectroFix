import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { piezasDe, formatearMoneda } from '../lib/format';
import MensajeError from './MensajeError';

function piezasIniciales(orden) {
  const piezas = piezasDe(orden?.piezas);
  return piezas.length
    ? piezas.map((pieza) => ({
        descripcion: pieza.descripcion || '',
        cantidad: pieza.cantidad ?? 1,
        precio: pieza.precio ?? 0
      }))
    : [{ descripcion: '', cantidad: 1, precio: 0 }];
}

export default function BudgetPanel({ orden, onGuardado }) {
  const [diagnostico, setDiagnostico] = useState(orden.diagnostico || '');
  const [manoObra, setManoObra] = useState(orden.manoObra ?? 0);
  const [piezas, setPiezas] = useState(() => piezasIniciales(orden));
  const [error, setError] = useState('');

  useEffect(() => {
    setDiagnostico(orden.diagnostico || '');
    setManoObra(orden.manoObra ?? 0);
    setPiezas(piezasIniciales(orden));
    setError('');
  }, [orden]);

  if (orden.estado !== 'en_diagnostico') return null;

  const total = (Number(manoObra) || 0) + piezas.reduce((suma, pieza) => {
    return suma + (Number(pieza.cantidad) || 0) * (Number(pieza.precio) || 0);
  }, 0);

  function cambiarPieza(indice, campo, valor) {
    setPiezas((actuales) => actuales.map((pieza, i) => (
      i === indice ? { ...pieza, [campo]: valor } : pieza
    )));
  }

  function validar() {
    if (!diagnostico.trim()) return 'Escribe el diagnóstico.';
    if ((Number(manoObra) || 0) < 0) return 'La mano de obra no puede ser negativa.';
    for (const pieza of piezas) {
      if (!pieza.descripcion.trim()) return 'Todas las piezas necesitan descripción.';
      if ((Number(pieza.cantidad) || 0) <= 0) return 'La cantidad debe ser mayor a cero.';
      if ((Number(pieza.precio) || 0) < 0) return 'El precio no puede ser negativo.';
    }
    return '';
  }

  async function guardar(estado) {
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }

    setError('');
    const datos = {
      diagnostico: diagnostico.trim(),
      manoObra: Number(manoObra) || 0,
      piezas: piezas.map((pieza) => ({
        descripcion: pieza.descripcion.trim(),
        cantidad: Number(pieza.cantidad),
        precio: Number(pieza.precio)
      }))
    };
    if (estado) datos.estado = estado;

    try {
      await api('PATCH', `/collections/ordenes/records/${orden.id}`, datos);
      onGuardado();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="tarjeta">
      <span className="eyebrow">Solo en diagnóstico</span>
      <h2>Armar presupuesto</h2>
      <label>
        Diagnóstico
        <textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} rows="3" placeholder="Describe el fallo detectado y la solución propuesta" />
      </label>
      <label>
        Mano de obra
        <div className="campo-sufijo">
          <input type="number" min="0" step="0.01" value={manoObra} onChange={(e) => setManoObra(e.target.value)} />
          <span>€</span>
        </div>
      </label>

      <div className="piezas">
        <div className="piezas-cabecera">
          <h3>Repuestos</h3>
          <button type="button" className="boton secundario" onClick={() => setPiezas((actuales) => [...actuales, { descripcion: '', cantidad: 1, precio: 0 }])}>
            Añadir pieza
          </button>
        </div>
        {piezas.map((pieza, indice) => (
          <div className="pieza" key={indice}>
            <input
              value={pieza.descripcion}
              onChange={(e) => cambiarPieza(indice, 'descripcion', e.target.value)}
              placeholder="Descripción"
              aria-label={`Descripción de pieza ${indice + 1}`}
            />
            <input
              type="number"
              min="1"
              value={pieza.cantidad}
              onChange={(e) => cambiarPieza(indice, 'cantidad', e.target.value)}
              aria-label={`Cantidad de pieza ${indice + 1}`}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={pieza.precio}
              onChange={(e) => cambiarPieza(indice, 'precio', e.target.value)}
              aria-label={`Precio de pieza ${indice + 1}`}
            />
            <button type="button" className="icono" onClick={() => setPiezas((actuales) => actuales.filter((_, i) => i !== indice))} disabled={piezas.length === 1}>
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="total">Total calculado <strong>{formatearMoneda(total)}</strong></div>
      <MensajeError mensaje={error} />
      <div className="acciones">
        <button type="button" className="boton secundario" onClick={() => guardar(null)}>Guardar borrador</button>
        <button type="button" className="boton" onClick={() => guardar('presupuestada')}>Registrar y bloquear</button>
      </div>
    </section>
  );
}
