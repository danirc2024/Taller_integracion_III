package handlers

import (
	"errors"
	"net/http"

	"github.com/danirc2024/Taller_integracion_III/backend/api/middleware"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
	"github.com/gin-gonic/gin"
)

// RegistroRequest DTO de entrada para la creación de cuenta
type RegistroRequest struct {
	Correo         string `json:"correo" binding:"required,email" example:"usuario.test@uct.cl"`
	Password       string `json:"password" binding:"required" example:"PasswordSegura123!"`
	NombreCompleto string `json:"nombre_completo" binding:"required" example:"Vicente Matu"`
}

// RegistroResponse DTO de salida sin exponer credenciales
type RegistroResponse struct {
	ID                string `json:"id" example:"a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"`
	Correo            string `json:"correo" example:"usuario.test@uct.cl"`
	NombreCompleto    string `json:"nombre_completo" example:"Vicente Matu"`
	Rol               string `json:"rol" example:"registrado"`
	EstaActivo        bool   `json:"esta_activo" example:"false"`
	TokenVerificacion string `json:"token_verificacion" example:"f81d4fae-7dec-11d0-a765-00a0c91e6bf6"`
	Mensaje           string `json:"mensaje" example:"Usuario registrado con éxito. Se requiere confirmar el correo electrónico antes de iniciar sesión."`
}

// AuthHandler gestiona las peticiones HTTP del módulo de autenticación
type AuthHandler struct {
	authService services.AuthService
}

// NewAuthHandler construye el handler inyectando el servicio de autenticación
func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// RegistrarUsuario godoc
// @Summary      Registrar nuevo usuario con verificación
// @Description  Valida complejidad de contraseña, encripta con bcrypt y crea usuario inactivo con token UUID de verificación
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        payload body RegistroRequest true "Datos de registro"
// @Success      201  {object}  RegistroResponse
// @Failure      400  {object}  middleware.RespuestaError
// @Failure      409  {object}  middleware.RespuestaError
// @Failure      500  {object}  middleware.RespuestaError
// @Router       /api/v1/auth/register [post]
func (h *AuthHandler) RegistrarUsuario(c *gin.Context) {
	var req RegistroRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.ResponderError(c, http.StatusBadRequest, "Datos de entrada inválidos o incompletos.", err)
		return
	}

	dto := services.RegistroDTO{
		Correo:         req.Correo,
		Password:       req.Password,
		NombreCompleto: req.NombreCompleto,
	}

	creado, err := h.authService.Registrar(c.Request.Context(), dto)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrPasswordInvalido):
			middleware.ResponderError(c, http.StatusBadRequest, err.Error(), err)
		case errors.Is(err, services.ErrCorreoDuplicado):
			middleware.ResponderError(c, http.StatusConflict, err.Error(), err)
		default:
			middleware.ResponderError(c, http.StatusInternalServerError, "Error interno procesando el registro.", err)
		}
		return
	}

	c.JSON(http.StatusCreated, RegistroResponse{
		ID:                creado.ID.String(),
		Correo:            creado.Correo,
		NombreCompleto:    creado.NombreCompleto,
		Rol:               creado.Rol,
		EstaActivo:        creado.EstaActivo,
		TokenVerificacion: creado.TokenVerificacion.String(),
		Mensaje:           creado.Mensaje,
	})
}
