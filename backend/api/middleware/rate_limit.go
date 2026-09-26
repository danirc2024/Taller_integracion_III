package middleware

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// RateLimiterIP limita la cantidad máxima de solicitudes por IP dentro de una ventana de tiempo en Redis (Fail-Closed)
func RateLimiterIP(rdb *redis.Client, prefijo string, maxIntentos int64, ventana time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		if rdb == nil {
			// Fail-Closed: Bloqueo por defecto si Redis no está inicializado
			log.Println("[RATE LIMIT CRITICAL] Cliente Redis no disponible. Bloqueando petición (Fail-Closed).")
			ResponderError(
				c,
				http.StatusInternalServerError,
				"Servicio temporalmente no disponible",
				errors.New("el servicio de limitación de tasa no está configurado"),
			)
			return
		}

		ip := c.ClientIP()
		key := fmt.Sprintf("rate_limit:%s:%s", prefijo, ip)
		ctx := c.Request.Context()

		// Incrementa atómicamente el contador en Redis
		intentos, err := rdb.Incr(ctx, key).Result()
		if err != nil {
			// Fail-Closed: Bloqueo por defecto si Redis está caído o falla la consulta
			log.Printf("[RATE LIMIT CRITICAL] Error consultando Redis: %v. Bloqueando petición (Fail-Closed).", err)
			ResponderError(
				c,
				http.StatusInternalServerError,
				"Servicio temporalmente no disponible",
				err,
			)
			return
		}

		// En el primer intento (o si no tiene TTL asignado), fijar el tiempo de expiración
		if intentos == 1 {
			rdb.Expire(ctx, key, ventana)
		} else {
			ttl, err := rdb.TTL(ctx, key).Result()
			if err == nil && ttl == -1 {
				rdb.Expire(ctx, key, ventana)
			}
		}

		if intentos > maxIntentos {
			ResponderError(
				c,
				http.StatusTooManyRequests,
				"Demasiados intentos de acceso. Por favor, espere 15 minutos antes de volver a intentar.",
				errors.New("límite de peticiones excedido (máximo 5 intentos cada 15 minutos)"),
			)
			return
		}

		c.Next()
	}
}

// RateLimitLogin aplica la regla de seguridad de máximo 5 intentos por IP cada 15 minutos para el inicio de sesión
func RateLimitLogin(rdb *redis.Client) gin.HandlerFunc {
	return RateLimiterIP(rdb, "login", 5, 15*time.Minute)
}
