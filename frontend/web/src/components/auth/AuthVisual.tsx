import { Leaf, Route, ShoppingBag, TrendingDown } from "lucide-react"

export function AuthVisual() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-primary text-primary-foreground transition-colors duration-500">
      
      {/* Brand */}
      <header className="relative z-10 flex items-center gap-2.5 p-10">
        <span className="flex size-10 items-center justify-center rounded-xl border-2 border-primary-foreground">
          <Leaf className="size-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">
          RutaAhorro
        </span>
      </header>

      {/* Headline + Neobrutalist card */}
      <div className="relative z-10 flex flex-col gap-10 px-10 pb-4">
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-[1.1] font-extrabold tracking-tight text-balance xl:text-5xl">
            Descubre la ruta más barata para tus compras
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed opacity-80">
            Comparamos precios de todos los supermercados en tiempo real para
            que ahorres en cada carrito, sin salir de casa.
          </p>
        </div>

        {/* Neobrutalist card */}
        <div className="relative w-full max-w-sm rounded-xl border-4 border-primary-foreground bg-primary p-5 shadow-[8px_8px_0px_currentColor]">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 text-sm font-bold">
              <ShoppingBag className="size-4" />
              Carrito semanal
            </span>
            <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border-2 border-primary-foreground">
              <TrendingDown className="size-3.5" />
              -23%
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { name: "Jumbo", price: "$48.900", best: false },
              { name: "Lider", price: "$44.150", best: false },
              { name: "Unimarc", price: "$37.600", best: true },
            ].map((store) => (
              <div
                key={store.name}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold border-2 ${
                  store.best ? "border-primary-foreground bg-primary-foreground text-primary shadow-[4px_4px_0px_currentColor]" : "border-transparent opacity-70"
                }`}
              >
                <span className="flex items-center gap-2">
                  {store.best && <Route className="size-4" />}
                  {store.name}
                </span>
                <span className={store.best ? "" : "line-through"}>
                  {store.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer trust line */}
      <footer className="relative z-10 flex items-center gap-6 p-10 text-xs font-bold opacity-70">
        <span>+120 supermercados</span>
        <span className="size-1.5 rounded-full bg-primary-foreground" />
        <span>Precios actualizados cada hora</span>
      </footer>
    </div>
  )
}
