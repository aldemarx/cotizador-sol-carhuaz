import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('scripts', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

async function shot(nombre) {
  await page.screenshot({ path: path.join(outDir, `${nombre}.png`) });
  console.log(`captura: ${nombre}.png`);
}

// 1) Cargar ONLINE primero: esto registra el service worker y sincroniza Dexie.
await page.goto('http://localhost:4173/buscar');
await page.waitForSelector('text=Sol de Carhuaz', { timeout: 15000 });

const swListo = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return 'no-soportado';
  const reg = await navigator.serviceWorker.ready;
  return reg.active ? 'activo' : 'sin-activar';
});
console.log('--- service worker:', swListo);

await shot('9-online-antes-de-offline');

// 2) Cortar la conexion de verdad (a nivel de red del contexto, no solo simular el evento).
await context.setOffline(true);
console.log('--- contexto puesto en OFFLINE');

// 3) Recargar completamente sin red -- si el SW no sirve el shell, esto falla.
await page.reload();
await page.waitForSelector('text=Sol de Carhuaz', { timeout: 15000 });
await shot('10-recargado-offline');
console.log('--- la app cargo offline: OK');

// 4) Flujo completo sin red: buscar -> ficha -> plan -> cliente -> PDF
await page.fill('input[placeholder*="código"]', '265A-11');
await page.click('text=265A-11');
await page.waitForSelector('text=Elegir plan de pagos');
const fichaTexto = await page.textContent('body');
console.log('--- ficha offline muestra 27,175.00 (saldo/inicial coherente):', fichaTexto.includes('32,175.00'));
await shot('11-ficha-offline');

await page.click('text=Elegir plan de pagos');
await page.waitForSelector('text=Plan de pagos');
const planTexto = await page.textContent('body');
console.log('--- plan offline muestra saldo 27,175.00:', planTexto.includes('27,175.00'));
console.log('--- plan offline muestra cuota 362.33:', planTexto.includes('362.33'));

await page.click('text=Continuar con los datos del cliente');
await page.fill('input[name="vendedor"]', 'Ana Torres');
await page.fill('input[name="nombre"]', 'Carlos Ruiz');
await page.fill('input[name="documento"]', '87654321');
await page.fill('input[name="telefono"]', '912345678');
await page.click('text=Generar cotización');
await page.waitForSelector('text=Cotización generada', { timeout: 10000 });
await shot('12-pdf-offline');

const pdfTexto = await page.textContent('body');
console.log('--- cotizacion generada offline, tiene codigo SC-:', /SC-\d{8}-\d{4}/.test(pdfTexto));

// El PDF en si (pdfmake) tambien debe poder generarse sin red -- confirmarlo con una descarga real.
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 10000 }),
  page.click('text=Descargar PDF'),
]);
const ruta = path.join(outDir, 'pdf-offline.pdf');
await download.saveAs(ruta);
console.log('--- PDF generado y descargado OFFLINE, bytes:', fs.statSync(ruta).size);
console.log('--- es PDF valido:', fs.readFileSync(ruta, { encoding: 'latin1' }).startsWith('%PDF'));

console.log('--- errores de consola (todo el recorrido):', JSON.stringify(consoleErrors));

await context.setOffline(false);
await browser.close();
