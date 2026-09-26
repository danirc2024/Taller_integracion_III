'use client'

import { Link } from 'react-router-dom'
import { Plus, TrendingDown, Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  discountPct,
  formatPrice,
  supermarketById,
} from '@/data/mock'
import type { UiProduct as Product } from '@/types'

type ProductCardProps = {
  product: Product
  onAdd?: (product: Product) => void
}

/* Simulamos estado de stock a partir del id (mock determinista) */
function getStockState(product: Product) {
  const hash = product.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  if (hash % 7 === 0) return 'out'
  if (hash % 4 === 0) return 'low'
  return 'in'
}

const STOCK_UI = {
  in:  { label: 'En stock',  cls: 'tag tag--in',  icon: Package      },
  low: { label: 'Stock bajo', cls: 'tag tag--low', icon: AlertCircle  },
  out: { label: 'Sin stock',  cls: 'tag tag--out', icon: AlertCircle  },
} as const

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const market = supermarketById(product.supermarketId)
  const pct = discountPct(product)
  const stock = getStockState(product)
  const StockIcon = STOCK_UI[stock].icon
  const savings = product.originalPrice - product.price

  return (
    <article className="product-card group">
      <Link to={`/product/${product.id}`} className="flex flex-1 flex-col">
      {/* ---------- Imagen ---------- */}
      <div className="product-card__media">
        {pct > 0 && (
          <span className="product-card__discount">-{pct}%</span>
        )}

        <span className="product-card__market">
          <img
            src={market.logo || '/placeholder.svg'}
            alt={`Logo de ${market.name}`}
            className="product-card__market-logo"
          />
          {market.name}
        </span>

        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="product-card__img"
        />
      </div>

      {/* ---------- Contenido ---------- */}
      <div className="product-card__body">
        <div className="product-card__head">
          <p className="product-card__brand">{product.brand}</p>
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__unit">{product.unit}</p>
        </div>

        {/* Meta: stock + ahorro */}
        <div className="product-card__meta">
          <span className={STOCK_UI[stock].cls}>
            <StockIcon className="h-3 w-3" />
            {STOCK_UI[stock].label}
          </span>
          {pct > 0 && (
            <span className="tag tag--save">
              <TrendingDown className="h-3 w-3" />
              Ahorras {formatPrice(savings)}
            </span>
          )}
        </div>

      </div>
      </Link>

      <div className="product-card__footer">
        <div className="product-card__price">
          <span className="product-card__price-main">
            {formatPrice(product.price)}
          </span>
          {pct > 0 && (
            <span className="product-card__price-old">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            aria-label={`Añadir ${product.name} a la lista`}
            disabled={stock === 'out'}
            onClick={(e) => {
              e.preventDefault()
              onAdd?.(product)
            }}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </Button>
      </div>
    </article>
  )
}