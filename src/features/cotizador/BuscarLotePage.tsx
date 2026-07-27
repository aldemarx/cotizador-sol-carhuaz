import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarLotes, obtenerParametros, listaVigente, listarLotesDisponibles } from '../../data/repositorio';
import type { Lote, ParametrosSeed } from '../../data/tipos';
import { formatearFecha, formatearMoneda } from '../../lib/formato';

export default function BuscarLotePage() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Lote[]>([]);
  const [parametros, setParametros] = useState<ParametrosSeed | null>(null);
  const [vigente, setVigente] = useState(true);
  const [totalDisponibles, setTotalDisponibles] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerParametros().then(setParametros);
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

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Sol de Carhuaz — cuarta etapa</h1>
        {parametros && (
          <p className="text-sm text-slate-500">
            {totalDisponibles} lotes disponibles · vigente hasta {formatearFecha(parametros.vigencia_hasta)}
          </p>
        )}
        {!vigente && (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            La lista de precios cacheada venció. Conéctate a internet para actualizarla antes de cotizar.
          </p>
        )}
      </header>

      <input
        autoFocus
        inputMode="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por código (ej. 245A-01) o manzana"
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base shadow-sm focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
      />

      <ul className="mt-3 divide-y divide-slate-200 rounded-lg bg-white shadow-sm">
        {resultados.map((lote) => (
          <li key={lote.codigo_lote}>
            <button
              type="button"
              onClick={() => navigate(`/lote/${lote.codigo_lote}`)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-900">{lote.codigo_lote}</p>
                <p className="text-xs text-slate-500">
                  {lote.codigo_ubicacion} · {lote.area_m2} m² · entrega {lote.entrega_fisica}
                </p>
              </div>
              <p className="text-sm font-medium text-cian-700">
                {formatearMoneda(lote.area_m2 * lote.precio_m2)}
              </p>
            </button>
          </li>
        ))}
        {query.trim() !== '' && resultados.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-400">Sin resultados para "{query}"</li>
        )}
      </ul>
    </div>
  );
}
