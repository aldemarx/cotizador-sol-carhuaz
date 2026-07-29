import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Lote, DatosCliente, ParametrosSeed } from '../../data/tipos';
import { calcularCotizacion, type ResultadoCotizacion } from '../../motor/reglas';
import { obtenerVendedorGuardado } from '../../lib/vendedor';
import { generarCodigoCotizacion } from '../../lib/codigoCotizacion';

interface CotizacionEnCurso {
  lote: Lote | null;
  setLote: (lote: Lote | null) => void;
  parametros: ParametrosSeed;
  nCuotas: number;
  setNCuotas: (n: number) => void;
  descuentoEspecial: number;
  setDescuentoEspecial: (monto: number) => void;
  cliente: DatosCliente | null;
  setCliente: (cliente: DatosCliente) => void;
  vendedor: string;
  setVendedor: (nombre: string) => void;
  resultado: ResultadoCotizacion | null;
  codigoCotizacion: string | null;
  fechaEmision: Date | null;
  generarCodigo: () => void;
}

const CotizacionContext = createContext<CotizacionEnCurso | null>(null);

export function CotizacionProvider({
  parametros,
  inicial,
  children,
}: {
  parametros: ParametrosSeed;
  inicial?: { nCuotas?: number; descuentoEspecial?: number };
  children: ReactNode;
}) {
  const [lote, setLote] = useState<Lote | null>(null);
  const [nCuotas, setNCuotas] = useState<number>(inicial?.nCuotas ?? Number(parametros.cuotas_referencia));
  const [descuentoEspecial, setDescuentoEspecial] = useState<number>(inicial?.descuentoEspecial ?? 0);
  const [cliente, setCliente] = useState<DatosCliente | null>(null);
  const [vendedor, setVendedor] = useState<string>(() => obtenerVendedorGuardado());
  const [codigoCotizacion, setCodigoCotizacion] = useState<string | null>(null);
  const [fechaEmision, setFechaEmision] = useState<Date | null>(null);

  /**
   * Genera el codigo de cotizacion una sola vez, como respuesta directa a la
   * accion del usuario (boton "Generar cotizacion" en ClientePage) -- no
   * dentro de un render/useMemo, donde React StrictMode podria invocarlo
   * dos veces en desarrollo y disparar el efecto secundario (incrementar
   * el contador local) mas de una vez.
   */
  function generarCodigo() {
    const fecha = new Date();
    setFechaEmision(fecha);
    setCodigoCotizacion(generarCodigoCotizacion(fecha));
  }

  const resultado = useMemo(() => {
    if (!lote) return null;
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

  const value: CotizacionEnCurso = {
    lote,
    setLote,
    parametros,
    nCuotas,
    setNCuotas,
    descuentoEspecial,
    setDescuentoEspecial,
    cliente,
    setCliente,
    vendedor,
    setVendedor,
    resultado,
    codigoCotizacion,
    fechaEmision,
    generarCodigo,
  };

  return <CotizacionContext.Provider value={value}>{children}</CotizacionContext.Provider>;
}

export function useCotizacionEnCurso(): CotizacionEnCurso {
  const ctx = useContext(CotizacionContext);
  if (!ctx) {
    throw new Error('useCotizacionEnCurso debe usarse dentro de <CotizacionProvider>');
  }
  return ctx;
}
