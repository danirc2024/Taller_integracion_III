import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Store, Plus, ShoppingCart } from 'lucide-react'
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
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-4 py-6 md:px-6">

      <div className="flex flex-1 flex-col gap-6 md:flex-row md:items-start lg:gap-10">
        {/* Left Column: Image Area */}
        <section className="flex w-full md:w-5/12 flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-secondary/50 p-6 shadow-inner">
          <div className="relative aspect-square w-full max-w-[200px] lg:max-w-[260px]">
            {pct > 0 && (
              <span className="absolute left-0 top-0 z-10 rounded-lg bg-discount px-3 py-1.5 text-sm font-bold text-discount-foreground shadow-sm">
                -{pct}% Descuento
              </span>
            )}
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-contain drop-shadow-xl"
            />
          </div>
        </section>

        {/* Right Column: Details Area */}
        <section className="flex w-full md:w-7/12 flex-col justify-center py-2 md:py-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 text-xs font-medium shadow-sm">
              <img
                src={market.logo || '/placeholder.svg'}
                alt={`Logo de ${market.name}`}
                className="h-6 w-6 rounded-full object-contain"
              />
              Disponible en {market.name}
            </span>
          </div>

          <div className="mb-2">
            <p className="text-sm font-medium tracking-widest text-primary uppercase">
              {product.brand}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{product.unit}</p>
          </div>

          <div className="my-8 h-px w-full bg-border" />

          <div className="mb-8">
            <p className="text-sm font-medium text-muted-foreground">Precio actual</p>
            <div className="mt-1 flex items-baseline gap-4">
              <span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {formatPrice(product.price)}
              </span>
              {pct > 0 && (
                <span className="text-xl font-medium text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {pct > 0 && (
              <p className="mt-2 text-sm text-discount">
                Ahorras {formatPrice(product.originalPrice - product.price)} en este producto
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row">
            <Button 
              size="lg" 
              className="flex-1 gap-2 rounded-xl text-base h-14"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="h-5 w-5" />
              Añadir a la lista
            </Button>
            <Button size="lg" variant="outline" className="flex-1 gap-2 rounded-xl text-base h-14">
              <Plus className="h-5 w-5" />
              Comparar precio
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
