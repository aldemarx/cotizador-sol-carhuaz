/**
 * Motor de reglas de cotizacion — Sol de Carhuaz.
 * Espejo de este archivo en Python cuando exista el backend (ver documento
 * de traspaso, seccion 5). Cualquier cambio aqui debe reflejarse alla y
 * viceversa; los casos de prueba de contrato en reglas.contrato.json son
 * la fuente de verdad compartida entre ambos.
 */

export interface ParametrosComerciales {
  cargo_fijo: number;
  descuento_contado: number;
  inicial: number;
  cuotas_min: number;
  cuotas_max: number;
}

export interface DatosLote {
  areaM2: number;
  precioM2: number;
  precioTotalOverride?: number | null;
}

export interface ResultadoCotizacion {
  precioConDescuento: number;
  precioTotal: number;
  precioContado: number;
  saldo: number;
  nCuotas: number;
  cuotaMensual: number;
  cuotaFinal: number;
  descuentoEspecial: number;
}

/** Redondeo a 2 decimales, evitando el error de coma flotante mas comun. */
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export class RangoCuotasInvalidoError extends Error {
  constructor(nCuotas: number, min: number, max: number) {
    super(`nCuotas fuera de rango (${min}-${max}): ${nCuotas}`);
    this.name = 'RangoCuotasInvalidoError';
  }
}

/**
 * Calcula el plan de pagos completo de un lote para un numero de cuotas dado.
 *
 * Si el lote tiene precioTotalOverride, ese valor manda sobre area*precio_m2
 * (documento seccion 4, "El override es la excepcion").
 *
 * descuentoEspecial es una rebaja adicional que el vendedor negocia con el
 * cliente (con tope, ver parametros.descuento_max_vendedor en el llamador).
 * No esta en la formula original del documento de Sol (seccion 5.1), pero
 * si en el roadmap de CEINYS para este mismo negocio de lotes: reduce el
 * saldo a financiar antes de dividir entre cuotas.
 */
export function calcularCotizacion(
  lote: DatosLote,
  parametros: ParametrosComerciales,
  nCuotas: number,
  descuentoEspecial = 0,
): ResultadoCotizacion {
  if (nCuotas < parametros.cuotas_min || nCuotas > parametros.cuotas_max) {
    throw new RangoCuotasInvalidoError(nCuotas, parametros.cuotas_min, parametros.cuotas_max);
  }

  let precioConDescuento: number;
  let precioTotal: number;

  if (lote.precioTotalOverride != null) {
    precioTotal = redondear2(lote.precioTotalOverride);
    precioConDescuento = redondear2(precioTotal - parametros.cargo_fijo);
  } else {
    precioConDescuento = redondear2(lote.areaM2 * lote.precioM2);
    precioTotal = redondear2(precioConDescuento + parametros.cargo_fijo);
  }

  const precioContado = redondear2(precioConDescuento - parametros.descuento_contado);
  const saldo = redondear2(precioConDescuento - parametros.inicial - descuentoEspecial);
  const cuotaMensual = redondear2(saldo / nCuotas);
  const cuotaFinal = redondear2(saldo - (nCuotas - 1) * cuotaMensual);

  return {
    precioConDescuento,
    precioTotal,
    precioContado,
    saldo,
    nCuotas,
    cuotaMensual,
    cuotaFinal,
    descuentoEspecial,
  };
}

/**
 * Calculo inverso: dado el saldo y la cuota que el cliente puede pagar,
 * devuelve el numero de cuotas mas cercano dentro del rango permitido.
 */
export function calcularNumeroCuotas(
  saldo: number,
  cuotaDeseada: number,
  parametros: Pick<ParametrosComerciales, 'cuotas_min' | 'cuotas_max'>,
): number {
  if (cuotaDeseada <= 0) {
    throw new Error(`cuotaDeseada debe ser mayor que 0: ${cuotaDeseada}`);
  }
  const n = Math.round(saldo / cuotaDeseada);
  return Math.min(parametros.cuotas_max, Math.max(parametros.cuotas_min, n));
}
