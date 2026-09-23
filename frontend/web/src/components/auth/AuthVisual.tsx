import { Leaf, Route, ShoppingBag, TrendingDown } from "lucide-react"

export function AuthVisual() {
  return (
    <div className="relative hidden overflow-hidden bg-brand-dark lg:flex lg:flex-col lg:justify-between">
      {/* Elegant emerald gradient wash */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 120% at 15% 0%, color-mix(in oklch, var(--brand) 32%, transparent) 0%, transparent 45%), radial-gradient(100% 100% at 100% 100%, color-mix(in oklch, var(--brand-dark-2) 90%, transparent) 0%, transparent 55%), linear-gradient(160deg, var(--brand-dark) 0%, var(--brand-dark-2) 100%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(120% 80% at 50% 0%, black 30%, transparent 80%)",
        }}
      />

      {/* Emerald glow orb */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 size-96 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--brand-glow) 55%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Brand */}
      <header className="relative z-10 flex items-center gap-2.5 p-10">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/30 backdrop-blur-sm">
          <Leaf className="size-5 text-brand" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-white">
          PrecioRuta
        </span>
      </header>

      {/* Headline + glassmorphism card */}
      <div className="relative z-10 flex flex-col gap-10 px-10 pb-4">
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-[1.1] font-extrabold tracking-tight text-balance text-white xl:text-5xl">
            Descubre la ruta más barata para tus compras
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/60">
            Comparamos precios de todos los supermercados en tiempo real para
            que ahorres en cada carrito, sin salir de casa.
          </p>
        </div>

        {/* Glass card */}
        <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-white/80">
              <ShoppingBag className="size-4 text-brand" />
              Carrito semanal
            </span>
            <span className="flex items-center gap-1 rounded-full bg-brand/20 px-2.5 py-1 text-xs font-semibold text-brand ring-1 ring-brand/30">
              <TrendingDown className="size-3.5" />
              -23%
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {[
              { name: "Jumbo", price: "$48.900", best: false },
              { name: "Lider", price: "$44.150", best: false },
              { name: "Unimarc", price: "$37.600", best: true },
            ].map((store) => (
              <div
                key={store.name}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                  store.best
                    ? "bg-brand/20 ring-1 ring-brand/40"
                    : "bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2 text-white/85">
                  {store.best && <Route className="size-4 text-brand" />}
                  {store.name}
                </span>
                <span
                  className={
                    store.best
                      ? "font-semibold text-brand"
                      : "text-white/60 line-through"
                  }
                >
                  {store.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer trust line */}
      <footer className="relative z-10 flex items-center gap-6 p-10 text-xs text-white/40">
        <span>+120 supermercados</span>
        <span className="size-1 rounded-full bg-white/30" />
        <span>Precios actualizados cada hora</span>
      </footer>
    </div>
  )
}
