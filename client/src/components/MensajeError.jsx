export default function MensajeError({ mensaje }) {
  if (!mensaje) return null;
  return <div className="alerta" role="alert">{mensaje}</div>;
}
