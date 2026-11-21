const BASE = process.env.PB_URL || "http://127.0.0.1:8090";

async function api(method, path, body) {
  const response = await fetch(`${BASE}/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${method} ${path} -> ${response.status}: ${text}`);
  }

  return data;
}

async function listar(coleccion) {
  const data = await api("GET", `/collections/${coleccion}/records?perPage=100`);
  return data.items;
}

async function asegurarCliente(nombre, telefono) {
  const existentes = await listar("clientes");
  const encontrado = existentes.find((cliente) => cliente.nombre === nombre);
  if (encontrado) return encontrado.id;

  const creado = await api("POST", "/collections/clientes/records", { nombre, telefono });
  return creado.id;
}

async function asegurarOrden(cliente, equipo, problema, pasos) {
  const existentes = await listar("ordenes");
  if (existentes.some((orden) => orden.equipo === equipo)) {
    console.log(`Orden ya existe: ${equipo}`);
    return;
  }

  const orden = await api("POST", "/collections/ordenes/records", { cliente, equipo, problema });

  for (const paso of pasos) {
    await api("PATCH", `/collections/ordenes/records/${orden.id}`, {
      estado: paso.estado,
      ...(paso.datos || {})
    });
  }

  console.log(`Orden creada: ${equipo}`);
}

const ana = await asegurarCliente("Ana Torres", "600111222");
const luis = await asegurarCliente("Luis Ruiz", "600333444");

await asegurarOrden(ana, "iPhone 12", "Pantalla rota", [
  { estado: "en_diagnostico" },
  {
    estado: "presupuestada",
    datos: {
      diagnostico: "Panel roto, conector revisado",
      manoObra: 50,
      piezas: [{ descripcion: "Pantalla OLED", cantidad: 1, precio: 120 }]
    }
  },
  { estado: "aprobada" },
  { estado: "en_reparacion" },
  { estado: "lista" },
  { estado: "entregada" }
]);

await asegurarOrden(luis, "Laptop Lenovo", "No enciende", [
  { estado: "en_diagnostico" },
  {
    estado: "presupuestada",
    datos: {
      diagnostico: "Fuente sin salida",
      manoObra: 80,
      piezas: [{ descripcion: "Fuente 65W", cantidad: 1, precio: 90 }]
    }
  },
  { estado: "aprobada" },
  { estado: "en_reparacion" }
]);

await asegurarOrden(ana, "Tablet Samsung", "Batería hinchada", [
  { estado: "en_diagnostico" },
  {
    estado: "presupuestada",
    datos: {
      diagnostico: "Batería degradada",
      manoObra: 40,
      piezas: [{ descripcion: "Batería interna", cantidad: 1, precio: 65 }]
    }
  }
]);

console.log("Seed completado");
