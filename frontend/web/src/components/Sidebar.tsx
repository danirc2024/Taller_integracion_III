'use client'

import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import {
 ChevronDown,
 Flame,
 Heart,
 MapPin,
 Percent,
 Store,
 Tag,
 X,
 Bot,
 Map,
 Users,
 Home,
 Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { mockUser } from '@/data/mock'
import type { UiSupermarket } from '@/types'

type SideBarProps = {
 open: boolean
 onClose: () => void
 activeMarket: string | null
 availableMarkets: UiSupermarket[]
 onSelectCategory: (category: string) => void
 onSelectMarket: (id: string | null) => void
 activeCategory: string
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
 'Arroz',
 'Legumbres',
 'Fideos',
 'Pastas',
 'Aceites',
 'Harinas',
 'Azúcares',
 'Conservas',
 ],
 },
 {
 id: 'panaderia',
 label: 'Panadería y Pastelería',
 items: ['Pan', 'Galletas', 'Tortas', 'Masas'],
 },
 {
 id: 'carnes',
 label: 'Carnes y Pescados',
 items: ['Vacuno', 'Pollo', 'Cerdo', 'Pescados', 'Mariscos'],
 },
 {
 id: 'bebidas',
 label: 'Bebidas, Aguas y Licores',
 items: [
 'Bebidas',
 'Jugos',
 'Aguas',
 'Cervezas',
 'Vinos',
 ],
 },
 {
 id: 'hogar',
 label: 'Electrodomésticos y Hogar',
 items: ['Electrodomésticos', 'Menaje', 'Limpieza', 'Aseo'],
 },
 {
 id: 'libreria',
 label: 'Librería y Oficina',
 items: ['Cuadernos', 'Papelería', 'Útiles'],
 },
]

export function SideBar({
 open,
 onClose,
 activeMarket,
 availableMarkets,
 onSelectCategory,
 onSelectMarket,
 activeCategory,
}: SideBarProps) {
 const [openDept, setOpenDept] = useState<string | null>(null)
 const navigate = useNavigate()
 const { pathname } = useLocation()

 const handleCategoryClick = (category: string, closeSidebar = true) => {
 onSelectCategory(category)
 navigate('/dashboard')
 if (closeSidebar) onClose()
 }

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
 className={`fixed inset-0 z-[9998] bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
 open ? 'opacity-100' : 'pointer-events-none opacity-0'
 }`}
 />

 {/* Panel */}
 <aside
 aria-label="Menú de filtros"
 aria-hidden={!open}
 className={`fixed inset-y-0 left-0 z-[9999] flex w-[19rem] max-w-[85vw] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out ${
 open ? 'translate-x-0' : '-translate-x-full'
 }`}
 >
 <div className="flex items-center justify-between border-b border-border px-5 py-4">
 <div className="flex items-center gap-2">
 <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
 <Store className="h-5 w-5"aria-hidden="true"/>
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
 <X className="h-5 w-5"aria-hidden="true"/>
 </Button>
 </div>

 <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
          {/* NAVEGACIÓN PRINCIPAL */}
          <nav aria-label="Navegación">
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to="/"
                  onClick={onClose}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <Home className="h-4.5 w-4.5" aria-hidden="true" />
                  Página principal
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => {
                    onSelectCategory("")
                    onClose()
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${pathname === '/dashboard' ? 'text-primary-foreground bg-primary shadow-[4px_4px_0px_var(--color-border)] border-2 border-border hover:bg-primary/90' : 'text-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                  <Store className="h-4.5 w-4.5" aria-hidden="true" />
                  Catálogo
                </Link>
              </li>
            </ul>
          </nav>

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
                    onClick={() => handleCategoryClick(activeCategory === c.id ? "" : c.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeCategory === c.id ? 'bg-accent text-accent-foreground font-bold' : 'text-foreground hover:bg-accent hover:text-accent-foreground'}`}
                  >
                    <c.icon
                      className={`h-4.5 w-4.5 ${activeCategory === c.id ? 'text-foreground' : 'text-muted-foreground'}`}
                      aria-hidden="true"
                    />
                    {c.label}
                  </button>
                </li>
              ))}
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
              {availableMarkets.map((s) => (
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
                      onClick={() => {
                        setOpenDept((prev) => (prev === dept.id ? null : dept.id))
                        handleCategoryClick(dept.label, false)
                      }}
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
                              onClick={() => handleCategoryClick(activeCategory === item ? "" : item, false)}
                              className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${activeCategory === item ? 'bg-accent text-primary font-bold' : 'text-muted-foreground hover:bg-accent hover:text-primary'}`}
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

          {/* HERRAMIENTAS IA */}
          <nav aria-label="Asistente IA">
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Herramientas IA
            </p>
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to="/chat"
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${pathname.startsWith('/chat') ? 'text-primary-foreground bg-primary shadow-[4px_4px_0px_var(--color-border)] border-2 border-border hover:bg-primary/90' : 'text-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                  <Bot className="h-4.5 w-4.5" aria-hidden="true"/>
                  Chat Inteligente
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${pathname.startsWith('/history') ? 'text-primary-foreground bg-primary shadow-[4px_4px_0px_var(--color-border)] border-2 border-border hover:bg-primary/90' : 'text-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                  <Map className="h-4.5 w-4.5" aria-hidden="true"/>
                  Listas y Rutas
                </Link>
              </li>
              <li>
                <Link
                  to="/colaborador"
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${pathname.startsWith('/colaborador') ? 'text-primary-foreground bg-primary shadow-[4px_4px_0px_var(--color-border)] border-2 border-border hover:bg-primary/90' : 'text-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                  <Users className="h-4.5 w-4.5" aria-hidden="true"/>
                  Misiones
                </Link>
              </li>
            </ul>
          </nav>
 </div>

 <div className="border-t border-border px-4 py-4 space-y-3">
 {/* Plan Container */}
 <Link 
 to="/planes"
 onClick={onClose}
 className="flex items-center justify-between rounded-xl border-2 border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_var(--color-border)] group"
 >
 <div className="flex items-center gap-3">
 <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${mockUser.plan === 'Plus' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
 <Zap className="h-4 w-4" aria-hidden="true" />
 </div>
 <div className="flex flex-col text-left">
 <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Tu Plan</span>
 <span className={`text-sm font-bold ${mockUser.plan === 'Plus' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
 {mockUser.plan === 'Plus' ? 'Suscripción Plus' : 'Plan Básico'}
 </span>
 </div>
 </div>
 <span className="text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
 Mejorar
 </span>
 </Link>

 <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
 <MapPin className="h-4 w-4 text-primary"aria-hidden="true"/>
 Comparando en{' '}
 <span className="font-medium text-foreground">Temuco</span>
 </div>
 </div>
 </aside>
 </>
 )
}
