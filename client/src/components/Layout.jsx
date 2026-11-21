import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="barra">
        <NavLink to="/" className="marca">
          ElectroFix <span>Taller</span>
        </NavLink>
        <nav>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/ordenes">Órdenes</NavLink>
          <NavLink to="/ordenes/nueva">Nueva orden</NavLink>
          <NavLink to="/clientes/nuevo">Nuevo cliente</NavLink>
        </nav>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
      <footer className="pie">ElectroFix · Reparaciones sin complicaciones</footer>
    </div>
  );
}
