# Contexto pendiente — Modo rápido para lives de TikTok

> Documento de traspaso. Pégalo en un chat nuevo para retomar esto exactamente donde quedó — no se tocó código, solo se dejó alineada la estrategia.

## Qué existe hoy

El cotizador (`cotizador-sol-carhuaz`, repo `github.com/aldemarx/cotizador-sol-carhuaz`, desplegado en `https://cotizador-sol-carhuaz.vercel.app`, enlazado desde la fila de Sol de Carhuaz en `Ceinys_Panel_Precios`) funciona bien y es offline-first, pero su flujo es un wizard paso a paso: **Buscar → Ficha → Plan → Cliente → PDF**. Es corporativo, prolijo, pensado para cerrar una cotización formal.

## El problema

Los vendedores también cotizan **en vivo, durante transmisiones de TikTok**, mostrando en pantalla muchas ubicaciones/lotes distintos, uno tras otro, frente a audiencia. Ahí necesitan **velocidad** y **lectura a distancia** (números grandes, jerarquía visual fuerte) — no una interfaz prolija pero chica que obligue a varios clics.

## Lo que se necesita construir

Un **modo nuevo, separado del wizard actual**:

1. Un panel donde el vendedor escribe/selecciona la ubicación (código de lote) y ve **al instante** una tarjeta de precios visual — no el paso a paso de Ficha→Plan.
2. Puede cambiar el número de cuotas ahí mismo y ver el recálculo en vivo, sin pasos intermedios.
3. **No pide nombre/DNI/RUC en este modo** — eso se pide recién *después*, cuando el cliente ya se interesó en un lote específico, reutilizando tal cual el flujo de `ClientePage` / `PdfPage` que ya existe hoy.

## Referencia visual

El usuario compartió una captura de un proyecto **externo** (marca "La Rosier / Katarid", sin relación con CEINYS — solo referencia de formato), con este diseño:

- **Columna izquierda**, tipo tabla: Ubicación, Metraje, Ubicación del lote, Manzana, Precio de lista → sección "Financiamiento" con Precio final / Cuota inicial / Saldo a financiar / **Cuotas fijas destacadas en número grande** → Precio al contado → datos del asesor (nombre, teléfono, fecha de vigencia) abajo.
- **Columna derecha**: foto/banner promocional grande, estilo anuncio de redes (no un boceto técnico).

## Cómo aplicarlo (para cuando se retome)

Evaluar entre:
- **(a)** una nueva pantalla/modo dentro de la misma app que fusione Ficha+Plan en una sola vista visual editable en vivo, o
- **(b)** un componente de "tarjeta de cotización" reusable, mostrado en grande.

**El motor de reglas (`src/motor/reglas.ts`) se mantiene intacto** — esto es un cambio de presentación/UX, no de lógica de negocio ni de fórmulas. Las 44 pruebas de contrato que ya existen no deberían necesitar tocarse.

## Estado

**Implementado y promovido a cotizador por defecto.** La tarjeta visual en vivo (`src/features/cotizador/CotizadorPage.tsx`) ahora vive en la ruta raíz `/` bajo el nombre **"Cotizador Sol de Carhuaz"**. El wizard paso a paso original (`BuscarLotePage`, `FichaLotePage`, `PlanPage`) quedó obsoleto y fue eliminado por completo — las rutas viejas (`/buscar`, `/vivo`) redirigen a `/`. `ClientePage`/`PdfPage` siguen intactos y se alcanzan desde la tarjeta al tocar "Continuar con datos del cliente". El motor de reglas y sus 44 pruebas de contrato no se tocaron.

Pendiente: fotos promocionales reales por proyecto para el panel derecho (hoy es un placeholder de marca).
