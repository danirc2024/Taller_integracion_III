'use client'

import { Link } from 'react-router-dom'
import { Plus, Package, AlertCircle, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  discountPct,
  formatPrice,
  supermarketById,
} from '@/data/mock'
import type { UiProduct as Product } from '@/types'
import { ROUTES } from '@/core/routes'

type ProductCardProps = {
  product: Product
  onAdd?: (product: Product) => void
}

function getStockState(product: Product): keyof typeof STOCK_UI {
  return product.inStock === false ? 'out' : 'in'
}

const STOCK_UI = {
  in:  { label: 'En stock',  cls: 'flex items-center gap-1 rounded-sm bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700',  icon: Package      },
  low: { label: 'Stock bajo', cls: 'flex items-center gap-1 rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700', icon: AlertCircle  },
  out: { label: 'Sin stock',  cls: 'flex items-center gap-1 rounded-sm bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700', icon: AlertCircle  },
} as const

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const market = supermarketById(product.supermarketId)
  const pct = discountPct(product)
  const stock = getStockState(product)
  const StockIcon = STOCK_UI[stock].icon
  const savings = product.originalPrice - product.price

  return (
    <Link 
      to={ROUTES.PRODUCTO_DETALLE(product.id)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-square bg-secondary/50">
        {pct > 0 && (
          <span className="absolute top-2 left-2 z-10 rounded bg-discount px-1.5 py-0.5 text-[10px] font-bold text-white">-{pct}%</span>
        )}

        <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm shadow-sm">
          <img
            src={market.logo || '/placeholder.svg'}
            alt={`Logo de ${market.name}`}
            className="h-3 w-3 rounded-sm object-cover"
          />
          {market.name}
        </span>

        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105 mix-blend-multiply"
        />
      </div>

      {/* ---------- Contenido ---------- */}
      <div className="flex flex-1 flex-col p-4 pb-0">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{product.brand}</p>
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.unit}</p>
        </div>

        {/* Meta: stock + ahorro */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={STOCK_UI[stock].cls}>
            <StockIcon className="h-3 w-3" />
            {STOCK_UI[stock].label}
          </span>
          {pct > 0 && (
            <span className="flex items-center gap-1 rounded-sm bg-discount/10 px-1.5 py-0.5 text-[10px] font-medium text-discount">
              <TrendingDown className="h-3 w-3" />
              Ahorras {formatPrice(savings)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between p-4 pt-3">
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none tracking-tight">
            {formatPrice(product.price)}
          </span>
          {pct > 0 && (
            <span className="text-xs text-muted-foreground line-through mt-1">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full bg-brand text-white hover:bg-brand-dark"
            aria-label={`Añadir ${product.name} a la lista`}
            onClick={(e) => {
              e.preventDefault()
              onAdd?.(product)
            }}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </Button>
      </div>
    </Link>
  )
}