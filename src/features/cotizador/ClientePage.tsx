import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCotizacionEnCurso } from './CotizacionContext';
import { guardarVendedor } from '../../lib/vendedor';

const esquemaCliente = z.object({
  vendedor: z.string().trim().min(3, 'Ingresa tu nombre'),
  nombre: z.string().trim().min(3, 'Ingresa el nombre completo'),
  documento: z.string().trim().min(8, 'DNI/RUC inválido').max(11, 'DNI/RUC inválido'),
  telefono: z.string().trim().min(9, 'Teléfono inválido'),
});

type FormularioCliente = z.infer<typeof esquemaCliente>;

export default function ClientePage() {
  const { lote, cliente, setCliente, vendedor, setVendedor, generarCodigo } = useCotizacionEnCurso();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioCliente>({
    resolver: zodResolver(esquemaCliente),
    defaultValues: { vendedor, ...(cliente ?? { nombre: '', documento: '', telefono: '' }) },
  });

  if (!lote) return null;

  function onSubmit(datos: FormularioCliente) {
    const { vendedor: nombreVendedor, ...datosCliente } = datos;
    setCliente(datosCliente);
    setVendedor(nombreVendedor);
    guardarVendedor(nombreVendedor);
    generarCodigo();
    navigate(`/lote/${lote!.codigo_lote}/pdf`);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <button type="button" onClick={() => navigate('/')} className="mb-3 text-sm text-cian-700">
        ← Volver al cotizador
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg bg-white p-4 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Datos del cliente</h1>

        <label className="mt-4 block text-sm font-medium text-slate-700">Tu nombre (vendedor)</label>
        <input
          {...register('vendedor')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
        />
        {errors.vendedor && <p className="mt-1 text-xs text-red-600">{errors.vendedor.message}</p>}

        <hr className="my-4 border-slate-200" />

        <label className="block text-sm font-medium text-slate-700">Nombre completo del cliente</label>
        <input
          {...register('nombre')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
        />
        {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}

        <label className="mt-4 block text-sm font-medium text-slate-700">DNI / RUC</label>
        <input
          {...register('documento')}
          inputMode="numeric"
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
        />
        {errors.documento && <p className="mt-1 text-xs text-red-600">{errors.documento.message}</p>}

        <label className="mt-4 block text-sm font-medium text-slate-700">Teléfono</label>
        <input
          {...register('telefono')}
          inputMode="tel"
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-cian-600 focus:outline-none focus:ring-1 focus:ring-cian-600"
        />
        {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono.message}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-cian-700 py-3 font-semibold text-white shadow-sm hover:bg-cian-600"
        >
          Generar cotización
        </button>
      </form>
    </div>
  );
}
