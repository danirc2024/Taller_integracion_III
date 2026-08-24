'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  discountPct,
  formatPrice,
  supermarketById,
  type Product,
} from '@/lib/data'

type ProductCardProps = {
  product: Product
  onAdd?: (product: Product) => void
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const market = supermarketById(product.supermarketId)
  const pct = discountPct(product)

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="relative aspect-square bg-secondary">
        {pct > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-discount px-2 py-1 text-xs font-bold text-discount-foreground shadow-sm">
            -{pct}%
          </span>
        )}
        <span className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full border border-border bg-card/90 py-1 pl-1 pr-2.5 text-xs font-medium shadow-sm backdrop-blur">
          <img
            src={market.logo || '/placeholder.svg'}
            alt={`Logo de ${market.name}`}
            className="h-5 w-5 rounded-full object-contain"
          />
          {market.name}
        </span>
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="text-pretty text-sm font-semibold leading-snug">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{product.unit}</p>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col leading-none">
            <span className="font-mono text-xl font-bold tracking-tight">
              {formatPrice(product.price)}
            </span>
            {pct > 0 && (
              <span className="mt-1 font-mono text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            aria-label={`Añadir ${product.name} a la lista`}
            onClick={() => onAdd?.(product)}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  )
}
