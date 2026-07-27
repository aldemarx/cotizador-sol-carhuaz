import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCotizacionEnCurso } from './CotizacionContext';
import { calcularNumeroCuotas } from '../../motor/reglas';
import { formatearMoneda } from '../../lib/formato';

export default function PlanPage() {
  const { lote, parametros, nCuotas, setNCuotas, descuentoEspecial, setDescuentoEspecial, resultado } =
    useCotizacionEnCurso();
  const navigate = useNavigate();
  const [cuotaDeseada, setCuotaDeseada] = useState('');

  if (!lote || !resultado) return null;

  const excedeTope = descuentoEspecial > parametros.descuento_max_vendedor;

  function aplicarCalculoInverso() {
    const monto = Number(cuotaDeseada);
    if (!monto || monto <= 0 || !resultado) return;
    const n = calcularNumeroCuotas(resultado.saldo, monto, parametros);
    setNCuotas(n);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <button
        type="button"
        onClick={() => navigate(`/lote/${lote.codigo_lote}`)}
        className="mb-3 text-sm text-cian-700"
      >
        ← Volver a la ficha
      </button>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Plan de pagos — {lote.codigo_lote}</h1>

        <label className="mt-4 block text-sm font-medium text-slate-700">Número de cuotas</label>
        <div className="mt-1 flex gap-2">
          <input
            type="number"
            min={parametros.cuotas_min}
            max={parametros.cuotas_max}
            value={nCuotas}
            onChange={(e) => setNCuotas(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
          />
          <button
            type="button"
            onClick={() => setNCuotas(Number(parametros.cuotas_referencia))}
            className="whitespace-nowrap rounded-lg border border-cian-600 px-4 text-sm font-semibold text-cian-700 hover:bg-cian-500/10"
          >
            {parametros.cuotas_referencia} (estándar)
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Entre {parametros.cuotas_min} y {parametros.cuotas_max} cuotas.
        </p>

        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <label className="block text-sm font-medium text-slate-700">¿Cuánto puede pagar el cliente al mes?</label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              value={cuotaDeseada}
              onChange={(e) => setCuotaDeseada(e.target.value)}
              placeholder="Ej. 300"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-base focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
            />
            <button
              type="button"
              onClick={aplicarCalculoInverso}
              className="whitespace-nowrap rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Calcular plazo
            </button>
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">Descuento especial</label>
        <input
          type="number"
          min={0}
          value={descuentoEspecial}
          onChange={(e) => setDescuentoEspecial(Number(e.target.value))}
          className={`mt-1 w-full rounded-lg border px-4 py-3 text-base focus:outline-none focus:ring-1 ${
            excedeTope
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-cian-600 focus:ring-cian-600'
          }`}
        />
        {excedeTope && (
          <p className="mt-1 text-xs font-medium text-red-600">
            Supera el tope de {formatearMoneda(parametros.descuento_max_vendedor)} — requiere autorización.
          </p>
        )}

        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Saldo a financiar</span>
            <span className="font-semibold text-slate-900">{formatearMoneda(resultado.saldo)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-slate-500">
              {resultado.nCuotas - 1} cuotas de
            </span>
            <span className="font-bold text-slate-900">{formatearMoneda(resultado.cuotaMensual)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-slate-500">Última cuota</span>
            <span className="font-bold text-slate-900">{formatearMoneda(resultado.cuotaFinal)}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={excedeTope}
          onClick={() => navigate(`/lote/${lote.codigo_lote}/cliente`)}
          className="mt-6 w-full rounded-lg bg-cian-700 py-3 font-semibold text-white shadow-sm hover:bg-cian-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Continuar con los datos del cliente
        </button>
      </div>
    </div>
  );
}
