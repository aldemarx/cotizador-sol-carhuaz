const REDES = [
  {
    nombre: 'Instagram',
    href: 'https://www.instagram.com/ceinys.inmobiliaria/',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    nombre: 'Facebook',
    href: 'https://www.facebook.com/ceinys.inmobiliaria',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M15 3h-2a3.5 3.5 0 00-3.5 3.5V9H7v3h2.5v9h3v-9H15l.5-3h-3V7a1 1 0 011-1H15V3z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    nombre: 'TikTok',
    href: 'https://www.tiktok.com/@ceinysinmobiliaria',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M14 3v11a3 3 0 11-3-3" />
        <path d="M14 3c.5 2.2 2.3 4 4.5 4.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    nombre: 'LinkedIn',
    href: 'https://www.linkedin.com/company/ceinys-inmobiliaria/?originalSubdomain=pe',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 10v7M7 7v.5M11 17v-4a2.5 2.5 0 015 0v4M11 17v-7" strokeLinecap="round" />
      </svg>
    ),
  },
];

/**
 * Mismo header que Ceinys_Panel_Precios: barra blanca (logo + redes) y
 * cintillo naranja debajo (Marketing & Ventas · Familia Ceinys + tag).
 * Mantener ambas copias visualmente identicas si se vuelve a tocar el diseño.
 */
export default function Header() {
  return (
    <>
      <div className="bg-white shadow-[0_1px_2px_rgba(20,22,28,0.05),0_1px_0_rgba(20,22,28,0.02)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-5">
          <img src="/images/logoCeinys2.png" alt="CEINYS" className="block h-7 sm:h-9" />
          <div className="flex gap-1.5 sm:gap-2">
            {REDES.map((red) => (
              <a
                key={red.nombre}
                href={red.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={red.nombre}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-cian-600 hover:text-white sm:h-8 sm:w-8"
              >
                <span className="h-3.5 w-3.5 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-[1.8]">{red.svg}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-naranja-500">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2.5 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4">
          <p className="m-0 flex items-center gap-2 uppercase">
            <span className="text-[0.68rem] font-medium tracking-wide text-white/80 sm:text-[0.78rem]">
              Marketing &amp; Ventas
            </span>
            <span className="text-[0.68rem] text-white/45 sm:text-[0.78rem]">·</span>
            <span className="text-[0.72rem] font-extrabold tracking-wide text-white sm:text-[0.82rem]">
              Familia Ceinys
            </span>
          </p>
          <span className="whitespace-nowrap rounded-full border border-white/30 bg-white/[0.14] px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white sm:px-3.5 sm:text-[0.7rem]">
            Uso interno
          </span>
        </div>
      </div>
    </>
  );
}
