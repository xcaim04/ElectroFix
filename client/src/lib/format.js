export function piezasDe(valor) {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string') {
    try {
      const piezas = JSON.parse(valor);
      return Array.isArray(piezas) ? piezas : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function totalPresupuesto(orden) {
  const manoObra = Number(orden?.manoObra) || 0;
  const piezas = piezasDe(orden?.piezas).reduce((suma, pieza) => {
    return suma + (Number(pieza.cantidad) || 0) * (Number(pieza.precio) || 0);
  }, 0);
  return manoObra + piezas;
}

export function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(valor) || 0);
}

export function formatearFecha(valor) {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(valor));
}
