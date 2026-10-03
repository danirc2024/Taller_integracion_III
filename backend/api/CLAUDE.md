# Microservicio: API Gateway (Go 1.26 + Gin + GORM)

Puerto: 8080 | Dockerfile: Dockerfile | Entry: main.go

## Estructura de paquetes

```
main.go (package main) ──→ docs (blank import para Swagger init)
infrastructure/models.go   (23 modelos GORM, 3 esquemas PostgreSQL)
utils/security.go          (sanitización de inputs)
docs/docs.go               (auto-generado por swaggo/swag)
```

## Dependencias externas (go.mod)

- gin-gonic/gin v1.12.0 — Framework HTTP
- gorm.io/gorm v1.31.2 + gorm.io/driver/postgres v1.6.2 — ORM + driver pgx/v5
- google/uuid v1.6.0 — UUIDs
- swaggo/swag + swaggo/gin-swagger + swaggo/files — Swagger UI

## Funciones en main.go

- `initDB()`: conecta a PostgreSQL via DB_URL (env) o DSN por defecto
- `setupRouter() *gin.Engine`: configura Gin, CORS (orígenes *), monta rutas
- `RootHandler(c *gin.Context)`: GET / → JSON bienvenida + link a Swagger
- `main()`: inicializa DB, router, arranca en PORT (default 8080)

## Rutas registradas

- `GET /` → RootHandler
- `GET /swagger/*any` → Swagger UI

## Modelos GORM (infrastructure/models.go)

23 structs con TableName() explícito en 3 esquemas:

### Esquema api.*
Usuario, PreferencialDieteticaUsuario, DireccionUsuario, PerfilTransporteUsuario,
TarjetaFidelidadUsuario, MisionValidacion, Categoria, Marca, ProductoNormalizado,
EquivalenciaProducto, Receta, IngredienteReceta, MapeoProductoIA

### Esquema scraper.*
CadenaSupermercado, SucursalSupermercado, TrabajoScraper, ProductoCrudo, CapturaPrecio

### Esquema rutas.*
ListaCompra, ArticuloListaCompra, EjecucionOptimizacion, ParadaOptimizacion, DetalleArticuloParada

## Utilidades (utils/security.go)

- `SanitizarInputBusqueda(input string) string`: trim, trunca 100 chars, regex anti-inyección

## Convenciones

- Swagger: anotaciones @Summary, @Tags, @Router en cada handler
- Variable global DB *gorm.DB (inicializada en initDB)
- CORS permite todos los orígenes (desarrollo)
- tests/ existe pero vacío (solo .gitkeep)

<!-- ARCHITECTURE:AUTO-GENERATED — NO EDITAR DEBAJO DE ESTA LÍNEA -->

## Mapa auto-generado: API Gateway (Go + Gin)

**28 archivos .go** detectados


### `cmd/seed_productos/main.go` (package main)

- Structs: productoSemilla
- `main()`

### `domain/producto.go` (package domain)

- Structs: FiltroProductosDTO, ProductoDTO, MetadatosPaginacionDTO, PaginaProductosDTO, HistorialPrecioDTO, ProductoDetalleDTO

### `domain/scraper.go` (package domain)

- Structs: IniciarTrabajoDTO, TrabajoScraperDTO, FinalizarTrabajoDTO, ProductoScrapeadoDTO, IngestaLoteDTO, IngestaResultadoDTO

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

### `handlers/scraper_handler.go` (package handlers)

- Structs: ScraperHandler, ejecutarScraperRequest
- `NewScraperHandler(service services.ScraperService, rdb ...*redis.Client) *ScraperHandler`
- `(ScraperHandler).EjecutarTrabajo(c *gin.Context)`
- `(ScraperHandler).IniciarTrabajo(c *gin.Context)`
- `(ScraperHandler).FinalizarTrabajo(c *gin.Context)`
- `(ScraperHandler).ObtenerTrabajo(c *gin.Context)`
- `(ScraperHandler).IngestarProductosConTrabajo(c *gin.Context)`
- `(ScraperHandler).IngestarProductosDirecto(c *gin.Context)`
- `(ScraperHandler).manejarErrorIngesta(c *gin.Context, err error)`

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

### `repositories/scraper_repository.go` (package repositories)

- Structs: gormScraperRepository
- `NewScraperRepository(db *gorm.DB) ScraperRepository`
- `(gormScraperRepository).CrearTrabajo(ctx context.Context, trabajo *infrastructure.TrabajoScraper) error`
- `(gormScraperRepository).ObtenerTrabajoPorID(ctx context.Context, id uuid.UUID) (*infrastructure.TrabajoScraper, error)`
- `(gormScraperRepository).FinalizarTrabajo(ctx context.Context, id uuid.UUID, estado string, elementosExtraidos *int, registroErrores *string) (*infrastructure.TrabajoScraper, error)`
- `(gormScraperRepository).ObtenerCadena(ctx context.Context, cadenaID int, nombreCadena string) (*infrastructure.CadenaSupermercado, error)`
- `(gormScraperRepository).ObtenerSucursal(ctx context.Context, cadenaID int, sucursalID *int, codigoSucursal *string) (*infrastructure.SucursalSupermercado, error)`
- `(gormScraperRepository).IngestarLote(ctx context.Context, trabajoID *uuid.UUID, sucursalID int, productos []domain.ProductoScrapeadoDTO) (*domain.IngestaResultadoDTO, error)`

### `repositories/usuario_repository.go` (package repositories)

- Structs: gormUsuarioRepository
- `NewUsuarioRepository(db *gorm.DB) UsuarioRepository`
- `(gormUsuarioRepository).FindByEmail(ctx context.Context, email string) (*infrastructure.Usuario, error)`
- `(gormUsuarioRepository).Create(ctx context.Context, usuario *infrastructure.Usuario) error`

### `routes/auth_routes.go` (package routes)

- `RegistrarRutasAuth(rg *gin.RouterGroup, db *gorm.DB, rdb *redis.Client)`

### `routes/producto_routes.go` (package routes)

- `RegistrarRutasProductos(rg *gin.RouterGroup, db *gorm.DB)`

### `routes/scraper_routes.go` (package routes)

- `RegistrarRutasScraper(rg *gin.RouterGroup, db *gorm.DB, rdb *redis.Client)`

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

### `services/scraper_service.go` (package services)

- Structs: scraperService
- `NewScraperService(repo repositories.ScraperRepository) ScraperService`
- `(scraperService).IniciarTrabajo(ctx context.Context, input domain.IniciarTrabajoDTO) (*domain.TrabajoScraperDTO, error)`
- `(scraperService).FinalizarTrabajo(ctx context.Context, id string, input domain.FinalizarTrabajoDTO) (*domain.TrabajoScraperDTO, error)`
- `(scraperService).ObtenerTrabajo(ctx context.Context, id string) (*domain.TrabajoScraperDTO, error)`
- `(scraperService).IngestarProductos(ctx context.Context, trabajoIDStr *string, input domain.IngestaLoteDTO) (*domain.IngestaResultadoDTO, error)`
- `(scraperService).mapearTrabajoDTO(t *infrastructure.TrabajoScraper, cadenaNombre string) *domain.TrabajoScraperDTO`

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

### `tests/scraper_test.go` (package tests)

- Structs: mockScraperRepository
- `newMockScraperRepository() *mockScraperRepository`
- `(mockScraperRepository).CrearTrabajo(ctx context.Context, trabajo *infrastructure.TrabajoScraper) error`
- `(mockScraperRepository).ObtenerTrabajoPorID(ctx context.Context, id uuid.UUID) (*infrastructure.TrabajoScraper, error)`
- `(mockScraperRepository).FinalizarTrabajo(ctx context.Context, id uuid.UUID, estado string, elementosExtraidos *int, registroErrores *string) (*infrastructure.TrabajoScraper, error)`
- `(mockScraperRepository).ObtenerCadena(ctx context.Context, cadenaID int, nombreCadena string) (*infrastructure.CadenaSupermercado, error)`
- `(mockScraperRepository).ObtenerSucursal(ctx context.Context, cadenaID int, sucursalID *int, codigoSucursal *string) (*infrastructure.SucursalSupermercado, error)`
- `(mockScraperRepository).IngestarLote(ctx context.Context, trabajoID *uuid.UUID, sucursalID int, productos []domain.ProductoScrapeadoDTO) (*domain.IngestaResultadoDTO, error)`
- `TestScraperService_IniciarTrabajo_Exitoso(t *testing.T)`
- `TestScraperService_FinalizarTrabajo_Validaciones(t *testing.T)`
- `TestScraperService_IngestarProductos_LimitesYValidaciones(t *testing.T)`
- `TestScraperHandler_EndpointsHTTP(t *testing.T)`
- `stringPtr(s string) *string`

### `utils/jwt.go` (package utils)

- Structs: JWTClaims
- `getJWTSecret() []byte`
- `GenerarToken(usuarioID, rol, provider string) (string, error)`
- `ValidarToken(tokenString string) (*jwt.Token, error)`

### `utils/security.go` (package utils)

- `SanitizarInputBusqueda(input string) string`
- `HashPassword(password string) (string, error)`
- `CheckPasswordHash(password, hash string) bool`
