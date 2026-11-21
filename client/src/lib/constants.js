export const ESTADOS = [
  'solicitada',
  'en_diagnostico',
  'presupuestada',
  'aprobada',
  'en_reparacion',
  'lista',
  'entregada',
  'rechazada',
  'cancelada'
];

export const ETIQUETAS = {
  solicitada: 'Solicitada',
  en_diagnostico: 'En diagnóstico',
  presupuestada: 'Presupuestada',
  aprobada: 'Aprobada',
  en_reparacion: 'En reparación',
  lista: 'Lista',
  entregada: 'Entregada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada'
};

export const TRANSICIONES = {
  solicitada: ['en_diagnostico', 'cancelada'],
  en_diagnostico: ['presupuestada'],
  presupuestada: ['aprobada', 'rechazada'],
  aprobada: ['en_reparacion'],
  en_reparacion: ['lista'],
  lista: ['entregada'],
  entregada: [],
  rechazada: [],
  cancelada: []
};

export const CERRADOS = ['entregada', 'rechazada', 'cancelada'];

export function accionPara(estado) {
  return {
    solicitada: 'Iniciar diagnóstico',
    en_diagnostico: 'Registrar presupuesto',
    presupuestada: 'Aprobar',
    aprobada: 'Iniciar reparación',
    en_reparacion: 'Marcar lista',
    lista: 'Entregar'
  }[estado];
}
