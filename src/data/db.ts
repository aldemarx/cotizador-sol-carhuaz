import Dexie, { type Table } from 'dexie';
import type { Lote, ParametrosSeed, DatosCliente } from './tipos';
import type { ResultadoCotizacion } from '../motor/reglas';

export interface ParametroRow extends ParametrosSeed {
  id: 'actual';
}

export interface CotizacionGuardada {
  codigo_cotizacion: string;
  codigo_lote: string;
  vendedor: string;
  cliente: DatosCliente;
  resultado: ResultadoCotizacion;
  creada_en: string; // ISO
  sincronizada: 0 | 1; // IndexedDB no indexa booleans de forma confiable en todos los navegadores
}

/**
 * Base local (IndexedDB) para operar sin conexion. Solo agrega registros
 * nuevos a "cotizaciones" -- nunca modifica lotes/parametros desde el
 * celular del vendedor (documento seccion 4: "el estado del lote tiene un
 * solo escritor", que hoy es la sincronizacion, no la app del vendedor).
 */
export class CotizadorDB extends Dexie {
  lotes!: Table<Lote, string>;
  parametros!: Table<ParametroRow, string>;
  cotizaciones!: Table<CotizacionGuardada, string>;

  constructor() {
    super('cotizador-sol-carhuaz');
    this.version(1).stores({
      lotes: 'codigo_lote, estado, manzana',
      parametros: 'id',
      cotizaciones: 'codigo_cotizacion, sincronizada, creada_en',
    });
  }
}

export const db = new CotizadorDB();
