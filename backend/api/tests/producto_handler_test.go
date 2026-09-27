package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

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

	// Verificar que el handler extrajo y pasó correctamente los filtros al repositorio
	if mockRepo.lastFilter.Page != 2 {
		t.Errorf("se esperaba page=2, se obtuvo %d", mockRepo.lastFilter.Page)
	}
	if mockRepo.lastFilter.Limit != 10 {
		t.Errorf("se esperaba limit=10, se obtuvo %d", mockRepo.lastFilter.Limit)
	}
	if mockRepo.lastFilter.Categoria != "Despensa" {
		t.Errorf("se esperaba categoria=Despensa, se obtuvo %s", mockRepo.lastFilter.Categoria)
	}
	if mockRepo.lastFilter.Supermercado != "Lider" {
		t.Errorf("se esperaba supermercado=Lider, se obtuvo %s", mockRepo.lastFilter.Supermercado)
	}
	if mockRepo.lastFilter.PrecioMin == nil || *mockRepo.lastFilter.PrecioMin != 1000 {
		t.Errorf("se esperaba precio_min=1000")
	}
	if mockRepo.lastFilter.PrecioMax == nil || *mockRepo.lastFilter.PrecioMax != 2000 {
		t.Errorf("se esperaba precio_max=2000")
	}
	if mockRepo.lastFilter.EnOferta == nil || *mockRepo.lastFilter.EnOferta != true {
		t.Errorf("se esperaba en_oferta=true")
	}
	if mockRepo.lastFilter.SortBy != "nombre" {
		t.Errorf("se esperaba sort_by=nombre, se obtuvo %s", mockRepo.lastFilter.SortBy)
	}
	if mockRepo.lastFilter.Order != "desc" {
		t.Errorf("se esperaba order=desc, se obtuvo %s", mockRepo.lastFilter.Order)
	}
}
