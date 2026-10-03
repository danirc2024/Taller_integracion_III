package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/danirc2024/Taller_integracion_III/backend/api/utils"
	"github.com/gin-gonic/gin"
)

// RequireAuth intercepta la petición HTTP validando el token en la cookie segura HttpOnly 'jwt'
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("jwt")
		if err != nil || strings.TrimSpace(tokenString) == "" {
			ResponderError(
				c,
				http.StatusUnauthorized,
				"Cookie de autenticación requerida.",
				errors.New("cookie 'jwt' ausente o no autorizada"),
			)
			return
		}

		token, err := utils.ValidarToken(strings.TrimSpace(tokenString))
		if err != nil || token == nil || !token.Valid {
			ResponderError(
				c,
				http.StatusUnauthorized,
				"Token inválido o expirado.",
				err,
			)
			return
		}

		claims, ok := token.Claims.(*utils.JWTClaims)
		if !ok {
			ResponderError(
				c,
				http.StatusUnauthorized,
				"Claims del token inválidos.",
				errors.New("no fue posible procesar la información de identidad del token"),
			)
			return
		}

		// Inyectar claims en el contexto de Gin para consumo de las rutas protegidas
		c.Set("user_id", claims.UserID)
		c.Set("rol", claims.Rol)
		c.Set("provider", claims.Provider)

		c.Next()
	}
}
