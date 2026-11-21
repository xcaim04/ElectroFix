# ElectroFix — Taller de Reparaciones

Aplicación de gestión de órdenes de reparación construida con React + Vite en el frontend y PocketBase en el backend. El proyecto no tiene autenticación: todas las operaciones se realizan de forma directa contra la API.

## Estructura

- `pb_migrations/1700000000_initial_schema.js`: colecciones `clientes`, `ordenes` y `eventos`.
- `pb_hooks/ordenes.pb.js`: validación de estados, presupuesto, eventos y endpoint de resumen.
- `pb_hooks/utils.js`: utilidades compartidas por los hooks.
- `scripts/seed.mjs`: datos de prueba idempotentes.
- `client/`: frontend React con React Router y `fetch`.

## Backend con PocketBase

Se requiere PocketBase v0.40.x.

Desde la raíz del repositorio:

```bash
./pocketbase serve --http=127.0.0.1:8090 --dir=pb_data
```

PocketBase aplica automáticamente las migraciones de `pb_migrations/` y carga los hooks desde `pb_hooks/` cuando se ejecuta desde la raíz del proyecto.

Datos de prueba:

```bash
node scripts/seed.mjs
```

Por defecto el script apunta a `http://127.0.0.1:8090`. Para otra URL:

```bash
PB_URL=http://127.0.0.1:8090 node scripts/seed.mjs
```

El seed crea 2 clientes y 3 órdenes en etapas distintas: `entregada`, `en_reparacion` y `presupuestada`.

## Frontend

```bash
cd client
npm install
npm run dev
```

El servidor de desarrollo usa un proxy de Vite: las peticiones a `/api` se reenvían a `http://127.0.0.1:8090`.

Para apuntar a otro backend:

```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090 npm run dev
```

Verificación:

```bash
npm run lint
npm run build
```

## Rutas de la interfaz

- `/`: panel con resumen y últimas órdenes.
- `/clientes/nuevo`: alta de cliente.
- `/ordenes/nueva`: alta de orden con hasta 3 fotos.
- `/ordenes`: consulta y filtro de órdenes.
- `/ordenes/:id`: detalle de la orden con pestaña de historial anidada.
- `/ordenes/:id/historial`: cambios de etapa registrados por PocketBase.
- Cualquier otra ruta muestra una página 404.

## Reglas del taller

- Una orden siempre se crea en `solicitada`.
- El presupuesto se registra únicamente en `en_diagnostico` y no se puede modificar después.
- El total se calcula en el cliente a partir de `manoObra` y `piezas`; no se guarda en la base de datos.
- Los saltos de estado están prohibidos y se validan en los hooks.
- Cada cambio de etapa crea automáticamente un registro en `eventos`.
- Las órdenes y los eventos no se pueden borrar desde la API.

## API adicional

Además del CRUD estándar de PocketBase, los hooks exponen:

```text
GET /api/taller/resumen
```

Devuelve el número de órdenes por cada estado.

## Decisiones técnicas

- No se usa el SDK de PocketBase; todas las llamadas son `fetch`.
- No se usan librerías de componentes ni gestores de estado global.
- El historial y las transiciones se garantizan en PocketBase, no en la interfaz.
- La navegación usa React Router con `Outlet` para las vistas anidadas de una orden.
