package tests

import (
	"context"
	"testing"

	"github.com/danirc2024/Taller_integracion_III/backend/api/domain"
	"github.com/danirc2024/Taller_integracion_III/backend/api/services"
)

// mockProductoRepository simula la capa de acceso a datos para pruebas unitarias
type mockProductoRepository struct {
	items []domain.ProductoDTO
	total int64
	err   error
	lastFilter domain.FiltroProductosDTO
}

func (m *mockProductoRepository) Listar(ctx context.Context, filtro domain.FiltroProductosDTO) ([]domain.ProductoDTO, int64, error) {
	m.lastFilter = filtro
	if m.err != nil {
		return nil, 0, m.err
	}
	return m.items, m.total, nil
}

func TestProductoService_ValoresPorDefecto(t *testing.T) {
	mockRepo := &mockProductoRepository{
		items: []domain.ProductoDTO{
			{ID: "prod-1", Nombre: "Leche", Precio: 1000},
		},
		total: 45,
	}

	service := services.NewProductoService(mockRepo)

	// Invocamos con filtro vacío
	res, err := service.ObtenerCatalogo(context.Background(), domain.FiltroProductosDTO{})
	if err != nil {
		t.Fatalf("se esperaba nil error, se obtuvo: %v", err)
	}

	// Verificar defaults recibidos por el repositorio
	if mockRepo.lastFilter.Page != 1 {
		t.Errorf("se esperaba Page=1, se obtuvo %d", mockRepo.lastFilter.Page)
	}
	if mockRepo.lastFilter.Limit != 20 {
		t.Errorf("se esperaba Limit=20, se obtuvo %d", mockRepo.lastFilter.Limit)
	}
	if mockRepo.lastFilter.SortBy != "precio" {
		t.Errorf("se esperaba SortBy=precio, se obtuvo %s", mockRepo.lastFilter.SortBy)
	}
	if mockRepo.lastFilter.Order != "asc" {
		t.Errorf("se esperaba Order=asc, se obtuvo %s", mockRepo.lastFilter.Order)
	}

	// Verificar metadatos de paginación calculados
	if res.Paginacion.TotalRegistros != 45 {
		t.Errorf("se esperaba TotalRegistros=45, se obtuvo %d", res.Paginacion.TotalRegistros)
	}
	if res.Paginacion.TotalPaginas != 3 {
		t.Errorf("se esperaba TotalPaginas=3 (45/20 redondeado hacia arriba), se obtuvo %d", res.Paginacion.TotalPaginas)
	}
	if res.Paginacion.PaginaActual != 1 {
		t.Errorf("se esperaba PaginaActual=1, se obtuvo %d", res.Paginacion.PaginaActual)
	}
}

func TestProductoService_SanitizacionYLimites(t *testing.T) {
	mockRepo := &mockProductoRepository{
		items: []domain.ProductoDTO{},
		total: 0,
	}

	service := services.NewProductoService(mockRepo)

	filtro := domain.FiltroProductosDTO{
		Page:         -5,
		Limit:        500, // Debe ser limitado a 100
		Categoria:    "Lácteos'; DROP TABLE usuarios;--",
		Supermercado: "Jumbo <script>",
		Marca:        "Colun@#$%",
		SortBy:       "invalido",
		Order:        "DESC",
	}

	_, err := service.ObtenerCatalogo(context.Background(), filtro)
	if err != nil {
		t.Fatalf("se esperaba nil error, se obtuvo: %v", err)
	}

	if mockRepo.lastFilter.Page != 1 {
		t.Errorf("se esperaba Page=1 al recibir valor negativo, se obtuvo %d", mockRepo.lastFilter.Page)
	}
	if mockRepo.lastFilter.Limit != 100 {
		t.Errorf("se esperaba Limit acotado a 100, se obtuvo %d", mockRepo.lastFilter.Limit)
	}
	if mockRepo.lastFilter.SortBy != "precio" {
		t.Errorf("se esperaba SortBy por defecto ante valor no permitido, se obtuvo %s", mockRepo.lastFilter.SortBy)
	}
	if mockRepo.lastFilter.Order != "desc" {
		t.Errorf("se esperaba Order=desc, se obtuvo %s", mockRepo.lastFilter.Order)
	}
	// Comprobar sanitización
	if mockRepo.lastFilter.Categoria != "Lácteos DROP TABLE usuarios--" && mockRepo.lastFilter.Categoria != "Lácteos DROP TABLE usuarios" {
		// el regex de sanitización quita comillas y punto y coma
		if mockRepo.lastFilter.Categoria == "Lácteos'; DROP TABLE usuarios;--" {
			t.Errorf("la categoría no fue sanitizada: %s", mockRepo.lastFilter.Categoria)
		}
	}
}
