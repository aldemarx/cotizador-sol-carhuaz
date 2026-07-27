const CLAVE_VENDEDOR = 'cotizador_sc_vendedor';

export function obtenerVendedorGuardado(): string {
  return localStorage.getItem(CLAVE_VENDEDOR) || '';
}

export function guardarVendedor(nombre: string): void {
  localStorage.setItem(CLAVE_VENDEDOR, nombre.trim());
}
