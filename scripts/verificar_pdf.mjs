import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('scripts', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

async function shot(nombre) {
  await page.screenshot({ path: path.join(outDir, `${nombre}.png`) });
  console.log(`captura: ${nombre}.png`);
}

await page.goto('http://localhost:5173/buscar');
await page.fill('input[placeholder*="código"]', '245A-01');
await page.click('text=245A-01');
await page.waitForSelector('text=Elegir plan de pagos');
await page.click('text=Elegir plan de pagos');
await page.waitForSelector('text=Continuar con los datos del cliente');
await page.click('text=Continuar con los datos del cliente');
await page.waitForSelector('text=Datos del cliente');

await page.fill('input[name="vendedor"]', 'Juan Perez');
await page.fill('input[name="nombre"]', 'Maria Lopez');
await page.fill('input[name="documento"]', '12345678');
await page.fill('input[name="telefono"]', '987654321');
await shot('6-cliente-lleno');

await page.click('text=Generar cotización');
await page.waitForSelector('text=Cotización generada');
await shot('7-pdf-pantalla');

const textoPdfPage = await page.textContent('body');
console.log('--- contiene codigo SC-:', /SC-\d{8}-\d{4}/.test(textoPdfPage));
console.log('--- contiene Maria Lopez:', textoPdfPage.includes('Maria Lopez'));
console.log('--- contiene 74 cuotas de S/ 293.17:', textoPdfPage.includes('293.17'));

// Probar que "Descargar PDF" realmente dispara una descarga (confirma que pdfmake genero el PDF sin tirar error)
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 10000 }),
  page.click('text=Descargar PDF'),
]);
const rutaDescarga = path.join(outDir, 'cotizacion-generada.pdf');
await download.saveAs(rutaDescarga);
const tamano = fs.statSync(rutaDescarga).size;
console.log('--- PDF descargado, bytes:', tamano);
console.log('--- es PDF valido (empieza con %PDF):', fs.readFileSync(rutaDescarga, { encoding: 'latin1', flag: 'r' }).startsWith('%PDF'));

console.log('--- errores de consola:', JSON.stringify(consoleErrors));

await browser.close();
