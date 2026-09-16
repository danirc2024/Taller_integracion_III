# Proyecto: Plataforma de Comparación de Precios y Optimización de Rutas

Stack: React 19 + Go 1.26 (Gin/GORM) + Python 3.11 (FastAPI) + PostgreSQL 15/PostGIS + Docker
Equipo: 6 integrantes, GitFlow estricto, Scrum semestral (UCT)

## Arquitectura de Microservicios

```
frontend/web/       → React 19 + Vite + TypeScript + Tailwind 4         (puerto 3000)
backend/api/        → Go 1.26 + Gin + GORM, API Gateway                 (puerto 8080)
backend/scraper/    → Python + Scrapy, extractor asíncrono               (standby worker)
backend/motor_rutas/→ Python + FastAPI + OR-Tools + OSRM                 (puerto 8001)
backend/ia_conversacional/ → Python + FastAPI + Groq/Gemini              (puerto 8002)
```

Servicios de infraestructura: PostgreSQL 15+PostGIS, Redis (broker), OSRM (rutas C++)

## Base de Datos (3 esquemas PostgreSQL)

- `api.*`: usuarios, categorías, marcas, productos_normalizados, recetas, misiones_validacion, mapeos_productos_ia
- `scraper.*`: cadenas_supermercado, sucursales (geolocalización), trabajos_scraper, productos_crudos, capturas_precios
- `rutas.*`: listas_compras, articulos_lista_compras, ejecuciones_optimizacion, paradas_optimizacion, detalle_articulos_parada
- Modelos GORM: `backend/api/infrastructure/models.go` (23 modelos)
- DDL SQL: `infrastructure/db/` (init.sql, 01_schema_api.sql, 02_schema_scraper.sql, 03_schema_rutas.sql)

## Convenciones de Git (OBLIGATORIO)

- Ramas: `[área]/[tipo]/[tarea]-[nombre_dev]`
  - Áreas: frontend, backend, scraper, ia, docker, docs
  - Tipos: feat, fix, docs, refactor
  - Ejemplo: `frontend/feat/login-vicente`, `ia/feat/investigacion-alucinaciones`
- Commits: formato convencional (`feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`)
- Merge: siempre Squash and Merge hacia develop
- NUNCA hacer push directo a main o develop
- Eliminar rama en GitHub y local tras el merge

## Frontend: Reglas

- Componentes activos usan **PascalCase**: ProductCard.tsx, Sidebar.tsx, TopNav.tsx
- **IGNORAR archivos kebab-case** (product-card.tsx, side-bar.tsx): son versiones v0 obsoletas, no se usan
- UI primitives: src/components/ui/ (button, input, field, label, separator, tabs)
- State management: useState + useOutletContext (sin Redux/Zustand)
- Datos mock actuales: src/data/mock.ts (sin conexión a API real aún)
- Path alias: `@` → `src/`
- Linter: oxlint (no eslint)

## Backend Go: Reglas

- Framework: Gin con middleware CORS global
- ORM: GORM con driver pgx/v5
- Sanitización: `utils.SanitizarInputBusqueda()` para toda entrada de usuario
- Swagger: anotaciones swag en handlers, auto-generado en docs/
- Variable global `DB *gorm.DB` en main.go

## Python: Patrón Anti-Alucinación (3 Etapas)

1. LLM extrae filtros estructurados via function calling (NO texto libre)
2. Python filtra catálogo deterministamente en filtros.py (NUNCA el LLM)
3. LLM genera explicación SOLO con datos validados de Etapa 2
- Proveedores intercambiables: GroqProveedor, GeminiProveedor, FallbackProveedor
- Interfaz base: ProveedorIA(ABC) en app/proveedores/base.py

## Hardware y Docker

- Servidor: Intel Pentium (recursos limitados)
- Imágenes Docker: SOLO -alpine y -slim
- Respetar límites cgroups en docker-compose.yml
- No usar librerías pesadas sin justificación (OSMnx fue eliminado por OOM)
- Python: PYTHONDONTWRITEBYTECODE=1, pip --no-cache-dir

<!-- ARCHITECTURE:AUTO-GENERATED — NO EDITAR DEBAJO DE ESTA LÍNEA -->

## Resumen de arquitectura (auto-generado)


## Mapa auto-generado: API Gateway (Go + Gin)

**3 archivos .go** detectados


### `infrastructure/models.go` (package infrastructure)

- Structs: Usuario, PreferencialDieteticaUsuario, DireccionUsuario, PerfilTransporteUsuario, TarjetaFidelidadUsuario, MisionValidacion, Categoria, Marca, ProductoNormalizado, EquivalenciaProducto, Receta, IngredienteReceta, MapeoProductoIA, CadenaSupermercado, SucursalSupermercado, TrabajoScraper, ProductoCrudo, CapturaPrecio, ListaCompra, ArticuloListaCompra, EjecucionOptimizacion, ParadaOptimizacion, DetalleArticuloParada

### `main.go` (package main)

- `initDB()`
- `setupRouter() *gin.Engine`
- `RootHandler(c *gin.Context)`
- `main()`

### `utils/security.go` (package utils)

- `SanitizarInputBusqueda(input string) string`


## Mapa auto-generado: IA Conversacional (FastAPI)

**17 archivos .py** detectados


### `app/config.py`


### `app/explicacion.py`

- `construir_prompt_explicacion(mensaje_usuario: str, productos_filtrados: list) → str`
- `async generar_explicacion_con_tiempo(generador, mensaje_usuario: str, productos_filtrados: list)`

### `app/filtros.py`

- `sanitizar_filtros_crudos(crudo: dict) → dict`
- `rescatar_filtros_de_error_groq(response: httpx.Response) → ?`
- `_extraer_json_de_texto(texto: str) → ?`
- `_tokenizar_categoria(texto: str) → list`
- `_texto_contiene(a: str, b: str) → bool`
- `_coincide_por_texto(frase: str, producto: dict) → bool`
- `filtrar_productos(catalogo: list, filtros: dict) → list`

### `app/ia_definiciones.py`


### `app/main.py`

- Imports internos: app, app.ia_definiciones, app.productos, app.proveedores.fallback_proveedor, app.proveedores.gemini_proveedor, app.proveedores.groq_proveedor, app.routers.chat, app.routers.productos, app.utils

### `app/productos.py`

- **class ProductoRepositorio**
  - `__init__(ruta_json: Path)`
  - `_cargar() → list`
  - `obtener_todos() → list`
  - `__len__() → int`

### `app/proveedores/base.py`

- **class ResultadoExtraccion**
- **class ProveedorIA(ABC)**
  - `async extraer_filtros(mensaje: str) → ResultadoExtraccion`
  - `async generar_explicacion(mensaje_usuario: str, productos_filtrados: list) → str`

### `app/proveedores/fallback_proveedor.py`

- Imports internos: app.proveedores.base
- **class FallbackProveedor(ProveedorIA)**
  - `__init__(proveedores: ?, max_retries_primario: int, max_retries_secundario: int, backoff_base: float, timeout: float)`
  - `_es_error_recuperable(error: Exception) → bool`
  - `async _ejecutar_con_reintentos(proveedor: ProveedorIA, metodo: str) → any`
  - `async extraer_filtros(mensaje: str) → ResultadoExtraccion`
  - `async generar_explicacion(mensaje_usuario: str, productos_filtrados: list) → str`

### `app/proveedores/gemini_proveedor.py`

- Imports internos: app.explicacion, app.filtros, app.proveedores.base
- **class GeminiProveedor(ProveedorIA)**
  - `__init__(api_key: ?, endpoint: str, modelo: str, definicion_funcion: dict)`
  - `_headers() → dict`
  - `async extraer_filtros(mensaje: str) → ResultadoExtraccion`
  - `async generar_explicacion(mensaje_usuario: str, productos_filtrados: list) → str`

### `app/proveedores/groq_proveedor.py`

- Imports internos: app.explicacion, app.filtros, app.proveedores.base
- **class GroqProveedor(ProveedorIA)**
  - `__init__(api_key: ?, endpoint: str, modelo_extraccion: str, modelo_explicacion: str, definicion_funcion: dict)`
  - `_headers() → dict`
  - `async extraer_filtros(mensaje: str) → ResultadoExtraccion`
  - `async generar_explicacion(mensaje_usuario: str, productos_filtrados: list) → str`

### `app/routers/chat.py`

- Imports internos: app.explicacion, app.filtros, app.productos, app.proveedores.base, app.schemas
- `crear_router_chat(repositorio: ProductoRepositorio, proveedor_groq: ProveedorIA, proveedor_gemini: ProveedorIA) → APIRouter`

### `app/routers/productos.py`

- Imports internos: app.productos
- `crear_router_productos(repositorio: ProductoRepositorio) → APIRouter`

### `app/schemas.py`

- **class ChatRequest(BaseModel)**

### `app/utils.py`

- **class RespuestaUTF8(JSONResponse)**
- `fix_encoding_consola() → ?`


## Mapa auto-generado: Motor de Rutas (FastAPI + OR-Tools)

**5 archivos .py** detectados


### `app/algorithms/osrm_ortools_strategy.py`

- Imports internos: app.core.strategy
- **class OSRMOrToolsStrategy(RoutingStrategy)**
  - `__init__(osrm_base_url: str)`
  - `calculate_route(origin: ?, destination: ?) → ?`
  - `optimize_route(origin: ?, waypoints: ?) → ?`

### `app/algorithms/prototipo_ruta_ficticia.py`

- `haversine(lat1: float, lon1: float, lat2: float, lon2: float) → float`
- `crear_coordenadas() → ?`
- `calcular_matriz_distancias(coordenadas: ?) → ?`
- `resolver_tsp(matriz_distancias: np.ndarray) → ?`
- `mostrar_resultados(orden: ?, nombres: ?, matriz_distancias: np.ndarray) → ?`
- `main() → ?`

### `app/core/strategy.py`

- **class RoutingStrategy(ABC)**
  - `calculate_route(origin: ?, destination: ?) → ?`
  - `optimize_route(origin: ?, waypoints: ?) → ?`

### `app/main.py`

- `root()`

### `tests/test_prototipo_ruta_ficticia.py`

- `ejecutar_demo()`


## Mapa auto-generado: Scraper (Scrapy)

**8 archivos .py** detectados


### `research/test_jumbo.py`

- **class JumboExtractionTest(unittest.TestCase)**
  - `test_extract_names_from_json_ld()`
  - `test_category_is_taken_from_url()`
  - `test_extracts_comparison_fields()`
  - `test_page_url_preserves_category()`

### `scraper_core/items.py`

- **class ScraperCoreItem**

### `scraper_core/middlewares.py`

- **class ScraperCoreSpiderMiddleware**
  - `from_crawler(cls, crawler)`
  - `process_spider_input(response, spider)`
  - `process_spider_output(response, result, spider)`
  - `process_spider_exception(response, exception, spider)`
  - `async process_start(start)`
  - `spider_opened(spider)`
- **class ScraperCoreDownloaderMiddleware**
  - `from_crawler(cls, crawler)`
  - `process_request(request, spider)`
  - `process_response(request, response, spider)`
  - `process_exception(request, exception, spider)`
  - `spider_opened(spider)`

### `scraper_core/pipelines.py`

- **class ScraperCorePipeline**
  - `process_item(item)`

### `scraper_core/settings.py`


### `scraper_core/spiders/jumbo.py`

- **class JumboRscSpider(scrapy.Spider)**
  - `parse(response)`
  - `start_requests()`
  - `_page_url(category_url, page)`
  - `handle_error(failure)`
  - `__init__()`
  - `from_crawler(cls, crawler)`
  - `_read_category_urls(cls)`
  - `_append_category_url(url)`
  - `_extract_products(response)`
  - `_first_value(data)`
  - `_first_price(data)`
  - `_normal_price(entry)`
  - `_stock_value(availability)`
  - `_walk_json(value)`


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

