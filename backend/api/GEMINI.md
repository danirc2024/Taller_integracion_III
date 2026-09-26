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
