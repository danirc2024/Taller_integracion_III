'use client'

import { useState } from 'react'
import { Menu, MapPin, Search, ShoppingBasket, SlidersHorizontal, Bot, User, LogOut, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link, useLocation, useNavigate } from 'react-router-dom'

type TopNavProps = {
  query: string
  onQueryChange: (value: string) => void
  onMenuClick: () => void
}

export function TopNav({ query, onQueryChange, onMenuClick }: TopNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const showBack = location.pathname !== '/dashboard' && location.pathname !== '/';

  return (
    <header className="sticky top-0 z-[500] border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 md:gap-6 md:px-6">
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            onClick={onMenuClick}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}

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

        <Link 
          to="/chat" 
          className="hidden sm:flex items-center gap-2 h-11 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shrink-0 shadow-sm"
        >
          <Bot className="h-5 w-5" />
          <span>Asistente IA</span>
        </Link>

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
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              aria-label="Filtros"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <Link 
                    to="/profile" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </Link>
                  <div className="h-px bg-border w-full" />
                  <Link 
                    to="/login" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
