package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/danirc2024/Taller_integracion_III/backend/api/handlers"
	"github.com/danirc2024/Taller_integracion_III/backend/api/repositories"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
)

// RegistrarRutasScraper configura los endpoints de ingesta de datos y ciclo de vida de arañas
// bajo el prefijo /api/v1/scraper
func RegistrarRutasScraper(rg *gin.RouterGroup, db *gorm.DB) {
	scraperRepo := repositories.NewScraperRepository(db)
	scraperService := services.NewScraperService(scraperRepo)
	scraperHandler := handlers.NewScraperHandler(scraperService)

	scraper := rg.Group("/scraper")
	{
		// Auditoría y ciclo de vida de arañas
		scraper.POST("/trabajos", scraperHandler.IniciarTrabajo)
		scraper.GET("/trabajos/:id", scraperHandler.ObtenerTrabajo)
		scraper.PUT("/trabajos/:id/finalizar", scraperHandler.FinalizarTrabajo)

		// Ingesta de productos (con sesión de trabajo o directa)
		scraper.POST("/trabajos/:id/productos", scraperHandler.IngestarProductosConTrabajo)
		scraper.POST("/productos", scraperHandler.IngestarProductosDirecto)
	}
}
