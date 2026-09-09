'use client'

import { useEffect, useState } from 'react'

import {
  ChevronDown,
  Flame,
  Heart,
  MapPin,
  Percent,
  Store,
  Tag,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supermarkets } from '@/lib/data'

type SideBarProps = {
  open: boolean
  onClose: () => void
  activeMarket: string | null
  onSelectMarket: (id: string | null) => void
}

const featured = [
  { id: 'ofertas', label: 'Mejores ofertas', icon: Flame },
  { id: 'descuentos', label: 'Mayor descuento', icon: Percent },
  { id: 'marcas', label: 'Marcas blancas', icon: Tag },
  { id: 'favoritos', label: 'Mis favoritos', icon: Heart },
]

const departments: { id: string; label: string; items: string[] }[] = [
  {
    id: 'lacteos',
    label: 'Lácteos, Huevos y Refrigerados',
    items: ['Leches', 'Quesos', 'Yogures', 'Mantequillas', 'Huevos'],
  },
  {
    id: 'despensa',
    label: 'Despensa y Abarrotes',
    items: [
      'Arroz y Legumbres',
      'Fideos y Pastas',
      'Aceites',
      'Harinas y Azúcar',
      'Conservas',
    ],
  },
  {
    id: 'panaderia',
    label: 'Panadería y Pastelería',
    items: ['Pan de Molde', 'Pan Tradicional', 'Galletas', 'Tortas y Masas'],
  },
  {
    id: 'carnes',
    label: 'Carnes y Pescados',
    items: ['Vacuno', 'Pollo', 'Cerdo', 'Pescados y Mariscos'],
  },
  {
    id: 'bebidas',
    label: 'Bebidas, Aguas y Licores',
    items: [
      'Bebidas Gaseosas',
      'Jugos',
      'Aguas Minerales',
      'Cervezas',
      'Vinos',
    ],
  },
  {
    id: 'hogar',
    label: 'Electrodomésticos y Hogar',
    items: [
      'Pequeños Electrodomésticos',
      'Menaje Cocina',
      'Limpieza y Aseo',
    ],
  },
  {
    id: 'libreria',
    label: 'Librería y Oficina',
    items: ['Cuadernos', 'Papelería', 'Útiles Escolares'],
  },
]

export function SideBar({
  open,
  onClose,
  activeMarket,
  onSelectMarket,
}: SideBarProps) {
  const [openDept, setOpenDept] = useState<string | null>(null)

  // Close on Escape for accessibility.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-[600] bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        aria-label="Menú de filtros"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-[700] flex w-[19rem] max-w-[85vw] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Explorar
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
          {/* DESTACADOS */}
          <nav aria-label="Destacados">
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Destacados
            </p>
            <ul className="flex flex-col gap-1">
              {featured.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <c.icon
                      className="h-4.5 w-4.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* DEPARTAMENTOS Y CATEGORÍAS */}
          <nav aria-label="Departamentos y categorías">
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Departamentos y categorías
            </p>
            <ul className="flex flex-col gap-0.5">
              {departments.map((dept) => {
                const expanded = openDept === dept.id
                return (
                  <li key={dept.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDept((prev) =>
                          prev === dept.id ? null : dept.id,
                        )
                      }
                      aria-expanded={expanded}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                          expanded ? 'rotate-0' : '-rotate-90'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-pretty leading-snug">
                        {dept.label}
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-200 ease-out ${
                        expanded
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <ul className="ml-6 overflow-hidden border-l border-border pl-3">
                        {dept.items.map((item) => (
                          <li key={item}>
                            <button
                              type="button"
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* SUPERMERCADOS */}
          <div>
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Supermercados
            </p>
            <ul className="flex flex-col gap-1">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectMarket(null)}
                  aria-pressed={activeMarket === null}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeMarket === null
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                    <Store
                      className="h-3.5 w-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </span>
                  Todos
                </button>
              </li>
              {supermarkets.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMarket(s.id)}
                    aria-pressed={activeMarket === s.id}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      activeMarket === s.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md bg-background ring-1 ring-border">
                      <img
                        src={s.logo || '/placeholder.svg'}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    </span>
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            Comparando en{' '}
            <span className="font-medium text-foreground">Temuco</span>
          </div>
        </div>
      </aside>
    </>
  )
}
