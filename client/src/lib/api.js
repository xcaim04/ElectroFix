export const API_BASE = import.meta.env.VITE_POCKETBASE_URL || '';

export async function api(method, path, body) {
  const esFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: esFormData || body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : esFormData ? body : JSON.stringify(body)
  });

  const texto = await response.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!response.ok) {
    const mensaje = datos?.message || `Error ${response.status}`;
    throw new Error(mensaje);
  }

  return datos;
}

export function urlArchivo(record, nombre) {
  return `${API_BASE}/api/files/${record.collectionId}/${record.id}/${nombre}`;
}
