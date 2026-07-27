import { useNavigate } from 'react-router-dom';
import { useCotizacionEnCurso } from './CotizacionContext';
import { formatearMoneda } from '../../lib/formato';

export default function FichaLotePage() {
  const { lote, resultado } = useCotizacionEnCurso();
  const navigate = useNavigate();

  if (!lote || !resultado) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <button type="button" onClick={() => navigate('/buscar')} className="mb-3 text-sm text-cian-700">
        ← Volver a buscar
      </button>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{lote.codigo_lote}</h1>
        <p className="text-sm text-slate-500">
          {lote.codigo_ubicacion} · Mz. {lote.manzana}, Lote {lote.lote}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Área</dt>
            <dd className="font-semibold text-slate-900">{lote.area_m2} m²</dd>
          </div>
          <div>
            <dt className="text-slate-500">Medida de frente</dt>
            <dd className="font-semibold text-slate-900">{lote.medida_frente}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Entrega física</dt>
            <dd className="font-semibold text-slate-900">{lote.entrega_fisica}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Ubicación</dt>
            <dd className="font-semibold text-slate-900">{lote.codigo_ubicacion}</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Precio total</span>
            <span className="font-semibold text-slate-900">{formatearMoneda(resultado.precioTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Precio con descuento</span>
            <span className="font-semibold text-slate-900">{formatearMoneda(resultado.precioConDescuento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Precio al contado</span>
            <span className="font-semibold text-naranja-600">{formatearMoneda(resultado.precioContado)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/lote/${lote.codigo_lote}/plan`)}
          className="mt-6 w-full rounded-lg bg-cian-700 py-3 font-semibold text-white shadow-sm hover:bg-cian-600"
        >
          Elegir plan de pagos
        </button>
      </div>
    </div>
  );
}
