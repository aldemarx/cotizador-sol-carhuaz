import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { obtenerLote, obtenerParametros } from '../../data/repositorio';
import type { ParametrosSeed } from '../../data/tipos';
import { CotizacionProvider, useCotizacionEnCurso } from './CotizacionContext';

function CargadorDeLote() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { lote, setLote } = useCotizacionEnCurso();

  useEffect(() => {
    if (!codigo) return;
    let vigente = true;
    obtenerLote(codigo).then((encontrado) => {
      if (!vigente) return;
      if (!encontrado) {
        navigate('/', { replace: true });
        return;
      }
      setLote(encontrado);
    });
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  if (!lote) return null;
  return <Outlet />;
}

export default function CotizadorLayout() {
  const [parametros, setParametros] = useState<ParametrosSeed | null>(null);
  const location = useLocation();

  useEffect(() => {
    obtenerParametros().then(setParametros);
  }, []);

  if (!parametros) return null;

  const inicial = location.state as { nCuotas?: number; descuentoEspecial?: number } | undefined;

  return (
    <CotizacionProvider parametros={parametros} inicial={inicial}>
      <CargadorDeLote />
    </CotizacionProvider>
  );
}
