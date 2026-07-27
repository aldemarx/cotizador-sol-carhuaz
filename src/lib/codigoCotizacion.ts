const CLAVE_CONTADOR = 'cotizador_sc_contador';

/**
 * Codigo de cotizacion: SC-AAAAMMDD-NNNN.
 *
 * El contador es local al dispositivo (localStorage) porque hoy no hay
 * backend que lo centralice -- ver documento de traspaso, seccion 8.6
 * (pendiente definir formato final) y seccion 9 (backend en otra sesion).
 * Cuando exista el backend, este contador pasa a vivir alla (con
 * fcntl.flock o equivalente) y esta funcion solo consume la API.
 */
export function generarCodigoCotizacion(fecha: Date = new Date()): string {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');

  const actual = Number(localStorage.getItem(CLAVE_CONTADOR) || '0') + 1;
  localStorage.setItem(CLAVE_CONTADOR, String(actual));
  const secuencia = String(actual).padStart(4, '0');

  return `SC-${yyyy}${mm}${dd}-${secuencia}`;
}
