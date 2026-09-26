package middleware

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RespuestaError representa la estructura estandarizada de respuestas de error en JSON para la API
type RespuestaError struct {
	Estado  int    `json:"estado"`            // Código numérico del estado HTTP (400, 404, 500, etc.)
	Mensaje string `json:"mensaje"`           // Mensaje descriptivo amigable para el cliente
	Detalle string `json:"detalle,omitempty"` // Información técnica u origen del error
}

// ErrorHandler es el middleware global que intercepta panics no controlados y errores del contexto
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				// Captura cualquier panic no controlado en el servidor
				log.Printf("[PANIC RECOVERY] Excepción no controlada capturada: %v", r)

				detalle := fmt.Sprintf("%v", r)
				
				// Responder con estado HTTP 500 estandarizado
				c.JSON(http.StatusInternalServerError, RespuestaError{
					Estado:  http.StatusInternalServerError,
					Mensaje: "Ocurrió un error interno en el servidor.",
					Detalle: detalle,
				})

				// Detener la ejecución del pipeline de handlers
				c.Abort()
			}
		}()

		c.Next()

		// Procesar errores acumulados en el contexto Gin si aún no se ha escrito la respuesta
		if len(c.Errors) > 0 && !c.Writer.Written() {
			err := c.Errors.Last()
			log.Printf("[API ERROR] Error registrado en contexto: %v", err.Err)

			c.JSON(http.StatusBadRequest, RespuestaError{
				Estado:  http.StatusBadRequest,
				Mensaje: "Solicitud inválida o error en el procesamiento.",
				Detalle: err.Error(),
			})
		}
	}
}

// NotFoundHandler genera respuestas estandarizadas 404 para rutas inexistentes
func NotFoundHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusNotFound, RespuestaError{
			Estado:  http.StatusNotFound,
			Mensaje: "La ruta o recurso solicitado no existe.",
			Detalle: fmt.Sprintf("La ruta '%s %s' no está registrada en el servidor.", c.Request.Method, c.Request.URL.Path),
		})
	}
}

// MethodNotAllowedHandler genera respuestas estandarizadas 405 para métodos HTTP no permitidos
func MethodNotAllowedHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, RespuestaError{
			Estado:  http.StatusMethodNotAllowed,
			Mensaje: "El método HTTP utilizado no está permitido para este recurso.",
			Detalle: fmt.Sprintf("El método '%s' no es válido para '%s'.", c.Request.Method, c.Request.URL.Path),
		})
	}
}

// ResponderError es una función utilitaria exportada para emitir errores estandarizados desde cualquier handler
func ResponderError(c *gin.Context, estado int, mensaje string, err error) {
	detalle := ""
	if err != nil {
		detalle = err.Error()
	}

	c.JSON(estado, RespuestaError{
		Estado:  estado,
		Mensaje: mensaje,
		Detalle: detalle,
	})
	c.Abort()
}
