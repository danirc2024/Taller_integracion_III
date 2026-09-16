# Frontend: React 19 + Vite + TypeScript + Tailwind 4

Puerto: 3000 | Dockerfile: Dockerfile | Entry: npm run dev

## Estructura activa de src/

```
src/
├── main.tsx                    → Entry point (ReactDOM.createRoot)
├── App.tsx                     → BrowserRouter + Routes
├── layouts/MainLayout.tsx      → Layout con Sidebar + TopNav + Outlet context
├── pages/
│   ├── Home.tsx                → Landing page (ruta /)
│   ├── Login.tsx               → Auth con panel visual (/login)
│   ├── Onboarding.tsx          → Wizard de configuración (/onboarding)
│   ├── Dashboard.tsx           → Comparador de precios (/dashboard)
│   ├── Chatbot.tsx             → Asistente IA (/chat)
│   ├── RouteViewer.tsx         → Mapa interactivo Leaflet (/route)
│   ├── Profile.tsx             → Config de usuario (/profile)
│   ├── Crowdsourcing.tsx       → Misiones gamificadas (/colaborador)
│   └── History.tsx             → Historial de listas (/history)
├── components/
│   ├── ui/                     → Primitives: button, input, field, label, separator, tabs
│   ├── auth/                   → AuthPanel, AuthVisual, PasswordStrength, SocialButtons
│   ├── onboarding/             → OnboardingWizard, ProgressSteps, StepLocation, StepSupermarkets, StepDiet
│   ├── ProductCard.tsx         → Tarjeta de producto con descuentos
│   ├── RouteMap.tsx            → Mapa Leaflet embebido (carga dinámica)
│   ├── Sidebar.tsx             → Navegación lateral con filtros de supermercado
│   ├── TopNav.tsx              → Barra superior con búsqueda
│   └── BottomNav.tsx           → [HUÉRFANO] Nav inferior móvil, no montado
├── data/mock.ts                → Datos ficticios: usuarios, supermercados, productos (Temuco)
├── types/index.ts              → Tipos TS del dominio (Usuario, UiProduct, UiSupermarket, etc.)
└── lib/utils.ts                → cn() helper para clases Tailwind
```

## Rutas (React Router DOM v7)

| Ruta | Componente | Layout |
|---|---|---|
| `/` | Home | Sin layout |
| `/login` | Login | Sin layout |
| `/onboarding` | Onboarding | Sin layout |
| `/dashboard` | Dashboard | MainLayout |
| `/chat` | Chatbot | MainLayout |
| `/route` | RouteViewer | MainLayout |
| `/profile` | Profile | MainLayout |
| `/colaborador` | Crowdsourcing | MainLayout |
| `/history` | History | MainLayout |

## State Management

- Sin stores externos (no Redux/Zustand)
- `useState` para estado local
- `useOutletContext<LayoutContextType>()` para comunicar Layout ↔ Vistas
- `useLayoutContext()` hook custom en MainLayout.tsx (exporta query + activeMarket)
- `useMemo` en Dashboard para filtrado en tiempo real y cálculo TSP greedy

## REGLAS IMPORTANTES

- **SOLO usar archivos PascalCase**: ProductCard.tsx, Sidebar.tsx, TopNav.tsx, AuthPanel.tsx, etc.
- **IGNORAR archivos kebab-case**: product-card.tsx, side-bar.tsx, auth-panel.tsx son obsoletos (v0)
- **IGNORAR src/lib/data.ts**: redundante con src/data/mock.ts, solo usado por componentes obsoletos
- UI primitives basadas en @base-ui/react + class-variance-authority
- Estilos: Tailwind 4 + tw-animate-css, utilidad cn() de tailwind-merge + clsx
- Iconos: lucide-react exclusivamente
- Path alias: `@` → `src/` (configurado en vite.config.ts y tsconfig)

## Dependencias clave

- react-leaflet + leaflet: mapas geoespaciales
- @radix-ui/react-*: primitivas accesibles (label, separator, slot, tabs)
- shadcn (CLI): generador de componentes UI

<!-- ARCHITECTURE:AUTO-GENERATED — NO EDITAR DEBAJO DE ESTA LÍNEA -->

## Mapa auto-generado: Frontend (React + TypeScript)

**44 archivos activos** (excluidos kebab-case obsoletos)


### `core/routes.ts`

- Exports: MOCK_ROUTES, ROUTES

### `data/mock.ts`

- Exports: HOME, discountPct, formatPrice, mockUser, products, supermarketById, supermarkets
- Imports locales: ../types

### `layouts/useActiveTab.ts`

- Exports: useActiveTab
- Tipos: ActiveTab

### `lib/data.ts`

- Exports: HOME, discountPct, formatPrice, products, supermarketById, supermarkets
- Tipos: Product, Supermarket

### `lib/utils.ts`

- Exports: cn
- Tipos: ClassValue

### `types/index.ts`

- Tipos: CadenaSupermercado, CapturaPrecio, Categoria, Marca, PreferenciasDieteticas, ProductoCrudo, ProductoNormalizado, SucursalSupermercado, UiProduct, UiSupermarket, Usuario

### `App.tsx`

- Exports: App
- Imports locales: ./layouts/MainLayout, ./pages/Chatbot, ./pages/Crowdsourcing, ./pages/Dashboard, ./pages/History, ./pages/Home, ./pages/Login, ./pages/Onboarding, ./pages/Profile, ./pages/RouteViewer

### `app/router.tsx`

- Exports: AppRouter
- Imports locales: @/core/routes, @/layouts/AppShell, @/layouts/MainLayout, @/pages/Chatbot, @/pages/Crowdsourcing, @/pages/Dashboard, @/pages/History, @/pages/Home, @/pages/Login, @/pages/NotFound, @/pages/Onboarding, @/pages/ProductDetail, @/pages/Profile, @/pages/RouteViewer, @/pages/mocks/MockShell

### `components/BottomNav.tsx`

- Exports: BottomNav
- Tipos: BottomNavProps
- Imports locales: @/lib/utils

### `components/ProductCard.tsx`

- Exports: ProductCard
- Tipos: ProductCardProps
- Imports locales: @/components/ui/button, @/data/mock, @/types

### `components/RouteMap.tsx`

- Exports: RouteMap
- Tipos: MapStop, RouteMapProps

### `components/Sidebar.tsx`

- Exports: SideBar
- Tipos: SideBarProps
- Imports locales: @/components/ui/button, @/data/mock

### `components/TopNav.tsx`

- Exports: TopNav
- Tipos: TopNavProps
- Imports locales: @/components/ui/button

### `components/auth/AuthPanel.tsx`

- Exports: AuthPanel
- Imports locales: @/components/auth/PasswordStrength, @/components/auth/SocialButtons, @/components/ui/button, @/components/ui/field, @/components/ui/input, @/components/ui/tabs

### `components/auth/AuthVisual.tsx`

- Exports: AuthVisual

### `components/auth/PasswordStrength.tsx`

- Exports: PasswordStrength
- Imports locales: @/lib/utils

### `components/auth/SocialButtons.tsx`

- Exports: SocialButtons
- Imports locales: @/components/ui/button

### `components/onboarding/OnboardingWizard.tsx`

- Exports: OnboardingWizard
- Imports locales: ./ProgressSteps, ./StepDiet, ./StepLocation, ./StepSupermarkets, @/lib/utils

### `components/onboarding/ProgressSteps.tsx`

- Exports: ProgressSteps
- Tipos: ProgressStepsProps
- Imports locales: @/lib/utils

### `components/onboarding/StepDiet.tsx`

- Exports: StepDiet
- Tipos: StepDietProps, Tag
- Imports locales: @/lib/utils

### `components/onboarding/StepLocation.tsx`

- Exports: StepLocation
- Tipos: StepLocationProps

### `components/onboarding/StepSupermarkets.tsx`

- Exports: StepSupermarkets
- Tipos: Chain, StepSupermarketsProps
- Imports locales: @/lib/utils

### `components/side-bar.tsx`

- Exports: SideBar
- Tipos: SideBarProps
- Imports locales: @/components/ui/button, @/lib/data

### `components/ui/button.tsx`

- Tipos: VariantProps
- Imports locales: @/lib/utils

### `components/ui/field.tsx`

- Tipos: VariantProps
- Imports locales: @/components/ui/label, @/components/ui/separator, @/lib/utils

### `components/ui/tabs.tsx`

- Tipos: VariantProps
- Imports locales: @/lib/utils

### `layouts/AppShell.tsx`

- Exports: AppShell
- Tipos: ActiveTab
- Imports locales: @/components/BottomNav

### `layouts/MainLayout.tsx`

- Exports: MainLayout, useLayoutContext
- Tipos: LayoutContextType
- Imports locales: @/components/BottomNav, @/components/Sidebar, @/components/TopNav

### `pages/Chatbot.tsx`

- Exports: Chatbot
- Tipos: Message
- Imports locales: @/data/mock, @/lib/utils

### `pages/Crowdsourcing.tsx`

- Exports: Crowdsourcing
- Imports locales: @/data/mock, @/lib/utils

### `pages/Dashboard.tsx`

- Exports: Dashboard
- Tipos: MapStop
- Imports locales: @/components/ProductCard, @/components/RouteMap, @/data/mock, @/layouts/MainLayout, @/types

### `pages/History.tsx`

- Exports: History
- Imports locales: @/lib/utils

### `pages/Home.tsx`

- Exports: Home
- Imports locales: @/components/ui/button, @/core/routes

### `pages/Login.tsx`

- Exports: Page
- Imports locales: @/components/auth/AuthPanel, @/components/auth/AuthVisual

### `pages/NotFound.tsx`

- Exports: NotFound
- Imports locales: @/components/ui/button, @/core/routes

### `pages/Onboarding.tsx`

- Exports: Page
- Imports locales: @/components/onboarding/OnboardingWizard

### `pages/ProductDetail.tsx`

- Exports: ProductDetail
- Imports locales: @/components/ui/button, @/core/routes, @/data/mock

### `pages/Profile.tsx`

- Exports: Profile
- Imports locales: @/data/mock, @/lib/utils

### `pages/RouteViewer.tsx`

- Exports: RouteViewer
- Tipos: as
- Imports locales: @/data/mock, @/lib/utils

### `pages/mocks/MockShell.tsx`

- Exports: MockShell
- Tipos: MockShellProps
