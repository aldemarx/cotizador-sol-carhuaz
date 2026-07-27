export type EstadoLote = 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO';

export interface Lote {
  codigo_lote: string;
  manzana: string;
  lote: string;
  area_m2: number;
  codigo_ubicacion: string;
  precio_m2: number;
  medida_frente: string;
  entrega_fisica: number;
  estado: EstadoLote;
  precio_total_override: number | null;
  observacion: string | null;
}

export interface ParametrosSeed {
  proyecto: string;
  etapa: string;
  moneda: string;
  vigencia_desde: string;
  vigencia_hasta: string;
  cargo_fijo: number;
  descuento_campania: number;
  descuento_contado: number;
  inicial: number;
  cuotas_referencia: number;
  cuotas_min: number;
  cuotas_max: number;
  descuento_max_vendedor: number;
  redondeo_cuota: string;
  cuotas_sugeridas: string;
}

export interface DatosCliente {
  nombre: string;
  documento: string;
  telefono: string;
}
