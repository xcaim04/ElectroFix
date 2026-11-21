/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const clientes = new Collection({
    type: "base",
    name: "clientes",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      { name: "nombre", type: "text", required: true },
      { name: "telefono", type: "text", required: true },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
    ]
  });
  app.save(clientes);

  const ordenes = new Collection({
    type: "base",
    name: "ordenes",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
    fields: [
      {
        name: "cliente",
        type: "relation",
        required: true,
        collectionId: clientes.id,
        cascadeDelete: false,
        minSelect: 1,
        maxSelect: 1
      },
      { name: "equipo", type: "text", required: true },
      { name: "problema", type: "text", required: true },
      {
        name: "estado",
        type: "select",
        required: true,
        values: [
          "solicitada",
          "en_diagnostico",
          "presupuestada",
          "aprobada",
          "rechazada",
          "en_reparacion",
          "lista",
          "entregada",
          "cancelada"
        ]
      },
      { name: "diagnostico", type: "text" },
      { name: "manoObra", type: "number" },
      { name: "piezas", type: "json" },
      {
        name: "fotos",
        type: "file",
        maxSelect: 3,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
      },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
    ]
  });
  app.save(ordenes);

  const eventos = new Collection({
    type: "base",
    name: "eventos",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "orden",
        type: "relation",
        required: true,
        collectionId: ordenes.id,
        cascadeDelete: false,
        minSelect: 1,
        maxSelect: 1
      },
      { name: "de", type: "text" },
      { name: "a", type: "text" },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
    ]
  });
  app.save(eventos);
}, (app) => {
  app.deleteCollection("eventos");
  app.deleteCollection("ordenes");
  app.deleteCollection("clientes");
})
