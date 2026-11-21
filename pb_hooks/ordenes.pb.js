onRecordCreateRequest((e) => {
  const utils = require(`${__hooks}/utils.js`);

  e.record.set("estado", "solicitada");

  if (
    e.record.getString("diagnostico") !== "" ||
    e.record.getFloat("manoObra") !== 0 ||
    utils.textoPiezas(e.record.getString("piezas")) !== "[]"
  ) {
    throw new BadRequestError("El presupuesto solo se registra al presupuestar");
  }

  e.next();
}, "ordenes");

onRecordUpdateRequest((e) => {
  const utils = require(`${__hooks}/utils.js`);
  const anterior = e.record.original();
  const desde = anterior.getString("estado");
  const hacia = e.record.getString("estado");

  if (utils.CERRADOS.includes(desde)) {
    throw new BadRequestError(`Una orden ${desde} no puede modificarse`);
  }

  ["cliente", "equipo", "problema"].forEach((campo) => {
    if (e.record.getString(campo) !== anterior.getString(campo)) {
      throw new BadRequestError(`El campo ${campo} no se puede modificar`);
    }
  });

  const cambiaPresupuesto = utils.presupuestoCambio(e.record, anterior);

  if (desde === hacia) {
    if (desde !== "en_diagnostico" && cambiaPresupuesto) {
      throw new BadRequestError("El presupuesto ya registrado no se puede modificar");
    }
    e.next();
    return;
  }

  if (!(utils.TRANSICIONES[desde] || []).includes(hacia)) {
    throw new BadRequestError(`Transición no permitida: ${desde} -> ${hacia}`);
  }

  if (hacia === "presupuestada") {
    utils.presupuestoValido(e.record);
  } else if (cambiaPresupuesto) {
    throw new BadRequestError("El presupuesto solo se puede registrar al presupuestar");
  }

  e.next();
}, "ordenes");

onRecordUpdate((e) => {
  const desde = e.record.original().getString("estado");
  const hacia = e.record.getString("estado");

  e.next();

  if (desde === hacia) return;

  const coleccionEventos = e.app.findCollectionByNameOrId("eventos");
  const evento = new Record(coleccionEventos);
  evento.set("orden", e.record.id);
  evento.set("de", desde);
  evento.set("a", hacia);
  e.app.save(evento);
}, "ordenes");

routerAdd("GET", "/api/taller/resumen", (e) => {
  const utils = require(`${__hooks}/utils.js`);
  const resumen = {};

  utils.ESTADOS.forEach((estado) => {
    resumen[estado] = e.app.countRecords("ordenes", $dbx.hashExp({ estado: estado }));
  });

  return e.json(200, resumen);
});
