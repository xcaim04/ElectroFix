const TRANSICIONES = {
  solicitada: ["en_diagnostico", "cancelada"],
  en_diagnostico: ["presupuestada"],
  presupuestada: ["aprobada", "rechazada"],
  aprobada: ["en_reparacion"],
  en_reparacion: ["lista"],
  lista: ["entregada"],
  entregada: [],
  rechazada: [],
  cancelada: []
};

const CERRADOS = ["entregada", "rechazada", "cancelada"];

const ESTADOS = [
  "solicitada",
  "en_diagnostico",
  "presupuestada",
  "aprobada",
  "en_reparacion",
  "lista",
  "entregada",
  "rechazada",
  "cancelada"
];

function valorComoTexto(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor)) return JSON.stringify(valor);

  const claves = Object.keys(valor);
  if (claves.length && claves.every((clave) => /^\d+$/.test(clave))) {
    let texto = "";
    for (let i = 0; i < claves.length; i++) {
      texto += String.fromCharCode(valor[claves[i]]);
    }
    return texto;
  }

  return JSON.stringify(valor);
}

function textoPiezas(valor) {
  const texto = valorComoTexto(valor);
  if (!texto || texto === "null") return "[]";
  try {
    return JSON.stringify(JSON.parse(texto));
  } catch (_) {
    return texto;
  }
}

function piezasComoArreglo(valor) {
  const texto = valorComoTexto(valor);
  if (!texto || texto === "null") return [];
  const piezas = JSON.parse(texto);
  if (!Array.isArray(piezas)) throw new BadRequestError("piezas debe ser una lista");
  return piezas;
}

function presupuestoValido(registro) {
  const diagnostico = registro.getString("diagnostico").trim();
  const manoObra = registro.getFloat("manoObra");
  const piezas = piezasComoArreglo(registro.getString("piezas"));

  if (!diagnostico) throw new BadRequestError("El diagnóstico es obligatorio al presupuestar");
  if (!Number.isFinite(manoObra) || manoObra < 0) {
    throw new BadRequestError("La mano de obra debe ser un número mayor o igual a cero");
  }

  piezas.forEach((pieza, indice) => {
    if (!pieza || typeof pieza.descripcion !== "string" || !pieza.descripcion.trim()) {
      throw new BadRequestError(`La pieza ${indice + 1} necesita una descripción`);
    }
    const cantidad = Number(pieza.cantidad);
    const precio = Number(pieza.precio);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new BadRequestError(`La pieza ${indice + 1} necesita una cantidad mayor a cero`);
    }
    if (!Number.isFinite(precio) || precio < 0) {
      throw new BadRequestError(`La pieza ${indice + 1} necesita un precio mayor o igual a cero`);
    }
  });
}

function presupuestoCambio(actual, anterior) {
  return (
    actual.getString("diagnostico") !== anterior.getString("diagnostico") ||
    actual.getFloat("manoObra") !== anterior.getFloat("manoObra") ||
    textoPiezas(actual.getString("piezas")) !== textoPiezas(anterior.getString("piezas"))
  );
}

module.exports = {
  TRANSICIONES,
  CERRADOS,
  ESTADOS,
  textoPiezas,
  presupuestoValido,
  presupuestoCambio
};
