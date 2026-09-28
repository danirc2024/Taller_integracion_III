# Proyecto: Plataforma de Comparación de Precios y Optimización de Rutas

Stack: React 19 + Go 1.26 (Gin/GORM) + Python 3.11 (FastAPI) + PostgreSQL 15/PostGIS + Docker
Equipo: 6 integrantes, GitFlow estricto, Scrum semestral (UCT)

## Arquitectura de Microservicios

```
frontend/web/       → React 19 + Vite + TypeScript + Tailwind 4         (puerto 3000)
backend/api/        → Go 1.26 + Gin + GORM, API Gateway                 (puerto 8080)
backend/scraper/    → Python + Scrapy, extractor asíncrono               (standby worker)
backend/motor_rutas/→ Python + FastAPI + OR-Tools + OTP                 (puerto 8001)
backend/ia_conversacional/ → Python + FastAPI + Groq/Gemini              (puerto 8002)
```

Servicios de infraestructura: PostgreSQL 15+PostGIS, Redis (broker), OTP (rutas C++)

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

**22 archivos .go** detectados


### `cmd/seed_productos/main.go` (package main)

- Structs: productoSemilla
- `main()`

### `domain/producto.go` (package domain)

- Structs: FiltroProductosDTO, ProductoDTO, MetadatosPaginacionDTO, PaginaProductosDTO, HistorialPrecioDTO, ProductoDetalleDTO

### `handlers/auth_handler.go` (package handlers)

- Structs: RegistroRequest, RegistroResponse, LoginRequest, LoginResponse, AuthHandler, GoogleLoginRequest
- `NewAuthHandler(authService services.AuthService) *AuthHandler`
- `(AuthHandler).RegistrarUsuario(c *gin.Context)`
- `(AuthHandler).LoginUsuario(c *gin.Context)`
- `(AuthHandler).PerfilUsuario(c *gin.Context)`
- `(AuthHandler).GoogleLoginUsuario(c *gin.Context)`

### `handlers/producto_handler.go` (package handlers)

- Structs: ProductoHandler
- `NewProductoHandler(service services.ProductoService) *ProductoHandler`
- `(ProductoHandler).ObtenerProductos(c *gin.Context)`
- `(ProductoHandler).BuscarProductos(c *gin.Context)`
- `(ProductoHandler).ObtenerDetalleProducto(c *gin.Context)`

### `infrastructure/models.go` (package infrastructure)

- Structs: Usuario, PreferencialDieteticaUsuario, DireccionUsuario, PerfilTransporteUsuario, TarjetaFidelidadUsuario, MisionValidacion, Categoria, Marca, ProductoNormalizado, EquivalenciaProducto, Receta, IngredienteReceta, MapeoProductoIA, CadenaSupermercado, SucursalSupermercado, TrabajoScraper, ProductoCrudo, CapturaPrecio, ListaCompra, ArticuloListaCompra, EjecucionOptimizacion, ParadaOptimizacion, DetalleArticuloParada

### `main.go` (package main)

- `initDB()`
- `initRedis()`
- `setupRouter() *gin.Engine`
- `RootHandler(c *gin.Context)`
- `main()`

### `middleware/error_handler.go` (package middleware)

- Structs: RespuestaError
- `ErrorHandler() gin.HandlerFunc`
- `NotFoundHandler() gin.HandlerFunc`
- `MethodNotAllowedHandler() gin.HandlerFunc`
- `ResponderError(c *gin.Context, estado int, mensaje string, err error)`

### `middleware/jwt_auth.go` (package middleware)

- `RequireAuth() gin.HandlerFunc`

### `middleware/rate_limit.go` (package middleware)

- `RateLimiterIP(rdb *redis.Client, prefijo string, maxIntentos int64, ventana time.Duration) gin.HandlerFunc`
- `RateLimitLogin(rdb *redis.Client) gin.HandlerFunc`

### `repositories/producto_repository.go` (package repositories)

- Structs: gormProductoRepository
- `NewProductoRepository(db *gorm.DB) ProductoRepository`
- `(gormProductoRepository).Listar(ctx context.Context, filtro domain.FiltroProductosDTO) ([]domain.ProductoDTO, int64, error)`
- `(gormProductoRepository).ObtenerPorID(ctx context.Context, id string) (*domain.ProductoDetalleDTO, error)`

### `repositories/usuario_repository.go` (package repositories)

- Structs: gormUsuarioRepository
- `NewUsuarioRepository(db *gorm.DB) UsuarioRepository`
- `(gormUsuarioRepository).FindByEmail(ctx context.Context, email string) (*infrastructure.Usuario, error)`
- `(gormUsuarioRepository).Create(ctx context.Context, usuario *infrastructure.Usuario) error`

### `routes/auth_routes.go` (package routes)

- `RegistrarRutasAuth(rg *gin.RouterGroup, db *gorm.DB, rdb *redis.Client)`

### `routes/producto_routes.go` (package routes)

- `RegistrarRutasProductos(rg *gin.RouterGroup, db *gorm.DB)`

### `services/auth_service.go` (package services)

- Structs: RegistroDTO, UsuarioCreadoDTO, authService
- `NewAuthService(usuarioRepo repositories.UsuarioRepository) AuthService`
- `validarComplejidadPassword(password string) error`
- `(authService).Registrar(ctx context.Context, input RegistroDTO) (*UsuarioCreadoDTO, error)`
- `(authService).Login(correo, password string) (*infrastructure.Usuario, error)`
- `(authService).LoginWithContext(ctx context.Context, correo, password string) (*infrastructure.Usuario, error)`
- `(authService).GoogleLogin(ctx context.Context, tokenGoogle string) (*infrastructure.Usuario, error)`

### `services/producto_service.go` (package services)

- Structs: productoService
- `NewProductoService(repo repositories.ProductoRepository) ProductoService`
- `(productoService).ObtenerCatalogo(ctx context.Context, filtro domain.FiltroProductosDTO) (*domain.PaginaProductosDTO, error)`
- `(productoService).ObtenerPorID(ctx context.Context, id string) (*domain.ProductoDetalleDTO, error)`

### `tests/auth_service_test.go` (package tests)

- Structs: mockUsuarioRepository
- `newMockUsuarioRepository() *mockUsuarioRepository`
- `(mockUsuarioRepository).FindByEmail(ctx context.Context, email string) (*infrastructure.Usuario, error)`
- `(mockUsuarioRepository).Create(ctx context.Context, usuario *infrastructure.Usuario) error`
- `TestAuthService_PasswordComplexity(t *testing.T)`
- `TestAuthService_RegistroExitoso(t *testing.T)`
- `TestAuthService_Login(t *testing.T)`

### `tests/jwt_test.go` (package tests)

- `TestJWT_GenerarYValidarToken(t *testing.T)`
- `TestJWT_TokenInvalido(t *testing.T)`
- `TestMiddleware_RequireAuth(t *testing.T)`

### `tests/middleware_test.go` (package tests)

- `init()`
- `setupTestRouter() *gin.Engine`
- `TestNotFoundHandler(t *testing.T)`
- `TestMethodNotAllowedHandler(t *testing.T)`
- `TestPanicRecoveryHandler(t *testing.T)`
- `TestResponderError(t *testing.T)`

### `tests/producto_handler_test.go` (package tests)

- `TestProductoHandler_ObtenerProductos(t *testing.T)`
- `TestProductoHandler_BuscarProductos(t *testing.T)`
- `TestProductoHandler_ObtenerDetalleProducto(t *testing.T)`

### `tests/producto_service_test.go` (package tests)

- Structs: mockProductoRepository
- `(mockProductoRepository).Listar(ctx context.Context, filtro domain.FiltroProductosDTO) ([]domain.ProductoDTO, int64, error)`
- `(mockProductoRepository).ObtenerPorID(ctx context.Context, id string) (*domain.ProductoDetalleDTO, error)`
- `TestProductoService_ValoresPorDefecto(t *testing.T)`
- `TestProductoService_SanitizacionYLimites(t *testing.T)`
- `TestProductoService_Busqueda_Minimo3Caracteres(t *testing.T)`
- `TestProductoService_ObtenerPorID(t *testing.T)`

### `utils/jwt.go` (package utils)

- Structs: JWTClaims
- `getJWTSecret() []byte`
- `GenerarToken(usuarioID, rol, provider string) (string, error)`
- `ValidarToken(tokenString string) (*jwt.Token, error)`

### `utils/security.go` (package utils)

- `SanitizarInputBusqueda(input string) string`
- `HashPassword(password string) (string, error)`
- `CheckPasswordHash(password, hash string) bool`


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


### `app/algorithms/otp_ortools_strategy.py`

- Imports internos: app.core.strategy
- **class OTPOrToolsStrategy(RoutingStrategy)**
  - `__init__(otp_base_url: str)`
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

**11 archivos .py** detectados


### `research/test_jumbo.py`

- **class JumboExtractionTest(unittest.TestCase)**
  - `test_extract_names_from_json_ld()`
  - `test_category_is_taken_from_url()`
  - `test_extracts_comparison_fields()`
  - `test_page_url_preserves_category()`
  - `test_catalog_refresh_is_needed_when_never_updated()`
  - `test_catalog_refresh_handles_naive_datetime_without_type_error()`
  - `test_catalog_refresh_is_not_needed_while_fresh()`
  - `test_product_refresh_is_needed_after_ttl()`
  - `test_product_refresh_is_not_needed_while_fresh()`
  - `test_refresh_decision_marks_stale_product()`
  - `test_duplicate_refresh_request_is_skipped()`
  - `test_scheduler_marks_catalog_as_stale_after_interval()`
  - `test_queue_skips_duplicate_in_flight_refresh()`
  - `test_queue_schedules_stale_product_refresh()`
  - `test_queue_exposes_enqueued_product_for_processing()`
  - `test_worker_processes_next_product_and_releases_in_flight_lock()`
  - `test_worker_reports_failure_and_releases_in_flight_lock()`
  - `test_worker_propagates_structured_failure_from_executor()`
  - `test_worker_processes_all_pending_products()`
  - `test_result_publisher_sends_item_to_injected_sender()`
  - `test_result_publisher_reports_api_failure()`
  - `test_refresh_flow_consumes_queue_and_publishes_result()`
  - `test_scrapy_executor_runs_catalog_without_persisting_output_file()`
  - `test_scrapy_executor_targets_product_url_for_queued_job()`
  - `test_scheduler_decides_catalog_and_product_update_flow()`
  - `test_scheduler_accepts_future_api_configuration()`
  - `test_scheduler_can_force_catalog_refresh_from_manual_trigger()`
  - `test_scrapy_settings_use_ethic_rate_limit()`
  - `test_scrapy_retry_policy_handles_transient_errors()`
  - `test_404_page_stops_pagination_cleanly()`

### `scraper_core/freshness.py`

- **class RefreshQueue**
  - `__init__(product_ttl_seconds: int)`
  - `in_flight_refreshes()`
  - `mark_started(product_id)`
  - `mark_finished(product_id)`
  - `pop_next()`
  - `enqueue(product_id, last_updated_at, product_url)`
- **class RefreshWorker**
  - `__init__(queue, executor)`
  - `process_next()`
  - `process_all()`
- **class RefreshScheduler**
  - `__init__(catalog_interval_seconds: int, product_ttl_seconds: int, enabled: bool)`
  - `from_config(cls, config)`
  - `catalog_needs_refresh(last_updated_at)`
  - `product_needs_refresh(product_id, last_updated_at)`
  - `build_catalog_and_product_plan(last_catalog_updated_at, product_id, last_product_updated_at, force_catalog_refresh)`
- `_normalize_datetime(value)`
- `should_refresh_catalog(last_updated_at, interval_seconds: int) → bool`
- `should_refresh_product(last_updated_at, ttl_seconds: int) → bool`
- `build_refresh_decision(product_id, last_updated_at, ttl_seconds: int)`
- `should_skip_refresh(product_id, in_flight_refreshes)`

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

### `scraper_core/output.py`

- **class ScraperResultPublisher**
  - `__init__(sender)`
  - `publish(item)`

### `scraper_core/pipelines.py`

- **class ScraperCorePipeline**
  - `process_item(item)`

### `scraper_core/runtime.py`

- **class ScrapyCommandExecutor**
  - `__init__(command_runner, spider_name)`
  - `__call__(job)`
- `main()`

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

**55 archivos activos** (excluidos kebab-case obsoletos)


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
- Imports locales: ./contexts/CartContext, ./layouts/MainLayout, ./pages/Chatbot, ./pages/Crowdsourcing, ./pages/Dashboard, ./pages/History, ./pages/Home, ./pages/Login, ./pages/Onboarding, ./pages/ProductDetail, ./pages/Profile, ./pages/RouteViewer

### `app/router.tsx`

- Exports: AppRouter
- Imports locales: @/core/routes, @/layouts/AppShell, @/layouts/MainLayout, @/pages/Chatbot, @/pages/Crowdsourcing, @/pages/Dashboard, @/pages/History, @/pages/Home, @/pages/Login, @/pages/NotFound, @/pages/Onboarding, @/pages/ProductDetail, @/pages/Profile, @/pages/RouteViewer, @/pages/mocks/MockShell

### `components/BottomNav.tsx`

- Exports: BottomNav
- Tipos: BottomNavProps
- Imports locales: @/lib/utils

### `components/CartSidebar.tsx`

- Exports: CartSidebar
- Imports locales: @/components/ui/button, @/contexts/CartContext, @/data/mock

### `components/Footer.tsx`

- Exports: Footer

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

### `components/landing/LandingCTA.tsx`

- Exports: LandingCTA
- Imports locales: @/components/ui/button

### `components/landing/LandingFeatures.tsx`

- Exports: LandingFeatures
- Imports locales: @/data/landing.json

### `components/landing/LandingFooter.tsx`

- Exports: LandingFooter

### `components/landing/LandingHero.tsx`

- Exports: LandingHero
- Imports locales: @/components/ui/button, @/data/landing.json

### `components/landing/LandingNavbar.tsx`

- Exports: LandingNavbar
- Imports locales: @/components/ui/button, @/data/landing.json

### `components/landing/LandingSavings.tsx`

- Exports: LandingSavings
- Imports locales: @/components/ui/button, @/data/landing.json

### `components/landing/LandingStores.tsx`

- Exports: LandingStores
- Imports locales: @/data/landing.json

### `components/landing/LandingTrustStrip.tsx`

- Exports: LandingTrustStrip
- Imports locales: @/data/landing.json

### `components/landing/LandingWorks.tsx`

- Exports: LandingHowItWorks
- Imports locales: @/data/landing.json

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

### `components/ui/button.tsx`

- Tipos: VariantProps
- Imports locales: @/lib/utils

### `components/ui/field.tsx`

- Tipos: VariantProps
- Imports locales: @/components/ui/label, @/components/ui/separator, @/lib/utils

### `components/ui/tabs.tsx`

- Tipos: VariantProps
- Imports locales: @/lib/utils

### `contexts/CartContext.tsx`

- Exports: CartProvider, useCart
- Tipos: CartContextType, CartItem
- Imports locales: @/types

### `layouts/AppShell.tsx`

- Exports: AppShell
- Tipos: ActiveTab
- Imports locales: @/components/BottomNav

### `layouts/MainLayout.tsx`

- Exports: MainLayout, useLayoutContext
- Tipos: LayoutContextType
- Imports locales: @/components/CartSidebar, @/components/Sidebar, @/components/TopNav

### `pages/Chatbot.tsx`

- Exports: Chatbot
- Tipos: Message
- Imports locales: @/data/mock, @/lib/utils

### `pages/Crowdsourcing.tsx`

- Exports: Crowdsourcing
- Imports locales: @/components/Footer, @/data/mock, @/lib/utils

### `pages/Dashboard.tsx`

- Exports: Page
- Imports locales: @/components/Footer, @/components/ProductCard, @/contexts/CartContext, @/data/mock, @/layouts/MainLayout, @/types

### `pages/History.tsx`

- Exports: History
- Imports locales: @/components/Footer, @/lib/utils

### `pages/Home.tsx`

- Exports: Home
- Imports locales: @/components/landing/LandingCTA, @/components/landing/LandingFeatures, @/components/landing/LandingFooter, @/components/landing/LandingHero, @/components/landing/LandingNavbar, @/components/landing/LandingSavings, @/components/landing/LandingStores, @/components/landing/LandingTrustStrip, @/components/landing/LandingWorks

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
- Tipos: RelatedItem
- Imports locales: @/components/Footer, @/components/ui/button, @/contexts/CartContext, @/data/mock

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

