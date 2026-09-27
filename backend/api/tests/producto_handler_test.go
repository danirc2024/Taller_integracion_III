package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/danirc2024/Taller_integracion_III/backend/api/domain"
	"github.com/danirc2024/Taller_integracion_III/backend/api/handlers"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
	"github.com/gin-gonic/gin"
)

func TestProductoHandler_ObtenerProductos(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockRepo := &mockProductoRepository{
		items: []domain.ProductoDTO{
			{
				ID:           "test-uuid-1",
				Nombre:       "Arroz Grado 1",
				Marca:        "Tucapel",
				Categoria:    "Despensa",
				Supermercado: "Lider",
				Precio:       1290,
				PrecioNormal: 1490,
				EnOferta:     true,
			},
		},
		total: 1,
	}

	service := services.NewProductoService(mockRepo)
	handler := handlers.NewProductoHandler(service)

	router := gin.New()
	router.GET("/api/v1/productos", handler.ObtenerProductos)

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/productos?page=2&limit=10&categoria=Despensa&supermercado=Lider&precio_min=1000&precio_max=2000&en_oferta=true&sort_by=nombre&order=desc", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("se esperaba código 200, se obtuvo %d. Body: %s", w.Code, w.Body.String())
	}

	var response domain.PaginaProductosDTO
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("error parseando JSON de respuesta: %v", err)
	}

	if len(response.Data) != 1 {
		t.Fatalf("se esperaba 1 producto, se obtuvieron %d", len(response.Data))
	}

	if response.Data[0].Nombre != "Arroz Grado 1" {
		t.Errorf("se esperaba 'Arroz Grado 1', se obtuvo '%s'", response.Data[0].Nombre)
	}
}

func TestProductoHandler_ObtenerDetalleProducto(t *testing.T) {
	gin.SetMode(gin.TestMode)

	fecha := time.Date(2026, 9, 27, 12, 0, 0, 0, time.UTC)
	oferta := 890.0
	mockRepo := &mockProductoRepository{
		detalle: &domain.ProductoDetalleDTO{
			ProductoDTO: domain.ProductoDTO{
				ID:           "prod-uuid-xyz",
				Nombre:       "Leche Chocolate 1L",
				Marca:        "Colun",
				Categoria:    "Lácteos",
				Supermercado: "Jumbo",
				Precio:       890,
				PrecioNormal: 1090,
				PrecioOferta: &oferta,
				EnOferta:     true,
			},
			Historial: []domain.HistorialPrecioDTO{
				{
					PrecioNormal: 1090,
					PrecioOferta: &oferta,
					CapturadoEl:  fecha,
				},
			},
		},
	}

	service := services.NewProductoService(mockRepo)
	handler := handlers.NewProductoHandler(service)

	router := gin.New()
	router.GET("/api/v1/productos/:id", handler.ObtenerDetalleProducto)

	t.Run("200 OK cuando existe", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/productos/prod-uuid-xyz", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("se esperaba HTTP 200, se obtuvo %d. Body: %s", w.Code, w.Body.String())
		}

		var res domain.ProductoDetalleDTO
		if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
			t.Fatalf("error parseando respuesta: %v", err)
		}

		if res.ID != "prod-uuid-xyz" {
			t.Errorf("se esperaba prod-uuid-xyz, se obtuvo %s", res.ID)
		}
		if len(res.Historial) != 1 {
			t.Errorf("se esperaba 1 registro histórico, se obtuvieron %d", len(res.Historial))
		}
	})

	t.Run("404 Not Found cuando no existe", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/productos/no-existe", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Fatalf("se esperaba HTTP 404, se obtuvo %d. Body: %s", w.Code, w.Body.String())
		}
	})
}
