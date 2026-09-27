package repositories

import (
	"context"
	"fmt"
	"strings"

	"github.com/danirc2024/Taller_integracion_III/backend/api/domain"
	"gorm.io/gorm"
)

// ProductoRepository define el contrato para operaciones sobre el catálogo de productos
type ProductoRepository interface {
	Listar(ctx context.Context, filtro domain.FiltroProductosDTO) ([]domain.ProductoDTO, int64, error)
}

type gormProductoRepository struct {
	db *gorm.DB
}

// NewProductoRepository inicializa el repositorio de productos con GORM
func NewProductoRepository(db *gorm.DB) ProductoRepository {
	return &gormProductoRepository{db: db}
}

// Listar ejecuta la consulta dinámica sobre scraper.productos_crudos con joins a sucursales,
// cadenas y capturas de precio, aplicando filtros, ordenamiento y paginación.
func (r *gormProductoRepository) Listar(ctx context.Context, filtro domain.FiltroProductosDTO) ([]domain.ProductoDTO, int64, error) {
	// 1. Consulta base uniendo productos, sucursales, cadenas y la captura de precio más reciente
	baseQuery := r.db.WithContext(ctx).
		Table("scraper.productos_crudos pc").
		Joins("JOIN scraper.sucursales_supermercado ss ON pc.sucursal_id = ss.id").
		Joins("JOIN scraper.cadenas_supermercado cs ON ss.cadena_id = cs.id").
		Joins("LEFT JOIN LATERAL (SELECT precio_normal, precio_oferta, esta_disponible FROM scraper.capturas_precios WHERE producto_crudo_id = pc.id ORDER BY capturado_el DESC LIMIT 1) cp ON true")

	// 2. Encadenamiento dinámico de cláusulas .Where()
	if filtro.Categoria != "" {
		baseQuery = baseQuery.Where("pc.categoria_cruda ILIKE ?", "%"+filtro.Categoria+"%")
	}

	if filtro.Supermercado != "" {
		baseQuery = baseQuery.Where("cs.nombre ILIKE ?", "%"+filtro.Supermercado+"%")
	}

	if filtro.Marca != "" {
		baseQuery = baseQuery.Where("pc.marca_cruda ILIKE ?", "%"+filtro.Marca+"%")
	}

	if filtro.PrecioMin != nil {
		baseQuery = baseQuery.Where("COALESCE(cp.precio_oferta, cp.precio_normal, 0) >= ?", *filtro.PrecioMin)
	}

	if filtro.PrecioMax != nil {
		baseQuery = baseQuery.Where("COALESCE(cp.precio_oferta, cp.precio_normal, 0) <= ?", *filtro.PrecioMax)
	}

	if filtro.EnOferta != nil {
		if *filtro.EnOferta {
			baseQuery = baseQuery.Where("cp.precio_oferta IS NOT NULL AND cp.precio_oferta < cp.precio_normal")
		} else {
			baseQuery = baseQuery.Where("cp.precio_oferta IS NULL OR cp.precio_oferta >= cp.precio_normal")
		}
	}

	// 3. Conteo total de registros sin paginar
	var total int64
	if err := baseQuery.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 4. Configurar cláusula de ordenamiento seguro
	direction := "ASC"
	if strings.EqualFold(filtro.Order, "desc") {
		direction = "DESC"
	}

	var orderClause string
	switch strings.ToLower(filtro.SortBy) {
	case "nombre":
		orderClause = fmt.Sprintf("pc.titulo_crudo %s, pc.id ASC", direction)
	case "marca":
		orderClause = fmt.Sprintf("pc.marca_cruda %s, pc.id ASC", direction)
	default: // "precio" por defecto
		orderClause = fmt.Sprintf("COALESCE(cp.precio_oferta, cp.precio_normal, 0) %s, pc.id ASC", direction)
	}

	// 5. Paginación (.Offset y .Limit)
	offset := (filtro.Page - 1) * filtro.Limit
	if offset < 0 {
		offset = 0
	}

	selectCols := `
		pc.id::text AS id,
		pc.titulo_crudo AS nombre,
		COALESCE(pc.marca_cruda, '') AS marca,
		COALESCE(pc.categoria_cruda, '') AS categoria,
		cs.nombre AS supermercado,
		COALESCE(cp.precio_oferta, cp.precio_normal, 0) AS precio,
		COALESCE(cp.precio_normal, 0) AS precio_normal,
		cp.precio_oferta,
		(cp.precio_oferta IS NOT NULL AND cp.precio_oferta < cp.precio_normal) AS en_oferta,
		COALESCE(pc.url_imagen, '') AS url_imagen,
		COALESCE(pc.formato_crudo, '') AS unidad,
		pc.en_stock
	`

	var items []domain.ProductoDTO
	err := baseQuery.
		Select(selectCols).
		Order(orderClause).
		Limit(filtro.Limit).
		Offset(offset).
		Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}

	if items == nil {
		items = []domain.ProductoDTO{}
	}

	return items, total, nil
}
