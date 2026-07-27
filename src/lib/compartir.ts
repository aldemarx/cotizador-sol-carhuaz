export type ResultadoCompartir = 'compartido' | 'no-soportado' | 'cancelado' | 'error';

/**
 * Comparte el PDF via Web Share API (nivel 2, con archivos) -- en un celular
 * esto abre el selector nativo y entrega el PDF directo a WhatsApp.
 * Funciona sin conexion porque WhatsApp encola el mensaje (documento seccion 7.3).
 */
export async function compartirPdf(
  blob: Blob,
  nombreArchivo: string,
  textoMensaje: string,
): Promise<ResultadoCompartir> {
  const archivo = new File([blob], nombreArchivo, { type: 'application/pdf' });

  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; text?: string }) => Promise<void>;
  };

  if (!nav.canShare || !nav.share || !nav.canShare({ files: [archivo] })) {
    return 'no-soportado';
  }

  try {
    await nav.share({ files: [archivo], text: textoMensaje });
    return 'compartido';
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return 'cancelado';
    return 'error';
  }
}

/**
 * Respaldo para navegadores sin soporte de Web Share con archivos: abre
 * WhatsApp con el texto ya redactado, para que el vendedor adjunte el PDF
 * (ya descargado por separado) a mano.
 */
export function abrirWhatsAppConTexto(textoMensaje: string, telefono?: string): void {
  const destino = telefono ? telefono.replace(/\D/g, '') : '';
  const url = `https://wa.me/${destino}?text=${encodeURIComponent(textoMensaje)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
