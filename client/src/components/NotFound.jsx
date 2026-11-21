import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="tarjeta">
      <h1>Página no encontrada</h1>
      <p>La ruta que buscas no existe.</p>
      <Link className="boton" to="/">Volver al inicio</Link>
    </section>
  );
}
