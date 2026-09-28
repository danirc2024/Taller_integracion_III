import { useMemo, useState, useEffect } from 'react'
import { Store, ShoppingBasket, Loader2 } from 'lucide-react'
import { useLayoutContext } from '@/layouts/MainLayout'
import { ProductCard } from '@/components/ProductCard'
import { ProductSkeleton } from '@/components/ui/ProductSkeleton'
import { Footer } from '@/components/Footer'
import {
  products,
  supermarketById,
} from '@/data/mock'
import type { UiProduct as Product } from '@/types'
import { useCart } from '@/contexts/CartContext'

export default function Page() {
  const { query, activeMarket } = useLayoutContext()
  const { addToCart, totalItems, totalPrice, setIsCartOpen } = useCart()
  const [isLoading, setIsLoading] = useState(true)

  // Simulate network fetch when filters change
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [query, activeMarket])

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

  const supermarketCount = useMemo(() => {
    const ids = new Set(filtered.map((p) => p.supermarketId))
    return ids.size
  }, [filtered])

  const [visibleCount, setVisibleCount] = useState(12)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(12)
  }, [query, activeMarket])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && visibleCount < filtered.length && !isFetchingMore) {
      setIsFetchingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => prev + 12);
        setIsFetchingMore(false);
      }, 1000);
    }
  };

  const displayedProducts = filtered.slice(0, visibleCount);

  const handleAdd = (product: Product) => {
    addToCart(product)
  }
  return (
    <div className="relative flex flex-1 w-full h-full bg-background overflow-hidden">
      {/* Fondo de imagen geométrica vibrante */}
      <div
        className="absolute inset-0 z-0 opacity-[0.60] bg-[url('/images/dashboard-seamless.jpg')] bg-cover bg-center bg-no-repeat pointer-events-none"
        aria-hidden="true"
      />
      <main className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 overflow-hidden px-4 py-6 md:px-6">
        {/* Left: product grid */}
        <section
          aria-label="Productos en oferta"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="relative mb-4 md:mb-6 flex flex-col justify-end overflow-hidden rounded-xl md:rounded-2xl border-2 border-border shadow-[2px_2px_0px_var(--color-border)] md:shadow-[4px_4px_0px_var(--color-border)] bg-card p-4 md:p-5 min-h-[90px] md:min-h-[140px]">
            <div
              className="absolute inset-0 z-0 opacity-[0.25] mix-blend-multiply bg-[url('/images/dashboard-bg.jpg')] bg-cover bg-center transition-opacity"
              aria-hidden="true"
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-card/80 via-card/50 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-balance text-xl md:text-2xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
                Ofertas cerca de ti
              </h1>
              <p className="text-sm font-semibold text-muted-foreground mt-1">
                {filtered.length}{' '}
                {filtered.length === 1 ? 'producto' : 'productos'} comparados en{' '}
                {supermarketCount}{' '}
                {supermarketCount === 1 ? 'supermercado' : 'supermercados'}
              </p>
            </div>
          </div>

          <div 
            className="min-h-0 flex-1 overflow-y-auto pb-2 pr-1 -mr-1 scrollbar-hide"
            onScroll={handleScroll}
          >
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="flex flex-col gap-6 pb-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
                  {displayedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onAdd={handleAdd} />
                  ))}
                </div>
                {isFetchingMore && (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm font-medium text-muted-foreground">Cargando más productos...</span>
                  </div>
                )}
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
            <Footer />
          </div>
        </section>

      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-[5.5rem] md:absolute md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2.5 rounded-full bg-primary px-4 py-2.5 text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] active:scale-95 border border-primary-foreground/20"
          aria-label="Ver carrito"
        >
          <div className="relative flex items-center justify-center">
            <ShoppingBasket className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col text-left ml-0.5">
            <span className="text-[9px] font-medium leading-none opacity-90">
              Ver Carrito
            </span>
            <span className="text-xs font-bold leading-tight mt-0.5">
              ${totalPrice.toLocaleString('es-CL')}
            </span>
          </div>
        </button>
      )}
    </div>
  )
}
