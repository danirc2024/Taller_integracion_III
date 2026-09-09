'use client'

import { Menu, MapPin, Search, ShoppingBasket, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TopNavProps = {
  query: string
  onQueryChange: (value: string) => void
  onMenuClick: () => void
}

export function TopNav({ query, onQueryChange, onMenuClick }: TopNavProps) {
  return (
    <header className="sticky top-0 z-[500] border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 md:gap-6 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            Compara<span className="text-primary">Carrito</span>
          </span>
        </div>

        <form
          role="search"
          className="relative flex-1"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="product-search" className="sr-only">
            Buscar productos
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Busca leche, café, aceite…"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-input bg-background pl-12 pr-28 text-base outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full px-4"
          >
            Buscar
          </Button>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            className="hidden h-12 gap-2 rounded-full px-4 md:flex"
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-medium leading-none text-muted-foreground">
                Comparando en
              </span>
              <span className="text-xs font-semibold leading-tight">
                Temuco
              </span>
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            aria-label="Filtros"
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}
