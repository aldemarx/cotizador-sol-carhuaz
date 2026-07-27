import { describe, it, expect } from 'vitest';
import { calcularCotizacion, calcularNumeroCuotas, redondear2, RangoCuotasInvalidoError } from './reglas';
import contrato from './reglas.contrato.json';

const { parametros, casos } = contrato;

describe('calcularCotizacion — casos de contrato (lotes reales de Sol de Carhuaz)', () => {
  for (const caso of casos) {
    it(`${caso.codigo_lote} con ${caso.nCuotas} cuotas reproduce el Excel con desviacion 0`, () => {
      const resultado = calcularCotizacion(
        { areaM2: caso.areaM2, precioM2: caso.precioM2 },
        parametros,
        caso.nCuotas,
      );

      expect(resultado.precioConDescuento).toBe(caso.esperado.precioConDescuento);
      expect(resultado.precioTotal).toBe(caso.esperado.precioTotal);
      expect(resultado.precioContado).toBe(caso.esperado.precioContado);
      expect(resultado.saldo).toBe(caso.esperado.saldo);
      expect(resultado.cuotaMensual).toBe(caso.esperado.cuotaMensual);
      expect(resultado.cuotaFinal).toBe(caso.esperado.cuotaFinal);
    });
  }
});

describe('invariantes (deben cumplirse para cualquier lote y cualquier plazo)', () => {
  for (const caso of casos) {
    for (const nCuotas of [1, 3, 75, 80]) {
      it(`${caso.codigo_lote} a ${nCuotas} cuotas: la suma de cuotas iguala el saldo exacto`, () => {
        const r = calcularCotizacion({ areaM2: caso.areaM2, precioM2: caso.precioM2 }, parametros, nCuotas);
        const sumaTotal = redondear2((nCuotas - 1) * r.cuotaMensual + r.cuotaFinal);
        expect(sumaTotal).toBe(r.saldo);
      });

      it(`${caso.codigo_lote} a ${nCuotas} cuotas: la ultima cuota esta dentro de +/- n centimos de las regulares`, () => {
        const r = calcularCotizacion({ areaM2: caso.areaM2, precioM2: caso.precioM2 }, parametros, nCuotas);
        const diferencia = Math.abs(redondear2(r.cuotaFinal - r.cuotaMensual));
        // n centimos = n * 0.01, con margen para el redondeo del propio calculo
        expect(diferencia).toBeLessThanOrEqual(redondear2(nCuotas * 0.01 + 0.01));
      });
    }
  }
});

describe('casos de borde de plazo libre', () => {
  const lote = { areaM2: casos[0].areaM2, precioM2: casos[0].precioM2 };

  it('n=1: una sola cuota que paga todo el saldo', () => {
    const r = calcularCotizacion(lote, parametros, 1);
    expect(r.cuotaFinal).toBe(r.saldo);
    expect(r.cuotaMensual).toBe(r.saldo);
  });

  it('n=80: el maximo de cuotas permitido', () => {
    const r = calcularCotizacion(lote, parametros, 80);
    expect(r.nCuotas).toBe(80);
    expect(redondear2(79 * r.cuotaMensual + r.cuotaFinal)).toBe(r.saldo);
  });

  it('rechaza un numero de cuotas fuera de rango (min/max del parametro)', () => {
    expect(() => calcularCotizacion(lote, parametros, 0)).toThrow(RangoCuotasInvalidoError);
    expect(() => calcularCotizacion(lote, parametros, 81)).toThrow(RangoCuotasInvalidoError);
  });
});

describe('precio_total_override (excepcion documentada en seccion 4)', () => {
  it('cuando el lote tiene override, ese valor manda sobre area*precio_m2', () => {
    // Caso sintetico: ningun lote real de Sol tiene override hoy (todos en null),
    // pero la regla debe funcionar cuando exista.
    const loteConOverride = { areaM2: 100, precioM2: 999, precioTotalOverride: 30000 };
    const r = calcularCotizacion(loteConOverride, parametros, 75);

    expect(r.precioTotal).toBe(30000);
    expect(r.precioConDescuento).toBe(30000 - parametros.cargo_fijo);
    expect(r.saldo).toBe(r.precioConDescuento - parametros.inicial);
  });
});

describe('descuentoEspecial (rebaja adicional negociada por el vendedor)', () => {
  it('reduce el saldo y por lo tanto la cuota, sin tocar precioTotal ni precioContado', () => {
    const caso = casos[0];
    const lote = { areaM2: caso.areaM2, precioM2: caso.precioM2 };
    const sinDescuento = calcularCotizacion(lote, parametros, 75, 0);
    const conDescuento = calcularCotizacion(lote, parametros, 75, 500);

    expect(conDescuento.saldo).toBe(redondear2(sinDescuento.saldo - 500));
    expect(conDescuento.precioTotal).toBe(sinDescuento.precioTotal);
    expect(conDescuento.precioContado).toBe(sinDescuento.precioContado);
    expect(conDescuento.descuentoEspecial).toBe(500);
    expect(redondear2(74 * conDescuento.cuotaMensual + conDescuento.cuotaFinal)).toBe(conDescuento.saldo);
  });
});

describe('calcularNumeroCuotas (calculo inverso: cuota deseada -> plazo)', () => {
  it('devuelve un numero de cuotas que se acerca a la cuota deseada', () => {
    const caso = casos[0];
    const r75 = calcularCotizacion({ areaM2: caso.areaM2, precioM2: caso.precioM2 }, parametros, 75);
    const n = calcularNumeroCuotas(r75.saldo, r75.cuotaMensual, parametros);
    expect(n).toBe(75);
  });

  it('respeta el limite maximo de cuotas del parametro', () => {
    const n = calcularNumeroCuotas(21987.5, 10, parametros);
    expect(n).toBe(parametros.cuotas_max);
  });

  it('respeta el limite minimo de cuotas del parametro', () => {
    const n = calcularNumeroCuotas(21987.5, 999999, parametros);
    expect(n).toBe(parametros.cuotas_min);
  });
});
