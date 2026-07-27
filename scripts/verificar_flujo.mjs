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

// 1) Buscar
await page.goto('http://localhost:5173/');
await page.waitForSelector('text=Sol de Carhuaz');
await shot('1-buscar');

// 2) Buscar el lote y entrar a la ficha
await page.fill('input[placeholder*="código"]', '245A-01');
await page.waitForSelector('text=245A-01');
await shot('2-buscar-resultado');
await page.click('text=245A-01');

// 3) Ficha del lote
await page.waitForSelector('text=Elegir plan de pagos');
await shot('3-ficha');
const fichaTexto = await page.textContent('body');
console.log('--- contiene 91.95 m2:', fichaTexto.includes('91.95'));
console.log('--- contiene 26,987.50:', fichaTexto.includes('26,987.50'));
console.log('--- contiene 22,987.50:', fichaTexto.includes('22,987.50'));
console.log('--- contiene 22,487.50:', fichaTexto.includes('22,487.50'));

// 4) Plan de pagos
await page.click('text=Elegir plan de pagos');
await page.waitForSelector('text=Plan de pagos');
await shot('4-plan');
const planTexto = await page.textContent('body');
console.log('--- contiene saldo 21,987.50:', planTexto.includes('21,987.50'));
console.log('--- contiene cuota 293.17:', planTexto.includes('293.17'));
console.log('--- contiene ultima cuota 292.92:', planTexto.includes('292.92'));

// 5) Cliente
await page.click('text=Continuar con los datos del cliente');
await page.waitForSelector('text=Datos del cliente');
await shot('5-cliente');

console.log('--- errores de consola:', JSON.stringify(consoleErrors));

await browser.close();
