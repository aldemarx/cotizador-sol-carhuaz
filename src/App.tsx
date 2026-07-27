import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { sincronizarSiNecesario } from './data/sincronizar';
import Header from './components/Header';
import BuscarLotePage from './features/cotizador/BuscarLotePage';
import CotizadorLayout from './features/cotizador/CotizadorLayout';
import FichaLotePage from './features/cotizador/FichaLotePage';
import PlanPage from './features/cotizador/PlanPage';
import ClientePage from './features/cotizador/ClientePage';
import PdfPage from './features/cotizador/PdfPage';

export default function App() {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    sincronizarSiNecesario().then(() => setListo(true));
  }, []);

  return (
    <>
      <Header />
      {!listo ? (
        <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Cargando datos del proyecto…</p>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/buscar" replace />} />
          <Route path="/buscar" element={<BuscarLotePage />} />
          <Route path="/lote/:codigo" element={<CotizadorLayout />}>
            <Route index element={<FichaLotePage />} />
            <Route path="plan" element={<PlanPage />} />
            <Route path="cliente" element={<ClientePage />} />
            <Route path="pdf" element={<PdfPage />} />
          </Route>
        </Routes>
      )}
    </>
  );
}
