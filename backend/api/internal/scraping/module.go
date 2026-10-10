// Package scraping compone la coordinación de trabajos y la ingesta transitoria.
package scraping

import (
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/scraping/internal/handlers"
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/scraping/internal/repositories"
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/scraping/internal/routes"
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/scraping/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Module struct {
	handler *handlers.ScraperHandler
}

func New(db *gorm.DB, rdb *redis.Client) *Module {
	trabajos := repositories.NewTrabajoRepository(db)
	ingesta := repositories.NewIngestaLegacyRepository(db)
	service := services.NewScraperService(trabajos, ingesta)
	return &Module{handler: handlers.NewScraperHandler(service, rdb)}
}

func (m *Module) RegisterRoutes(group *gin.RouterGroup) {
	routes.RegistrarRutasScraper(group, m.handler)
}
