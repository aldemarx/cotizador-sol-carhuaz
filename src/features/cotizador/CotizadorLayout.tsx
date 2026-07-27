import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
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
        navigate('/buscar', { replace: true });
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

  useEffect(() => {
    obtenerParametros().then(setParametros);
  }, []);

  if (!parametros) return null;

  return (
    <CotizacionProvider parametros={parametros}>
      <CargadorDeLote />
    </CotizacionProvider>
  );
}
