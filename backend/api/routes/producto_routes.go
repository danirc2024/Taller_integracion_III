package routes

import (
	"github.com/danirc2024/Taller_integracion_III/backend/api/handlers"
	"github.com/danirc2024/Taller_integracion_III/backend/api/repositories"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegistrarRutasProductos conecta la inyección de dependencias de la capa de productos
// y expone el endpoint público de catálogo bajo /api/v1/productos sin requerir autenticación
func RegistrarRutasProductos(rg *gin.RouterGroup, db *gorm.DB) {
	productoRepo := repositories.NewProductoRepository(db)
	productoService := services.NewProductoService(productoRepo)
	productoHandler := handlers.NewProductoHandler(productoService)

	rg.GET("/productos", productoHandler.ObtenerProductos)
}
