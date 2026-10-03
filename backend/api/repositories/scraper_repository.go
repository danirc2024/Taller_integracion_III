package repositories

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/danirc2024/Taller_integracion_III/backend/api/domain"
	"github.com/danirc2024/Taller_integracion_III/backend/api/infrastructure"
)

// ScraperRepository define las operaciones de persistencia para el ciclo de scraping y almacenamiento.
type ScraperRepository interface {
	CrearTrabajo(ctx context.Context, trabajo *infrastructure.TrabajoScraper) error
	ObtenerTrabajoPorID(ctx context.Context, id uuid.UUID) (*infrastructure.TrabajoScraper, error)
	FinalizarTrabajo(ctx context.Context, id uuid.UUID, estado string, elementosExtraidos *int, registroErrores *string) (*infrastructure.TrabajoScraper, error)
	ObtenerCadena(ctx context.Context, cadenaID int, nombreCadena string) (*infrastructure.CadenaSupermercado, error)
	ObtenerSucursal(ctx context.Context, cadenaID int, sucursalID *int, codigoSucursal *string) (*infrastructure.SucursalSupermercado, error)
	IngestarLote(ctx context.Context, trabajoID *uuid.UUID, sucursalID int, productos []domain.ProductoScrapeadoDTO) (*domain.IngestaResultadoDTO, error)
}

type gormScraperRepository struct {
	db *gorm.DB
}

// NewScraperRepository crea una nueva instancia del repositorio de scraping
func NewScraperRepository(db *gorm.DB) ScraperRepository {
	return &gormScraperRepository{db: db}
}

// CrearTrabajo inserta una nueva ejecución en scraper.trabajos_scraper
func (r *gormScraperRepository) CrearTrabajo(ctx context.Context, trabajo *infrastructure.TrabajoScraper) error {
	return r.db.WithContext(ctx).Create(trabajo).Error
}

// ObtenerTrabajoPorID busca un trabajo por su UUID e incluye los datos de la cadena
func (r *gormScraperRepository) ObtenerTrabajoPorID(ctx context.Context, id uuid.UUID) (*infrastructure.TrabajoScraper, error) {
	var trabajo infrastructure.TrabajoScraper
	err := r.db.WithContext(ctx).
		Preload("Cadena").
		Where("id = ?", id).
		First(&trabajo).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &trabajo, nil
}

// FinalizarTrabajo actualiza el estado, fecha fin, items extraídos y posibles errores
func (r *gormScraperRepository) FinalizarTrabajo(ctx context.Context, id uuid.UUID, estado string, elementosExtraidos *int, registroErrores *string) (*infrastructure.TrabajoScraper, error) {
	var trabajo infrastructure.TrabajoScraper
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&trabajo).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	ahora := time.Now()
	updates := map[string]interface{}{
		"estado":        estado,
		"finalizado_el": ahora,
	}
	if elementosExtraidos != nil {
		updates["elementos_extraidos"] = *elementosExtraidos
	}
	if registroErrores != nil && *registroErrores != "" {
		updates["registro_errores"] = *registroErrores
	}

	if err := r.db.WithContext(ctx).Model(&trabajo).Updates(updates).Error; err != nil {
		return nil, err
	}

	return r.ObtenerTrabajoPorID(ctx, id)
}

// ObtenerCadena busca la cadena de supermercado por ID o por nombre (ej. "Jumbo", "Santa Isabel").
// Si se busca por nombre y no existe, la crea automáticamente para soportar nuevas fuentes de scraping.
func (r *gormScraperRepository) ObtenerCadena(ctx context.Context, cadenaID int, nombreCadena string) (*infrastructure.CadenaSupermercado, error) {
	var cadena infrastructure.CadenaSupermercado
	query := r.db.WithContext(ctx)
	nombreLimpio := strings.TrimSpace(nombreCadena)

	if cadenaID > 0 {
		query = query.Where("id = ?", cadenaID)
		if err := query.First(&cadena).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, nil
			}
			return nil, err
		}
		return &cadena, nil
	}

	if nombreLimpio == "" {
		return nil, errors.New("debe proporcionar cadena_id o nombre de supermercado")
	}

	err := query.Where("nombre ILIKE ?", nombreLimpio).First(&cadena).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			nueva := infrastructure.CadenaSupermercado{
				Nombre:     nombreLimpio,
				EstaActiva: true,
				CreadoEl:   time.Now(),
			}
			if createErr := r.db.WithContext(ctx).Create(&nueva).Error; createErr != nil {
				return nil, createErr
			}
			return &nueva, nil
		}
		return nil, err
	}
	return &cadena, nil
}

// ObtenerSucursal busca una sucursal específica por ID, código o retorna la primera sucursal activa de la cadena.
// Si la cadena no posee sucursales registradas, crea una sucursal por defecto para asegurar la integridad referencial.
func (r *gormScraperRepository) ObtenerSucursal(ctx context.Context, cadenaID int, sucursalID *int, codigoSucursal *string) (*infrastructure.SucursalSupermercado, error) {
	var sucursal infrastructure.SucursalSupermercado
	query := r.db.WithContext(ctx)

	if sucursalID != nil && *sucursalID > 0 {
		query = query.Where("id = ?", *sucursalID)
		if err := query.First(&sucursal).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, nil
			}
			return nil, err
		}
		return &sucursal, nil
	}

	if codigoSucursal != nil && strings.TrimSpace(*codigoSucursal) != "" {
		query = query.Where("codigo_sucursal = ?", strings.TrimSpace(*codigoSucursal))
		if err := query.First(&sucursal).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, nil
			}
			return nil, err
		}
		return &sucursal, nil
	}

	if cadenaID > 0 {
		err := query.Where("cadena_id = ? AND esta_activa = true", cadenaID).Order("id ASC").First(&sucursal).Error
		if err == nil {
			return &sucursal, nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		// Auto-crear sucursal por defecto para la cadena
		var cadena infrastructure.CadenaSupermercado
		nombreCadena := "Supermercado"
		if errCad := r.db.WithContext(ctx).Where("id = ?", cadenaID).First(&cadena).Error; errCad == nil {
			nombreCadena = cadena.Nombre
		}

		cod := fmt.Sprintf("%s-CENTRAL", strings.ToUpper(strings.ReplaceAll(nombreCadena, " ", "-")))
		comuna := "Temuco"
		ciudad := "Temuco"
		nuevaSucursal := infrastructure.SucursalSupermercado{
			CadenaID:       cadenaID,
			CodigoSucursal: &cod,
			Nombre:         fmt.Sprintf("%s Central", nombreCadena),
			Direccion:      "Casa Matriz / Online",
			Comuna:         &comuna,
			Ciudad:         &ciudad,
			Lat:            -38.7359,
			Lon:            -72.5904,
			EstaActiva:     true,
		}
		if createErr := r.db.WithContext(ctx).Create(&nuevaSucursal).Error; createErr != nil {
			return nil, createErr
		}
		return &nuevaSucursal, nil
	}

	return nil, errors.New("no se especificaron criterios válidos para identificar la sucursal")
}

// IngestarLote realiza el upsert de productos crudos y la inserción de capturas de precios
// dentro de una única transacción de base de datos atómica.
func (r *gormScraperRepository) IngestarLote(ctx context.Context, trabajoID *uuid.UUID, sucursalID int, productos []domain.ProductoScrapeadoDTO) (*domain.IngestaResultadoDTO, error) {
	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	ahora := time.Now()
	insertados := 0
	actualizados := 0
	preciosRegistrados := 0
	var erroresProcesamiento []string

	for i, p := range productos {
		sku := strings.TrimSpace(p.SKU)
		titulo := strings.TrimSpace(p.Producto)
		if sku == "" || titulo == "" {
			erroresProcesamiento = append(erroresProcesamiento, fmt.Sprintf("item %d: SKU o título vacío", i))
			continue
		}

		// URL de imagen: puede venir en url_imagen o en imagen
		var urlImagen *string
		if p.URLImagen != nil && strings.TrimSpace(*p.URLImagen) != "" {
			urlImagen = p.URLImagen
		} else if p.Imagen != nil && strings.TrimSpace(*p.Imagen) != "" {
			urlImagen = p.Imagen
		}

		enStock := true
		if p.EnStock != nil {
			enStock = *p.EnStock
		}

		var prodExistente infrastructure.ProductoCrudo
		err := tx.Where("sucursal_id = ? AND sku = ?", sucursalID, sku).First(&prodExistente).Error

		var productoCrudoID uuid.UUID

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// 1. Insertar nuevo producto crudo
				nuevo := infrastructure.ProductoCrudo{
					ID:                 uuid.New(),
					SucursalID:         sucursalID,
					SKU:                sku,
					EANGTIN:            p.EANGTIN,
					TituloCrudo:        titulo,
					MarcaCruda:         p.Marca,
					CategoriaCruda:     p.Categoria,
					FormatoCrudo:       p.FormatoCrudo,
					URLProducto:        p.URLProducto,
					URLImagen:          urlImagen,
					EnStock:            enStock,
					UltimaExtraccionEl: ahora,
				}
				if createErr := tx.Create(&nuevo).Error; createErr != nil {
					erroresProcesamiento = append(erroresProcesamiento, fmt.Sprintf("error creando SKU %s: %v", sku, createErr))
					continue
				}
				productoCrudoID = nuevo.ID
				insertados++
			} else {
				tx.Rollback()
				return nil, err
			}
		} else {
			// 2. Actualizar producto existente (Upsert)
			productoCrudoID = prodExistente.ID
			updates := map[string]interface{}{
				"titulo_crudo":         titulo,
				"en_stock":             enStock,
				"ultima_extraccion_el": ahora,
			}
			if p.EANGTIN != nil && *p.EANGTIN != "" {
				updates["ean_gtin"] = *p.EANGTIN
			}
			if p.Marca != nil && *p.Marca != "" {
				updates["marca_cruda"] = *p.Marca
			}
			if p.Categoria != nil && *p.Categoria != "" {
				updates["categoria_cruda"] = *p.Categoria
			}
			if p.FormatoCrudo != nil && *p.FormatoCrudo != "" {
				updates["formato_crudo"] = *p.FormatoCrudo
			}
			if p.URLProducto != nil && *p.URLProducto != "" {
				updates["url_producto"] = *p.URLProducto
			}
			if urlImagen != nil && *urlImagen != "" {
				updates["url_imagen"] = *urlImagen
			}

			if updateErr := tx.Model(&prodExistente).Updates(updates).Error; updateErr != nil {
				erroresProcesamiento = append(erroresProcesamiento, fmt.Sprintf("error actualizando SKU %s: %v", sku, updateErr))
				continue
			}
			actualizados++
		}

		// 3. Registrar captura histórica de precio
		precioOferta := p.PrecioOferta
		if precioOferta == nil && p.Precio != nil && *p.Precio < p.PrecioNormal {
			precioOferta = p.Precio
		}

		captura := infrastructure.CapturaPrecio{
			ProductoCrudoID:   productoCrudoID,
			PrecioNormal:      p.PrecioNormal,
			PrecioOferta:      precioOferta,
			PrecioTarjeta:     p.PrecioTarjeta,
			PrecioPorUnidad:   p.PrecioPorUnidad,
			MetricaUnidad:     p.MetricaUnidad,
			MecanicaPromocion: p.MecanicaPromocion,
			EstaDisponible:    enStock,
			CapturadoEl:       ahora,
		}
		if capturaErr := tx.Create(&captura).Error; capturaErr != nil {
			erroresProcesamiento = append(erroresProcesamiento, fmt.Sprintf("error registrando precio para SKU %s: %v", sku, capturaErr))
			continue
		}
		preciosRegistrados++
	}

	// 4. Si hay un trabajo_id asociado, incrementar el contador de elementos extraídos
	if trabajoID != nil {
		totalNuevosProcesados := insertados + actualizados
		if totalNuevosProcesados > 0 {
			if err := tx.Model(&infrastructure.TrabajoScraper{}).
				Where("id = ?", *trabajoID).
				Update("elementos_extraidos", gorm.Expr("elementos_extraidos + ?", totalNuevosProcesados)).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	var trabajoIDStr *string
	if trabajoID != nil {
		str := trabajoID.String()
		trabajoIDStr = &str
	}

	resultado := &domain.IngestaResultadoDTO{
		TrabajoID:          trabajoIDStr,
		SucursalID:         sucursalID,
		TotalRecibidos:     len(productos),
		Insertados:         insertados,
		Actualizados:       actualizados,
		PreciosRegistrados: preciosRegistrados,
		Errores:            erroresProcesamiento,
		Mensaje:            fmt.Sprintf("Lote procesado: %d insertados, %d actualizados, %d precios guardados", insertados, actualizados, preciosRegistrados),
	}

	return resultado, nil
}
