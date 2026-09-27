package routes

import (
	"github.com/danirc2024/Taller_integracion_III/backend/api/handlers"
	"github.com/danirc2024/Taller_integracion_III/backend/api/repositories"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegistrarRutasProductos conecta la inyección de dependencias de la capa de productos
// y expone los endpoints públicos de catálogo, búsqueda y detalle bajo /api/v1/productos
func RegistrarRutasProductos(rg *gin.RouterGroup, db *gorm.DB) {
	productoRepo := repositories.NewProductoRepository(db)
	productoService := services.NewProductoService(productoRepo)
	productoHandler := handlers.NewProductoHandler(productoService)

	rg.GET("/productos", productoHandler.ObtenerProductos)
	// IMPORTANTE: /productos/buscar debe registrarse antes de /productos/:id para evitar conflictos de enrutamiento
	rg.GET("/productos/buscar", productoHandler.BuscarProductos)
	rg.GET("/productos/:id", productoHandler.ObtenerDetalleProducto)
}
