import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import {
  ArrowLeft,
  Store,
  Plus,
  ShoppingCart,
  Package,
  AlertCircle,
  Tag,
  Barcode,
  Layers,
  Truck,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  products,
  supermarketById,
  discountPct,
  formatPrice,
} from '@/data/mock'
import { useCart } from '@/contexts/CartContext'
import { Footer } from '@/components/Footer'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Store className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-xl font-semibold">Producto no encontrado</h2>
        <p className="mb-6 mt-2 text-muted-foreground">
          El producto que buscas no existe o ha sido retirado.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </Button>
      </main>
    )
  }

  const market = supermarketById(product.supermarketId)
  const pct = discountPct(product)
  const savings = product.originalPrice - product.price

  /* Relacionados: misma marca, distintos productos */
  /* Relacionados con fallback en cascada */
const related = (() => {
  const byBrand = products.filter(
    (p) => p.id !== product.id && p.brand === product.brand
  )
  if (byBrand.length >= 2) return byBrand.slice(0, 8)

  const byMarket = products.filter(
    (p) => p.id !== product.id && p.supermarketId === product.supermarketId
  )
  if (byMarket.length >= 2) return byMarket.slice(0, 8)

  // Fallback: cualquier otro producto
  return products.filter((p) => p.id !== product.id).slice(0, 8)
})()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">

      {/* ---------- Breadcrumb ---------- */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground transition-colors">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        <span className="capitalize">{product.brand.toLowerCase()}</span>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">

        {/* ============ Imagen ============ */}
        <section className="lg:col-span-5">
          <div className="product-detail__media">
            {pct > 0 && (
              <span className="product-detail__discount">
                -{pct}% Descuento
              </span>
            )}
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="product-detail__img"
            />
          </div>

          {/* Mini galería decorativa */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg border-2 border-border bg-secondary/60 p-2 flex items-center justify-center"
              >
                <img
                  src={product.image || '/placeholder.svg'}
                  alt=""
                  className="max-h-full max-w-full object-contain opacity-90"
                  style={{ transform: `scale(${1 - i * 0.06}) rotate(${(i - 1.5) * 3}deg)` }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ============ Detalle ============ */}
        <section className="lg:col-span-7 flex flex-col gap-5">

          <span className="product-detail__market">
            <img
              src={market.logo || '/placeholder.svg'}
              alt=""
              className="h-6 w-6 rounded-full object-contain bg-white"
            />
            Disponible en {market.name}
          </span>

          <div>
            <p className="product-detail__brand">{product.brand}</p>
            <h1 className="product-detail__title">{product.name}</h1>
            <p className="product-detail__unit">{product.unit}</p>
          </div>

          <div className="product-detail__price-block">
            <span className="product-detail__price-label">Precio actual</span>
            <div className="product-detail__price-row">
              <span className="product-detail__price">{formatPrice(product.price)}</span>
              {pct > 0 && (
                <span className="product-detail__price-old">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {pct > 0 && (
              <p className="product-detail__savings">
                <Tag className="h-3.5 w-3.5" />
                Ahorras {formatPrice(savings)} en este producto
              </p>
            )}
          </div>

          <div className="product-detail__specs">
            <div className="spec">
              <Tag className="spec__icon" />
              <div>
                <div className="spec__label">Marca</div>
                <div className="spec__value">{product.brand}</div>
              </div>
            </div>
            <div className="spec">
              <Layers className="spec__icon" />
              <div>
                <div className="spec__label">Formato</div>
                <div className="spec__value">{product.unit}</div>
              </div>
            </div>
            <div className="spec">
              <Barcode className="spec__icon" />
              <div>
                <div className="spec__label">Código</div>
                <div className="spec__value">#{product.id.slice(0, 8).toUpperCase()}</div>
              </div>
            </div>
            <div className="spec">
              <Package className="spec__icon" />
              <div>
                <div className="spec__label">Stock</div>
                <div className="spec__value">Disponible</div>
              </div>
            </div>
          </div>

          <div className="product-detail__purchase">
            <div className="purchase-row">
              <MapPin className="h-4 w-4" />
              <span>Retiro en {market.name} — Temuco</span>
            </div>
            <div className="purchase-row">
              <Truck className="h-4 w-4" />
              <span>Despacho disponible a domicilio</span>
            </div>
            <div className="purchase-row">
              <AlertCircle className="h-4 w-4" />
              <span>Los precios pueden variar por sucursal</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2 rounded-xl text-base h-14"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="h-5 w-5" />
              Añadir a la lista
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 gap-2 rounded-xl text-base h-14"
            >
              <Plus className="h-5 w-5" />
              Comparar precio
            </Button>
          </div>
        </section>
      </div>

      {/* ============ Carrusel relacionados ============ */}
      {related.length > 0 && (
        <RelatedCarousel brand={product.brand} items={related} />
      )}

      <Footer />
    </main>
  )
}

/* ================================================================
   Carrusel de productos relacionados (componente local)
   ================================================================ */
type RelatedItem = (typeof import('@/data/mock'))['products'][number]

function RelatedCarousel({
  brand,
  items,
}: {
  brand: string
  items: RelatedItem[]
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateArrows = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [items.length])

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8 * dir
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Más de {brand} y otros.
          </h2>
          <p className="text-xs text-muted-foreground">
            Otros productos que podrian interesarte
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            aria-label="Anterior"
            className="carousel-arrow"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            aria-label="Siguiente"
            className="carousel-arrow"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollerRef} className="carousel-track">
        {items.map((p) => {
          const itemPct = discountPct(p)
          return (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="product-card carousel-item"
            >
              <div className="product-card__media">
                {itemPct > 0 && (
                  <span className="product-card__discount">-{itemPct}%</span>
                )}
                <img
                  src={p.image || '/placeholder.svg'}
                  alt={p.name}
                  className="product-card__img"
                />
              </div>
              <div className="product-card__body">
                <div className="product-card__head">
                  <p className="product-card__brand">{p.brand}</p>
                  <h3 className="product-card__name">{p.name}</h3>
                </div>
                <div className="product-card__footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                  <span className="product-card__price-main">
                    {formatPrice(p.price)}
                  </span>
                  {itemPct > 0 && (
                    <span className="product-card__price-old">
                      {formatPrice(p.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}