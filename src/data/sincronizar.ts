import seed from './seed.json';
import { db } from './db';
import type { Lote, ParametrosSeed } from './tipos';

const datosSeed = seed as unknown as { parametros: ParametrosSeed; lotes: Lote[] };

/**
 * Carga lotes y parametros en IndexedDB si todavia no existen. Hoy la
 * "fuente remota" es el seed.json generado del Excel (Fase 0); cuando
 * exista el backend (documento seccion 9), esta funcion pasa a hacer
 * fetch a la API en vez de leer el JSON empaquetado, sin que el resto
 * de la app (repositorio.ts) tenga que cambiar.
 */
export async function sincronizarSiNecesario(): Promise<void> {
  const yaSincronizado = await db.parametros.get('actual');
  if (yaSincronizado) return;
  await sincronizarAhora();
}

export async function sincronizarAhora(): Promise<void> {
  await db.transaction('rw', db.lotes, db.parametros, async () => {
    await db.lotes.bulkPut(datosSeed.lotes);
    await db.parametros.put({ ...datosSeed.parametros, id: 'actual' });
  });
}
