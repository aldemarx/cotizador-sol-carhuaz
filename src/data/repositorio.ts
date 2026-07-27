import { db, type CotizacionGuardada } from './db';
import type { Lote, ParametrosSeed } from './tipos';

/**
 * Acceso a los datos del proyecto -- siempre contra IndexedDB (Dexie), que
 * es lo que sigue disponible sin conexion. sincronizar.ts es quien la llena.
 */

export async function obtenerParametros(): Promise<ParametrosSeed> {
  const fila = await db.parametros.get('actual');
  if (!fila) throw new Error('Datos no sincronizados todavia');
  const { id: _id, ...parametros } = fila;
  return parametros;
}

export async function listarLotesDisponibles(): Promise<Lote[]> {
  return db.lotes.where('estado').equals('DISPONIBLE').toArray();
}

export async function obtenerLote(codigo: string): Promise<Lote | undefined> {
  return db.lotes.get(codigo);
}

/** Busqueda simple por codigo o manzana, solo entre lotes DISPONIBLE. */
export async function buscarLotes(query: string): Promise<Lote[]> {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const disponibles = await listarLotesDisponibles();
  return disponibles.filter((l) => l.codigo_lote.includes(q) || l.manzana.includes(q)).slice(0, 20);
}

/** Guardian offline: si la vigencia cacheada ya vencio, no se puede cotizar. */
export async function listaVigente(fechaReferencia: Date = new Date()): Promise<boolean> {
  const parametros = await obtenerParametros();
  const hasta = new Date(`${parametros.vigencia_hasta}T23:59:59`);
  return fechaReferencia <= hasta;
}

/**
 * Cola de solo-agregar: cada cotizacion generada se guarda localmente.
 * Sin resolucion de conflictos porque el sistema no reserva lotes
 * (documento seccion 7.5) -- cuando exista el backend, un job aparte
 * sube las que tengan sincronizada=false y las marca como enviadas.
 */
export async function guardarCotizacionLocal(cotizacion: CotizacionGuardada): Promise<void> {
  await db.cotizaciones.put(cotizacion);
}

export async function contarCotizacionesPendientes(): Promise<number> {
  return db.cotizaciones.where('sincronizada').equals(0).count();
}
