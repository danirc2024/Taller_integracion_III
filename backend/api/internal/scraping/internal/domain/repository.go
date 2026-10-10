package domain

import (
	"context"

	"github.com/google/uuid"
)

// TrabajoRepository es la persistencia propia de coordinación de scraping.
type TrabajoRepository interface {
	CrearTrabajo(ctx context.Context, trabajo *TrabajoScraper) error
	ObtenerTrabajoPorID(ctx context.Context, id uuid.UUID) (*TrabajoScraper, error)
	FinalizarTrabajo(ctx context.Context, id uuid.UUID, estado string, elementosExtraidos *int, registroErrores *string) (*TrabajoScraper, error)
}

// IngestaRepository aísla el acceso transitorio a catálogo. Su adaptador SQL
// se reemplazará al transferir la persistencia de ingesta en SUP-269.
type IngestaRepository interface {
	ObtenerCadena(ctx context.Context, cadenaID int, nombreCadena string) (*CadenaSupermercado, error)
	ObtenerSucursal(ctx context.Context, cadenaID int, sucursalID *int, codigoSucursal *string) (*SucursalSupermercado, error)
	IngestarLote(ctx context.Context, trabajoID *uuid.UUID, sucursalID int, productos []ProductoScrapeadoDTO) (*IngestaResultadoDTO, error)
}
