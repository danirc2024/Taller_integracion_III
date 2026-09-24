package routes

import (
	"github.com/danirc2024/Taller_integracion_III/backend/api/handlers"
	"github.com/danirc2024/Taller_integracion_III/backend/api/middleware"
	"github.com/danirc2024/Taller_integracion_III/backend/api/repositories"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// RegistrarRutasAuth conecta la cadena de inyección de dependencias (DB -> Repo -> Service -> Handler)
// y expone los endpoints de autenticación bajo el grupo proporcionado.
func RegistrarRutasAuth(rg *gin.RouterGroup, db *gorm.DB, rdb *redis.Client) {
	usuarioRepo := repositories.NewUsuarioRepository(db)
	authService := services.NewAuthService(usuarioRepo)
	authHandler := handlers.NewAuthHandler(authService)

	auth := rg.Group("/auth")
	{
		auth.POST("/register", authHandler.RegistrarUsuario)
		auth.POST("/login", middleware.RateLimitLogin(rdb), authHandler.LoginUsuario)
	}
}
