// Package identity es la entrada pública del módulo de identidad.
// Sus entidades, casos de uso y adaptadores permanecen privados.
package identity

import (
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/identity/internal/handlers"
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/identity/internal/middleware"
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/identity/internal/repositories"
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/identity/internal/routes"
	"github.com/danirc2024/Taller_integracion_III/backend/api/internal/identity/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Module struct {
	handler *handlers.AuthHandler
	redis   *redis.Client
}

func New(db *gorm.DB, rdb *redis.Client) *Module {
	repo := repositories.NewUsuarioRepository(db)
	return &Module{handler: handlers.NewAuthHandler(services.NewAuthService(repo)), redis: rdb}
}

func (m *Module) RegisterRoutes(group *gin.RouterGroup) {
	routes.RegistrarRutasAuth(group, m.handler, m.redis)
}

// RequireAuth entrega el interceptor sin exponer claves, JWT ni entidades internas.
func (m *Module) RequireAuth() gin.HandlerFunc {
	return middleware.RequireAuth()
}

func (m *Module) RequireRole(roles ...string) gin.HandlerFunc {
	return middleware.RequireRole(roles...)
}
