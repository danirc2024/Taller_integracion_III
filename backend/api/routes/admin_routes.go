package routes

import (
	"github.com/danirc2024/Taller_integracion_III/backend/api/handlers"
	"github.com/danirc2024/Taller_integracion_III/backend/api/repositories"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegistrarRutasAdmin centraliza las rutas de administración bajo el prefijo /admin
// protegidas por autenticación JWT y control de acceso basado en roles (RBAC).
func RegistrarRutasAdmin(rg *gin.RouterGroup, db *gorm.DB, requireAuth, requireAdmin gin.HandlerFunc) {
	productoRepo := repositories.NewProductoRepository(db)
	productoService := services.NewProductoService(productoRepo)
	productoHandler := handlers.NewProductoHandler(productoService)

	adminProductos := rg.Group("/admin/productos")
	adminProductos.Use(requireAuth, requireAdmin)
	{
		adminProductos.GET("", productoHandler.ObtenerProductosAdmin)
		adminProductos.GET("/", productoHandler.ObtenerProductosAdmin)
	}
}
