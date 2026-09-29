package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/danirc2024/Taller_integracion_III/backend/api/domain"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
)

// ScraperHandler gestiona las peticiones HTTP del microservicio de scraping y bots
type ScraperHandler struct {
	service services.ScraperService
}

// NewScraperHandler inicializa una nueva instancia de ScraperHandler
func NewScraperHandler(service services.ScraperService) *ScraperHandler {
	return &ScraperHandler{service: service}
}

// IniciarTrabajo godoc
// @Summary      Inicia una sesión de scraping
// @Description  Registra el inicio de una araña de scraping para auditar su ciclo de vida y métricas
// @Tags         scraper
// @Accept       json
// @Produce      json
// @Param        input  body      domain.IniciarTrabajoDTO  true  "Datos de inicio de la sesión"
// @Success      201    {object}  domain.TrabajoScraperDTO
// @Failure      400    {object}  map[string]interface{}
// @Failure      404    {object}  map[string]interface{}
// @Failure      500    {object}  map[string]interface{}
// @Router       /api/v1/scraper/trabajos [post]
func (h *ScraperHandler) IniciarTrabajo(c *gin.Context) {
	var input domain.IniciarTrabajoDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Payload inválido para iniciar trabajo",
			"detalle": err.Error(),
		})
		return
	}

	trabajo, err := h.service.IniciarTrabajo(c.Request.Context(), input)
	if err != nil {
		if errors.Is(err, services.ErrCadenaNoEncontrada) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno al iniciar trabajo", "detalle": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, trabajo)
}

// FinalizarTrabajo godoc
// @Summary      Finaliza una sesión de scraping
// @Description  Marca el término del trabajo como completado o fallido, registrando métricas y errores
// @Tags         scraper
// @Accept       json
// @Produce      json
// @Param        id     path      string                   true  "UUID del trabajo de scraping"
// @Param        input  body      domain.FinalizarTrabajoDTO true  "Datos de cierre de la sesión"
// @Success      200    {object}  domain.TrabajoScraperDTO
// @Failure      400    {object}  map[string]interface{}
// @Failure      404    {object}  map[string]interface{}
// @Failure      409    {object}  map[string]interface{}
// @Failure      500    {object}  map[string]interface{}
// @Router       /api/v1/scraper/trabajos/{id}/finalizar [put]
func (h *ScraperHandler) FinalizarTrabajo(c *gin.Context) {
	id := c.Param("id")

	var input domain.FinalizarTrabajoDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Payload inválido para finalizar trabajo",
			"detalle": err.Error(),
		})
		return
	}

	trabajo, err := h.service.FinalizarTrabajo(c.Request.Context(), id, input)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrTrabajoNoEncontrado):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, services.ErrTrabajoYaFinalizado):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		case errors.Is(err, services.ErrEstadoTrabajoInvalido), errors.Is(err, services.ErrUUIDInvalido):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno al finalizar trabajo", "detalle": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, trabajo)
}

// ObtenerTrabajo godoc
// @Summary      Consulta el estado de una sesión de scraping
// @Description  Retorna los detalles, duración, conteo y errores de un trabajo (ideal para bots de Discord)
// @Tags         scraper
// @Produce      json
// @Param        id   path      string  true  "UUID del trabajo"
// @Success      200  {object}  domain.TrabajoScraperDTO
// @Failure      400  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Router       /api/v1/scraper/trabajos/{id} [get]
func (h *ScraperHandler) ObtenerTrabajo(c *gin.Context) {
	id := c.Param("id")

	trabajo, err := h.service.ObtenerTrabajo(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, services.ErrTrabajoNoEncontrado) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrUUIDInvalido) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno al consultar trabajo", "detalle": err.Error()})
		return
	}

	c.JSON(http.StatusOK, trabajo)
}

// IngestarProductosConTrabajo godoc
// @Summary      Almacena un lote de productos asociado a un trabajo
// @Description  Realiza el upsert de productos crudos y guarda sus capturas de precios vinculados a una sesión
// @Tags         scraper
// @Accept       json
// @Produce      json
// @Param        id     path      string                true  "UUID del trabajo de scraping"
// @Param        input  body      domain.IngestaLoteDTO true  "Lote de productos extraídos"
// @Success      200    {object}  domain.IngestaResultadoDTO
// @Failure      400    {object}  map[string]interface{}
// @Failure      404    {object}  map[string]interface{}
// @Failure      409    {object}  map[string]interface{}
// @Failure      500    {object}  map[string]interface{}
// @Router       /api/v1/scraper/trabajos/{id}/productos [post]
func (h *ScraperHandler) IngestarProductosConTrabajo(c *gin.Context) {
	id := c.Param("id")

	var input domain.IngestaLoteDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Payload inválido para ingesta de lote",
			"detalle": err.Error(),
		})
		return
	}

	resultado, err := h.service.IngestarProductos(c.Request.Context(), &id, input)
	if err != nil {
		h.manejarErrorIngesta(c, err)
		return
	}

	c.JSON(http.StatusOK, resultado)
}

// IngestarProductosDirecto godoc
// @Summary      Almacena un lote de productos de forma directa
// @Description  Guarda productos crudos y capturas de precio sin requerir una sesión de trabajo previa
// @Tags         scraper
// @Accept       json
// @Produce      json
// @Param        input  body      domain.IngestaLoteDTO true  "Lote de productos extraídos"
// @Success      200    {object}  domain.IngestaResultadoDTO
// @Failure      400    {object}  map[string]interface{}
// @Failure      404    {object}  map[string]interface{}
// @Failure      500    {object}  map[string]interface{}
// @Router       /api/v1/scraper/productos [post]
func (h *ScraperHandler) IngestarProductosDirecto(c *gin.Context) {
	var input domain.IngestaLoteDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Payload inválido para ingesta de lote",
			"detalle": err.Error(),
		})
		return
	}

	resultado, err := h.service.IngestarProductos(c.Request.Context(), nil, input)
	if err != nil {
		h.manejarErrorIngesta(c, err)
		return
	}

	c.JSON(http.StatusOK, resultado)
}

func (h *ScraperHandler) manejarErrorIngesta(c *gin.Context, err error) {
	switch {
	case errors.Is(err, services.ErrTrabajoNoEncontrado), errors.Is(err, services.ErrSucursalNoEncontrada):
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case errors.Is(err, services.ErrTrabajoYaFinalizado):
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	case errors.Is(err, services.ErrLoteVacio), errors.Is(err, services.ErrLoteExcedeMaximo), errors.Is(err, services.ErrUUIDInvalido):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno durante la ingesta", "detalle": err.Error()})
	}
}
