import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarLotes, listaVigente, listarLotesDisponibles, obtenerParametros } from '../../data/repositorio';
import type { Lote, ParametrosSeed } from '../../data/tipos';
import { calcularCotizacion, calcularNumeroCuotas } from '../../motor/reglas';
import { formatearFecha, formatearMoneda } from '../../lib/formato';

export default function CotizadorPage() {
  const navigate = useNavigate();
  const [parametros, setParametros] = useState<ParametrosSeed | null>(null);
  const [vigente, setVigente] = useState(true);
  const [totalDisponibles, setTotalDisponibles] = useState(0);
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Lote[]>([]);
  const [lote, setLote] = useState<Lote | null>(null);
  const [nCuotas, setNCuotas] = useState(0);
  const [descuentoEspecial, setDescuentoEspecial] = useState(0);
  const [cuotaDeseada, setCuotaDeseada] = useState('');

  useEffect(() => {
    obtenerParametros().then((p) => {
      setParametros(p);
      setNCuotas(Number(p.cuotas_referencia));
    });
    listaVigente().then(setVigente);
    listarLotesDisponibles().then((lotes) => setTotalDisponibles(lotes.length));
  }, []);

  useEffect(() => {
    let vigenteEfecto = true;
    buscarLotes(query).then((r) => {
      if (vigenteEfecto) setResultados(r);
    });
    return () => {
      vigenteEfecto = false;
    };
  }, [query]);

  const resultado = useMemo(() => {
    if (!lote || !parametros) return null;
    try {
      return calcularCotizacion(
        {
          areaM2: lote.area_m2,
          precioM2: lote.precio_m2,
          precioTotalOverride: lote.precio_total_override,
        },
        parametros,
        nCuotas,
        descuentoEspecial,
      );
    } catch {
      return null;
    }
  }, [lote, parametros, nCuotas, descuentoEspecial]);

  if (!parametros) return null;

  const excedeTope = descuentoEspecial > parametros.descuento_max_vendedor;

  function elegirLote(l: Lote) {
    setLote(l);
    setQuery('');
    setResultados([]);
    setNCuotas(Number(parametros!.cuotas_referencia));
    setDescuentoEspecial(0);
    setCuotaDeseada('');
  }

  function aplicarCalculoInverso() {
    const monto = Number(cuotaDeseada);
    if (!monto || monto <= 0 || !resultado || !parametros) return;
    setNCuotas(calcularNumeroCuotas(resultado.saldo, monto, parametros));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4">
          <h1 className="text-xl font-bold text-slate-900">Cotizador Sol de Carhuaz</h1>
          <p className="text-sm text-slate-500">
            {totalDisponibles} lotes disponibles · vigente hasta {formatearFecha(parametros.vigencia_hasta)}
          </p>
          {!vigente && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              La lista de precios cacheada venció. Conéctate a internet para actualizarla antes de cotizar.
            </p>
          )}
        </header>

        <div className="relative">
          <input
            autoFocus
            inputMode="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe la ubicación (ej. 245A-01)"
            className="w-full rounded-lg border border-slate-300 px-4 py-4 text-lg shadow-sm focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
          />
          {resultados.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full divide-y divide-slate-200 rounded-lg bg-white shadow-lg">
              {resultados.map((l) => (
                <li key={l.codigo_lote}>
                  <button
                    type="button"
                    onClick={() => elegirLote(l)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <span className="font-semibold text-slate-900">{l.codigo_lote}</span>
                    <span className="text-xs text-slate-500">
                      {l.codigo_ubicacion} · {l.area_m2} m²
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!lote ? (
          <p className="mt-10 text-center text-sm text-slate-400">
            Escribe un código de lote arriba para ver su tarjeta de precios al instante.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-extrabold text-slate-900">{lote.codigo_lote}</h2>
                <span className="text-sm font-medium text-slate-500">
                  Mz. {lote.manzana} · Lote {lote.lote}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">Metraje</dt>
                  <dd className="font-semibold text-slate-900">{lote.area_m2} m²</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Ubicación</dt>
                  <dd className="font-semibold text-slate-900">{lote.codigo_ubicacion}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Entrega</dt>
                  <dd className="font-semibold text-slate-900">{lote.entrega_fisica}</dd>
                </div>
              </dl>

              {resultado && (
                <>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                    <span className="text-slate-500">Precio de lista</span>
                    <span className="font-semibold text-slate-700">{formatearMoneda(resultado.precioTotal)}</span>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-cian-700">Financiamiento</p>

                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        min={parametros.cuotas_min}
                        max={parametros.cuotas_max}
                        value={nCuotas}
                        onChange={(e) => setNCuotas(Number(e.target.value))}
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-center text-base font-semibold focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
                      />
                      <button
                        type="button"
                        onClick={() => setNCuotas(Number(parametros.cuotas_referencia))}
                        className="whitespace-nowrap rounded-lg border border-cian-600 px-3 text-xs font-semibold text-cian-700 hover:bg-cian-500/10"
                      >
                        {parametros.cuotas_referencia} estándar
                      </button>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="number"
                        value={cuotaDeseada}
                        onChange={(e) => setCuotaDeseada(e.target.value)}
                        placeholder="¿Cuánto puede pagar al mes?"
                        className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
                      />
                      <button
                        type="button"
                        onClick={aplicarCalculoInverso}
                        className="whitespace-nowrap rounded-lg bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-700"
                      >
                        Calcular
                      </button>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">{resultado.nCuotas - 1} cuotas de</p>
                        <p className="text-4xl font-extrabold text-slate-900">
                          {formatearMoneda(resultado.cuotaMensual)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Última cuota</p>
                        <p className="text-lg font-bold text-slate-700">{formatearMoneda(resultado.cuotaFinal)}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                      <span className="text-slate-500">Saldo a financiar</span>
                      <span className="font-semibold text-slate-900">{formatearMoneda(resultado.saldo)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Precio al contado</span>
                    <span className="font-bold text-naranja-600">{formatearMoneda(resultado.precioContado)}</span>
                  </div>

                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-slate-500">Descuento especial</summary>
                    <input
                      type="number"
                      min={0}
                      value={descuentoEspecial}
                      onChange={(e) => setDescuentoEspecial(Number(e.target.value))}
                      className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        excedeTope
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                          : 'border-slate-300 focus:border-cian-600 focus:ring-cian-600'
                      }`}
                    />
                    {excedeTope && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        Supera el tope de {formatearMoneda(parametros.descuento_max_vendedor)} — requiere
                        autorización.
                      </p>
                    )}
                  </details>

                  <button
                    type="button"
                    disabled={excedeTope}
                    onClick={() =>
                      navigate(`/lote/${lote.codigo_lote}/cliente`, { state: { nCuotas, descuentoEspecial } })
                    }
                    className="mt-5 w-full rounded-lg bg-cian-700 py-3 font-semibold text-white shadow-sm hover:bg-cian-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Continuar con datos del cliente
                  </button>
                </>
              )}
            </div>

            <div className="hidden overflow-hidden rounded-2xl bg-gradient-to-br from-cian-700 via-cian-600 to-naranja-500 p-6 text-white shadow-md lg:flex lg:flex-col lg:justify-end">
              <p className="text-sm font-medium uppercase tracking-wide text-white/80">Sol de Carhuaz</p>
              <p className="text-sm text-white/70">{parametros.etapa}</p>
              <p className="mt-6 text-4xl font-extrabold">{lote.codigo_lote}</p>
              <p className="mt-1 text-sm text-white/80">Espacio reservado para foto promocional del proyecto</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
