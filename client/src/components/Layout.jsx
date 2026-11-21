import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const [tema, setTema] = useState(() => localStorage.getItem('electrofix-tema') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem('electrofix-tema', tema);
  }, [tema]);

  return (
    <div className="app-shell">
      <header className="barra">
        <div className="barra-interna">
          <NavLink to="/" className="marca">
            <span className="marca-mark">EF</span>
            ElectroFix <span>Taller</span>
          </NavLink>
          <span className="estado-servidor">PocketBase · local</span>
          <nav>
            <NavLink to="/" end>Panel</NavLink>
            <NavLink to="/ordenes">Órdenes</NavLink>
            <NavLink to="/ordenes/nueva">Nueva orden</NavLink>
            <NavLink to="/clientes/nuevo">Nuevo cliente</NavLink>
          </nav>
          <button
            type="button"
            className="tema-boton"
            onClick={() => setTema((actual) => (actual === 'light' ? 'dark' : 'light'))}
          >
            {tema === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </button>
        </div>
      </header>
      <div className="barra-meta">
        <div className="barra-meta-interna">
          <span>Taller / ElectroFix Central</span>
          <span>Reparaciones sin complicaciones</span>
        </div>
      </div>
      <main className="contenido">
        <Outlet />
      </main>
      <footer className="pie">ElectroFix · Taller de Reparaciones</footer>
    </div>
  );
}
