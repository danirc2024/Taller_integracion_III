import { useMemo } from 'react'
import { Navigation, Route, Store } from 'lucide-react'
import { useLayoutContext } from '@/layouts/MainLayout'
import { ProductCard } from '@/components/product-card'
import { RouteMap, type MapStop } from '@/components/route-map'
import {
  HOME,
  products,
  supermarketById,
  type Product,
} from '@/lib/data'

// Haversine-ish squared distance is enough for ordering nearby stops.
function dist(a: [number, number], b: [number, number]) {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return dx * dx + dy * dy
}

// Greedy nearest-neighbor ordering starting from home.
function buildRoute(marketIds: string[]): MapStop[] {
  const pending = marketIds.map((id) => supermarketById(id))
  const route: MapStop[] = []
  let current: [number, number] = HOME.coords
  let order = 1

  while (pending.length > 0) {
    let bestIdx = 0
    let bestDist = Number.POSITIVE_INFINITY
    pending.forEach((m, i) => {
      const d = dist(current, m.coords)
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    })
    const next = pending.splice(bestIdx, 1)[0]
    route.push({
      id: next.id,
      name: next.name,
      color: next.color,
      coords: next.coords,
      order: order++,
    })
    current = next.coords
  }

  return route
}

export default function Page() {
  const { query, activeMarket } = useLayoutContext()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesMarket =
        activeMarket === null || p.supermarketId === activeMarket
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        supermarketById(p.supermarketId).name.toLowerCase().includes(q)
      return matchesMarket && matchesQuery
    })
  }, [query, activeMarket])

  const stops = useMemo(() => {
    const ids = Array.from(new Set(filtered.map((p) => p.supermarketId)))
    return buildRoute(ids)
  }, [filtered])

  const handleAdd = (product: Product) => {
    console.log('[v0] Producto añadido a la lista:', product.name)
  }

  return (

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 overflow-hidden px-4 py-6 md:px-6 lg:grid lg:grid-cols-[1.35fr_1fr]">
        {/* Left: product grid */}
        <section
          aria-label="Productos en oferta"
          className="flex min-h-0 flex-col"
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <h1 className="text-balance text-xl font-semibold tracking-tight">
                Ofertas cerca de ti
              </h1>
              <p className="text-sm text-muted-foreground">
                {filtered.length}{' '}
                {filtered.length === 1 ? 'producto' : 'productos'} comparados en{' '}
                {stops.length}{' '}
                {stops.length === 1 ? 'supermercado' : 'supermercados'}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-2 pr-1 -mr-1">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={handleAdd} />
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                <Store
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  No encontramos productos para{' '}
                  <span className="font-medium text-foreground">
                    &ldquo;{query}&rdquo;
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right: interactive route map */}
        <section
          aria-label="Ruta óptima de compra"
          className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:min-h-0"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Route className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold leading-tight">
                  Ruta óptima
                </h2>
                <p className="text-xs text-muted-foreground">
                  Recorrido más corto entre tiendas
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              {stops.length} paradas
            </span>
          </div>

          <div className="relative min-h-0 flex-1">
            <RouteMap home={HOME} stops={stops} />
          </div>
        </section>
      </main>
  )
}
