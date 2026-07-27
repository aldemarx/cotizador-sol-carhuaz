import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { Lote, DatosCliente } from '../data/tipos';
import type { ResultadoCotizacion } from '../motor/reglas';
import { formatearMoneda, formatearFecha } from './formato';

// pdfmake 0.2.x expone las fuentes como un objeto plano (ver node_modules/pdfmake/build/vfs_fonts.js).
(pdfMake as unknown as { vfs: typeof pdfFonts }).vfs = pdfFonts;

export interface DatosPdf {
  codigoCotizacion: string;
  fechaEmision: Date;
  vigenciaHasta: string; // ISO AAAA-MM-DD
  vendedor: string;
  cliente: DatosCliente;
  lote: Lote;
  resultado: ResultadoCotizacion;
}

function formatearFechaLarga(fecha: Date): string {
  return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Contenido obligatorio segun el documento de traspaso, seccion 7.2:
 * codigo de cotizacion, fecha de emision, fecha de vigencia, vendedor,
 * datos del cliente, plan de pagos completo, y la leyenda legal de que
 * es referencial y no constituye separacion ni reserva.
 */
export function construirDocumentoCotizacion(datos: DatosPdf): TDocumentDefinitions {
  const { codigoCotizacion, fechaEmision, vigenciaHasta, vendedor, cliente, lote, resultado } = datos;

  const filasPlan: (string | { text: string; bold?: boolean })[][] = [
    ['Precio total', formatearMoneda(resultado.precioTotal)],
    ['Precio con descuento', formatearMoneda(resultado.precioConDescuento)],
    ['Precio al contado', formatearMoneda(resultado.precioContado)],
  ];
  if (resultado.descuentoEspecial > 0) {
    filasPlan.push(['Descuento especial', formatearMoneda(resultado.descuentoEspecial)]);
  }
  filasPlan.push([{ text: 'Saldo a financiar', bold: true }, { text: formatearMoneda(resultado.saldo), bold: true }]);

  return {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50],
    content: [
      { text: 'Cotización — Sol de Carhuaz', style: 'titulo' },
      { text: 'Cuarta etapa · CEINYS Constructora e Inmobiliaria', style: 'subtitulo' },

      {
        columns: [
          { text: [{ text: 'Código: ', bold: true }, codigoCotizacion] },
          { text: [{ text: 'Emitido: ', bold: true }, formatearFechaLarga(fechaEmision)], alignment: 'right' },
        ],
      },
      {
        columns: [
          { text: [{ text: 'Vendedor: ', bold: true }, vendedor || '—'] },
          { text: [{ text: 'Vigente hasta: ', bold: true }, formatearFecha(vigenciaHasta)], alignment: 'right' },
        ],
        margin: [0, 2, 0, 14] as [number, number, number, number],
      },

      { text: 'Datos del cliente', style: 'seccion' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            ['Nombre', cliente.nombre],
            ['Documento', cliente.documento],
            ['Teléfono', cliente.telefono],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 4, 0, 14] as [number, number, number, number],
      },

      { text: 'Lote', style: 'seccion' },
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            ['Código', 'Ubicación', 'Área', 'Entrega física'],
            [lote.codigo_lote, lote.codigo_ubicacion, `${lote.area_m2} m²`, String(lote.entrega_fisica)],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 4, 0, 14] as [number, number, number, number],
      },

      { text: 'Plan de pagos', style: 'seccion' },
      {
        table: { widths: ['60%', '40%'], body: filasPlan },
        layout: 'lightHorizontalLines',
        margin: [0, 4, 0, 10] as [number, number, number, number],
      },
      {
        text: `${resultado.nCuotas - 1} cuotas de ${formatearMoneda(resultado.cuotaMensual)} · última cuota ${formatearMoneda(resultado.cuotaFinal)}`,
        style: 'destacado',
      },

      {
        text:
          'Esta cotización es referencial y no constituye separación ni reserva del lote. ' +
          'La separación se formaliza directamente con el área de ventas de CEINYS.',
        style: 'leyenda',
      },
    ],
    styles: {
      titulo: { fontSize: 18, bold: true },
      subtitulo: { fontSize: 10, color: '#666666', margin: [0, 0, 0, 10] },
      seccion: { fontSize: 12, bold: true, color: '#0E708F', margin: [0, 10, 0, 2] },
      destacado: { fontSize: 13, bold: true, margin: [0, 4, 0, 16] },
      leyenda: { fontSize: 8, italics: true, color: '#888888', margin: [0, 8, 0, 0] },
    },
    defaultStyle: { fontSize: 10 },
  };
}

export function abrirPdf(doc: TDocumentDefinitions): void {
  pdfMake.createPdf(doc).open();
}

export function descargarPdf(doc: TDocumentDefinitions, nombreArchivo: string): void {
  pdfMake.createPdf(doc).download(nombreArchivo);
}

export function obtenerBlobPdf(doc: TDocumentDefinitions): Promise<Blob> {
  return new Promise((resolve) => {
    pdfMake.createPdf(doc).getBlob((blob: Blob) => resolve(blob));
  });
}
