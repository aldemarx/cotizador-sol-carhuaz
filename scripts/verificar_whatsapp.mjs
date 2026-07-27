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

await page.goto('http://localhost:5173/buscar');
await page.fill('input[placeholder*="código"]', '245A-01');
await page.click('text=245A-01');
await page.click('text=Elegir plan de pagos');
await page.click('text=Continuar con los datos del cliente');
await page.fill('input[name="vendedor"]', 'Juan Perez');
await page.fill('input[name="nombre"]', 'Maria Lopez');
await page.fill('input[name="documento"]', '12345678');
await page.fill('input[name="telefono"]', '987654321');
await page.click('text=Generar cotización');
await page.waitForSelector('text=Cotización generada');

console.log('--- soporta Web Share con archivos:', await page.evaluate(() => {
  try {
    const f = new File(['x'], 'x.pdf', { type: 'application/pdf' });
    return !!(navigator.canShare && navigator.canShare({ files: [f] }));
  } catch { return false; }
}));

const [popup, download] = await Promise.all([
  context.waitForEvent('page', { timeout: 10000 }).catch(() => null),
  page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
  page.click('text=Enviar por WhatsApp'),
]);

await page.waitForTimeout(500);
await page.screenshot({ path: path.join(outDir, '8-whatsapp-respaldo.png') });

console.log('--- se abrio pestaña nueva:', !!popup, popup ? popup.url() : '(ninguna)');
console.log('--- se disparo descarga:', !!download, download ? download.suggestedFilename() : '(ninguna)');
console.log('--- errores de consola:', JSON.stringify(consoleErrors));

await browser.close();
