import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCotizacionEnCurso } from './CotizacionContext';
import { construirDocumentoCotizacion, abrirPdf, descargarPdf, obtenerBlobPdf } from '../../lib/pdf';
import { compartirPdf, abrirWhatsAppConTexto } from '../../lib/compartir';
import { guardarCotizacionLocal } from '../../data/repositorio';
import { formatearMoneda } from '../../lib/formato';

export default function PdfPage() {
  const { lote, resultado, cliente, vendedor, parametros, codigoCotizacion, fechaEmision } = useCotizacionEnCurso();
  const navigate = useNavigate();
  const [estadoCompartir, setEstadoCompartir] = useState<'inactivo' | 'enviando' | 'respaldo'>('inactivo');
  const yaGuardada = useRef<string | null>(null);

  // Guarda la cotizacion en la cola local de solo-agregar (Dexie) una sola vez
  // por codigo -- funciona sin conexion, no depende de que exista backend.
  useEffect(() => {
    if (!codigoCotizacion || !fechaEmision || !lote || !resultado || !cliente) return;
    if (yaGuardada.current === codigoCotizacion) return;
    yaGuardada.current = codigoCotizacion;
    guardarCotizacionLocal({
      codigo_cotizacion: codigoCotizacion,
      codigo_lote: lote.codigo_lote,
      vendedor,
      cliente,
      resultado,
      creada_en: fechaEmision.toISOString(),
      sincronizada: 0,
    });
  }, [codigoCotizacion, fechaEmision, lote, resultado, cliente, vendedor]);

  if (!lote || !resultado || !cliente) return null;

  // Si se entra directo a esta URL sin pasar por "Generar cotizacion" (ej. refrescando
  // la pagina), no hay codigo ni fecha emitidos -- se manda de vuelta al formulario.
  if (!codigoCotizacion || !fechaEmision) {
    navigate(`/lote/${lote.codigo_lote}/cliente`, { replace: true });
    return null;
  }

  const doc = construirDocumentoCotizacion({
    codigoCotizacion,
    fechaEmision,
    vigenciaHasta: parametros.vigencia_hasta,
    vendedor,
    cliente,
    lote,
    resultado,
  });

  const nombreArchivo = `Cotizacion-${lote.codigo_lote}-${codigoCotizacion}.pdf`;
  const mensajeWhatsApp = `Hola ${cliente.nombre}, aquí tienes la cotización del lote ${lote.codigo_lote} en Sol de Carhuaz. Cualquier consulta, quedo atento.`;
  const telefonoCliente = cliente.telefono;

  async function compartirPorWhatsApp() {
    setEstadoCompartir('enviando');
    const blob = await obtenerBlobPdf(doc);
    const resultado = await compartirPdf(blob, nombreArchivo, mensajeWhatsApp);

    if (resultado === 'compartido' || resultado === 'cancelado') {
      setEstadoCompartir('inactivo');
      return;
    }

    // Sin soporte de Web Share con archivos (o algo fallo): se descarga el PDF
    // y se abre WhatsApp con el texto ya redactado, para adjuntarlo a mano.
    descargarPdf(doc, nombreArchivo);
    abrirWhatsAppConTexto(mensajeWhatsApp, telefonoCliente);
    setEstadoCompartir('respaldo');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <button
        type="button"
        onClick={() => navigate(`/lote/${lote.codigo_lote}/cliente`)}
        className="mb-3 text-sm text-cian-700"
      >
        ← Volver a datos del cliente
      </button>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Cotización generada</h1>
        <p className="text-sm text-slate-500">
          Código <span className="font-semibold text-slate-700">{codigoCotizacion}</span>
        </p>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-900">{lote.codigo_lote}</p>
          <p className="text-slate-500">
            {cliente.nombre} · {cliente.documento}
          </p>
          <p className="mt-2 text-base font-bold text-slate-900">
            {resultado.nCuotas - 1} cuotas de {formatearMoneda(resultado.cuotaMensual)}
          </p>
          <p className="text-sm text-slate-500">Última cuota {formatearMoneda(resultado.cuotaFinal)}</p>
        </div>

        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Esta cotización es referencial y no constituye separación ni reserva del lote.
        </p>

        <button
          type="button"
          disabled={estadoCompartir === 'enviando'}
          onClick={compartirPorWhatsApp}
          className="mt-6 w-full rounded-lg bg-[#25D366] py-3 font-semibold text-white shadow-sm hover:bg-[#1ebe5a] disabled:opacity-60"
        >
          {estadoCompartir === 'enviando' ? 'Preparando…' : 'Enviar por WhatsApp'}
        </button>
        {estadoCompartir === 'respaldo' && (
          <p className="mt-2 text-xs text-slate-500">
            Se descargó el PDF y se abrió WhatsApp — adjúntalo manualmente al mensaje.
          </p>
        )}

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => abrirPdf(doc)}
            className="rounded-lg border border-cian-600 py-3 font-semibold text-cian-700 hover:bg-cian-500/10"
          >
            Ver PDF
          </button>
          <button
            type="button"
            onClick={() => descargarPdf(doc, nombreArchivo)}
            className="rounded-lg bg-cian-700 py-3 font-semibold text-white hover:bg-cian-600"
          >
            Descargar PDF
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/buscar')}
          className="mt-3 w-full rounded-lg border border-slate-300 py-3 font-semibold text-slate-600 hover:bg-slate-50"
        >
          Nueva cotización
        </button>
      </div>
    </div>
  );
}
