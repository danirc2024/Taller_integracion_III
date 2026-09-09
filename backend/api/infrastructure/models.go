package infrastructure

import (
	"time"

	"github.com/google/uuid"
)

// =======================================================
// ESQUEMA api: USUARIOS, IDENTIDAD, MISIONES, CATÁLOGO Y IA
// =======================================================

// Usuario representa la entidad de usuarios centralizados en api.usuarios
type Usuario struct {
	ID             uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	GoogleID       *string   `gorm:"type:varchar(255);unique" json:"google_id,omitempty"`
	Correo         string    `gorm:"type:varchar(255);unique;not null" json:"correo"`
	PasswordHash   *string   `gorm:"type:varchar(255)" json:"-"`
	NombreCompleto string    `gorm:"type:varchar(255);not null" json:"nombre_completo"`
	URLAvatar      *string   `gorm:"type:varchar(500)" json:"url_avatar,omitempty"`
	Rol            string    `gorm:"type:varchar(30);default:'registrado';not null" json:"rol"`
	CuotaTokensIA  int       `gorm:"default:1000;not null" json:"cuota_tokens_ia"`
	EstaActivo     bool      `gorm:"default:true;not null" json:"esta_activo"`
	CreadoEl       time.Time `gorm:"default:now();not null" json:"creado_el"`
	ActualizadoEl  time.Time `gorm:"default:now();not null" json:"actualizado_el"`
}

func (Usuario) TableName() string {
	return "api.usuarios"
}

// PreferencialDieteticaUsuario almacena las restricciones alimentarias en api.preferencias_dieteticas_usuario
type PreferencialDieteticaUsuario struct {
	ID                int       `gorm:"primaryKey;autoIncrement" json:"id"`
	UsuarioID         uuid.UUID `gorm:"type:uuid;not null;index" json:"usuario_id"`
	EtiquetaDietetica string    `gorm:"type:varchar(50);not null" json:"etiqueta_dietetica"`
	CreadoEl          time.Time `gorm:"default:now();not null" json:"creado_el"`

	Usuario *Usuario `gorm:"foreignKey:UsuarioID;constraint:OnDelete:CASCADE" json:"-"`
}

func (PreferencialDieteticaUsuario) TableName() string {
	return "api.preferencias_dieteticas_usuario"
}

// DireccionUsuario almacena las ubicaciones guardadas en api.direcciones_usuario
type DireccionUsuario struct {
	ID              uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UsuarioID       uuid.UUID `gorm:"type:uuid;not null;index" json:"usuario_id"`
	Etiqueta        *string   `gorm:"type:varchar(100)" json:"etiqueta,omitempty"`
	TextoDireccion  string    `gorm:"type:varchar(255);not null" json:"texto_direccion"`
	Lat             float64   `gorm:"type:decimal(10,8);not null" json:"lat"`
	Lon             float64   `gorm:"type:decimal(11,8);not null" json:"lon"`
	EsPrincipal     bool      `gorm:"default:false" json:"es_principal"`

	Usuario *Usuario `gorm:"foreignKey:UsuarioID;constraint:OnDelete:CASCADE" json:"-"`
}

func (DireccionUsuario) TableName() string {
	return "api.direcciones_usuario"
}

// PerfilTransporteUsuario define los parámetros de transporte en api.perfiles_transporte_usuario
type PerfilTransporteUsuario struct {
	ID                        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	UsuarioID                 uuid.UUID `gorm:"type:uuid;not null;index" json:"usuario_id"`
	ModoTransporte            string    `gorm:"type:varchar(50);not null" json:"modo_transporte"`
	TipoCombustible           *string   `gorm:"type:varchar(50)" json:"tipo_combustible,omitempty"`
	RendimientoCombustibleKmL *float64  `gorm:"type:decimal(5,2)" json:"rendimiento_combustible_km_l,omitempty"`
	TarifaTransportePublico   *float64  `gorm:"type:decimal(10,2)" json:"tarifa_transporte_publico,omitempty"`
	RadioMaximoKM             float64   `gorm:"type:decimal(5,2);default:10.0" json:"radio_maximo_km"`
	EsPrincipal               bool      `gorm:"default:true" json:"es_principal"`

	Usuario *Usuario `gorm:"foreignKey:UsuarioID;constraint:OnDelete:CASCADE" json:"-"`
}

func (PerfilTransporteUsuario) TableName() string {
	return "api.perfiles_transporte_usuario"
}

// TarjetaFidelidadUsuario almacena métodos de fidelización en api.tarjetas_fidelidad_usuario
type TarjetaFidelidadUsuario struct {
	ID          int       `gorm:"primaryKey;autoIncrement" json:"id"`
	UsuarioID   uuid.UUID `gorm:"type:uuid;not null;index" json:"usuario_id"`
	CadenaID    int       `gorm:"not null" json:"cadena_id"`
	TipoTarjeta string    `gorm:"type:varchar(100);not null" json:"tipo_tarjeta"`
	CreadoEl    time.Time `gorm:"default:now();not null" json:"creado_el"`

	Usuario *Usuario `gorm:"foreignKey:UsuarioID;constraint:OnDelete:CASCADE" json:"-"`
}

func (TarjetaFidelidadUsuario) TableName() string {
	return "api.tarjetas_fidelidad_usuario"
}

// MisionValidacion registra las aportaciones del rol colaborador en api.misiones_validacion
type MisionValidacion struct {
	ID                       uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UsuarioID                uuid.UUID  `gorm:"type:uuid;not null;index" json:"usuario_id"`
	SucursalID               int        `gorm:"not null" json:"sucursal_id"`
	ProductoID               *uuid.UUID `gorm:"type:uuid" json:"producto_id,omitempty"`
	PrecioReportado          *float64   `gorm:"type:decimal(12,2)" json:"precio_reportado,omitempty"`
	StockDisponible          bool       `gorm:"default:true" json:"stock_disponible"`
	GastoTransporteReportado *float64   `gorm:"type:decimal(12,2)" json:"gasto_transporte_reportado,omitempty"`
	URLEvidenciaFoto         *string    `gorm:"type:varchar(500)" json:"url_evidencia_foto,omitempty"`
	TokensOtorgados          int        `gorm:"default:500" json:"tokens_otorgados"`
	Estado                   string     `gorm:"type:varchar(30);default:'aprobado'" json:"estado"`
	CompletadaEl             time.Time  `gorm:"default:now();not null" json:"completada_el"`

	Usuario *Usuario `gorm:"foreignKey:UsuarioID;constraint:OnDelete:CASCADE" json:"-"`
}

func (MisionValidacion) TableName() string {
	return "api.misiones_validacion"
}

// Categoria mapea api.categorias
type Categoria struct {
	ID       int        `gorm:"primaryKey;autoIncrement" json:"id"`
	PadreID  *int       `gorm:"index" json:"padre_id,omitempty"`
	Nombre   string     `gorm:"type:varchar(100);not null" json:"nombre"`
	Slug     string     `gorm:"type:varchar(100);unique;not null" json:"slug"`
	Padre    *Categoria `gorm:"foreignKey:PadreID;constraint:OnDelete:SET NULL" json:"-"`
}

func (Categoria) TableName() string {
	return "api.categorias"
}

// Marca mapea api.marcas
type Marca struct {
	ID     int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Nombre string `gorm:"type:varchar(100);unique;not null" json:"nombre"`
}

func (Marca) TableName() string {
	return "api.marcas"
}

// ProductoNormalizado mapea api.productos_normalizados
type ProductoNormalizado struct {
	ID               uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CategoriaID      *int       `gorm:"index" json:"categoria_id,omitempty"`
	MarcaID          *int       `gorm:"index" json:"marca_id,omitempty"`
	CodigoBarrasEAN  *string    `gorm:"type:varchar(50);unique" json:"codigo_barras_ean,omitempty"`
	NombreEstandar   string     `gorm:"type:varchar(255);not null" json:"nombre_estandar"`
	ContenidoNeto    *float64   `gorm:"type:decimal(8,2)" json:"contenido_neto,omitempty"`
	UnidadMedida     *string    `gorm:"type:varchar(20)" json:"unidad_medida,omitempty"`
	EsSinGluten      bool       `gorm:"default:false" json:"es_sin_gluten"`
	EsVegano         bool       `gorm:"default:false" json:"es_vegano"`
	EsSinLactosa     bool       `gorm:"default:false" json:"es_sin_lactosa"`
	CreadoEl         time.Time  `gorm:"default:now();not null" json:"creado_el"`

	Categoria *Categoria `gorm:"foreignKey:CategoriaID;constraint:OnDelete:SET NULL" json:"-"`
	Marca     *Marca     `gorm:"foreignKey:MarcaID;constraint:OnDelete:SET NULL" json:"-"`
}

func (ProductoNormalizado) TableName() string {
	return "api.productos_normalizados"
}

// EquivalenciaProducto mapea api.equivalencias_productos
type EquivalenciaProducto struct {
	ID                 int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductoMasterID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"producto_master_id"`
	ProductoAliasID    uuid.UUID  `gorm:"type:uuid;not null;index" json:"producto_alias_id"`
	DefinidoPorAdminID *uuid.UUID `gorm:"type:uuid" json:"definido_por_admin_id,omitempty"`
	CreadoEl           time.Time  `gorm:"default:now();not null" json:"creado_el"`

	ProductoMaster *ProductoNormalizado `gorm:"foreignKey:ProductoMasterID;constraint:OnDelete:CASCADE" json:"-"`
	ProductoAlias  *ProductoNormalizado `gorm:"foreignKey:ProductoAliasID;constraint:OnDelete:CASCADE" json:"-"`
}

func (EquivalenciaProducto) TableName() string {
	return "api.equivalencias_productos"
}

// Receta mapea api.recetas
type Receta struct {
	ID               uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CreadoPorUsuario *uuid.UUID `gorm:"type:uuid" json:"creado_por_usuario,omitempty"`
	Titulo           string     `gorm:"type:varchar(200);not null" json:"titulo"`
	Descripcion      *string    `gorm:"type:text" json:"descripcion,omitempty"`
	Porciones        int        `gorm:"default:4" json:"porciones"`
	Instrucciones    *string    `gorm:"type:text" json:"instrucciones,omitempty"`
	EsComunidad      bool       `gorm:"default:false" json:"es_comunidad"`
	CreadoEl         time.Time  `gorm:"default:now();not null" json:"creado_el"`
}

func (Receta) TableName() string {
	return "api.recetas"
}

// IngredienteReceta mapea api.ingredientes_receta
type IngredienteReceta struct {
	ID                    int        `gorm:"primaryKey;autoIncrement" json:"id"`
	RecetaID              uuid.UUID  `gorm:"type:uuid;not null;index" json:"receta_id"`
	ProductoNormalizadoID *uuid.UUID `gorm:"type:uuid" json:"producto_normalizado_id,omitempty"`
	TextoIngredienteCrudo string     `gorm:"type:varchar(255);not null" json:"texto_ingrediente_crudo"`
	CantidadRequerida     *float64   `gorm:"type:decimal(8,2)" json:"cantidad_requerida,omitempty"`
	Unidad                *string    `gorm:"type:varchar(30)" json:"unidad,omitempty"`

	Receta              *Receta              `gorm:"foreignKey:RecetaID;constraint:OnDelete:CASCADE" json:"-"`
	ProductoNormalizado *ProductoNormalizado `gorm:"foreignKey:ProductoNormalizadoID;constraint:OnDelete:SET NULL" json:"-"`
}

func (IngredienteReceta) TableName() string {
	return "api.ingredientes_receta"
}

// MapeoProductoIA mapea api.mapeos_productos_ia
type MapeoProductoIA struct {
	ID                    int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductoCrudoID       uuid.UUID `gorm:"type:uuid;unique;not null" json:"producto_crudo_id"`
	ProductoNormalizadoID uuid.UUID `gorm:"type:uuid;not null;index" json:"producto_normalizado_id"`
	NivelConfianza        *float64  `gorm:"type:decimal(4,3)" json:"nivel_confianza,omitempty"`
	VersionModelo         *string   `gorm:"type:varchar(50)" json:"version_modelo,omitempty"`
	Estado                string    `gorm:"type:varchar(30);default:'mapeado'" json:"estado"`
	ProcesadoEl           time.Time `gorm:"default:now();not null" json:"procesado_el"`

	ProductoNormalizado *ProductoNormalizado `gorm:"foreignKey:ProductoNormalizadoID;constraint:OnDelete:CASCADE" json:"-"`
}

func (MapeoProductoIA) TableName() string {
	return "api.mapeos_productos_ia"
}

// =======================================================
// ESQUEMA scraper: CADENAS, SUCURSALES Y EXTRACCIÓN RAW
// =======================================================

// CadenaSupermercado mapea scraper.cadenas_supermercado
type CadenaSupermercado struct {
	ID                int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Nombre            string    `gorm:"type:varchar(100);unique;not null" json:"nombre"`
	URLSitioWeb       *string   `gorm:"type:varchar(255)" json:"url_sitio_web,omitempty"`
	URLLogo           *string   `gorm:"type:varchar(255)" json:"url_logo,omitempty"`
	ConfigScraperJSON *string   `gorm:"type:jsonb" json:"config_scraper_json,omitempty"`
	EstaActiva        bool      `gorm:"default:true" json:"esta_activa"`
	CreadoEl          time.Time `gorm:"default:now();not null" json:"creado_el"`
}

func (CadenaSupermercado) TableName() string {
	return "scraper.cadenas_supermercado"
}

// SucursalSupermercado mapea scraper.sucursales_supermercado
type SucursalSupermercado struct {
	ID             int       `gorm:"primaryKey;autoIncrement" json:"id"`
	CadenaID       int       `gorm:"not null;index" json:"cadena_id"`
	CodigoSucursal *string   `gorm:"type:varchar(50)" json:"codigo_sucursal,omitempty"`
	Nombre         string    `gorm:"type:varchar(150);not null" json:"nombre"`
	Direccion      string    `gorm:"type:varchar(255);not null" json:"direccion"`
	Comuna         *string   `gorm:"type:varchar(100)" json:"comuna,omitempty"`
	Ciudad         *string   `gorm:"type:varchar(100)" json:"ciudad,omitempty"`
	Lat            float64   `gorm:"type:decimal(10,8);not null" json:"lat"`
	Lon            float64   `gorm:"type:decimal(11,8);not null" json:"lon"`
	HoraApertura   *string   `gorm:"type:time" json:"hora_apertura,omitempty"`
	HoraCierre     *string   `gorm:"type:time" json:"hora_cierre,omitempty"`
	EstaActiva     bool      `gorm:"default:true" json:"esta_activa"`

	Cadena *CadenaSupermercado `gorm:"foreignKey:CadenaID;constraint:OnDelete:CASCADE" json:"-"`
}

func (SucursalSupermercado) TableName() string {
	return "scraper.sucursales_supermercado"
}

// TrabajoScraper mapea scraper.trabajos_scraper
type TrabajoScraper struct {
	ID                    uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CadenaID              int        `gorm:"not null;index" json:"cadena_id"`
	DisparadoPorUsuarioID *uuid.UUID `gorm:"type:uuid" json:"disparado_por_usuario_id,omitempty"`
	Estado                string     `gorm:"type:varchar(30);default:'pendiente';not null" json:"estado"`
	IniciadoEl            time.Time  `gorm:"default:now();not null" json:"iniciado_el"`
	FinalizadoEl          *time.Time `json:"finalizado_el,omitempty"`
	ElementosExtraidos    int        `gorm:"default:0" json:"elementos_extraidos"`
	RegistroErrores       *string    `gorm:"type:text" json:"registro_errores,omitempty"`

	Cadena *CadenaSupermercado `gorm:"foreignKey:CadenaID;constraint:OnDelete:CASCADE" json:"-"`
}

func (TrabajoScraper) TableName() string {
	return "scraper.trabajos_scraper"
}

// ProductoCrudo mapea scraper.productos_crudos
type ProductoCrudo struct {
	ID                 uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SucursalID         int       `gorm:"not null;index" json:"sucursal_id"`
	SKU                string    `gorm:"type:varchar(100);not null" json:"sku"`
	TituloCrudo        string    `gorm:"type:varchar(255);not null" json:"titulo_crudo"`
	MarcaCruda         *string   `gorm:"type:varchar(100)" json:"marca_cruda,omitempty"`
	CategoriaCruda     *string   `gorm:"type:varchar(100)" json:"categoria_cruda,omitempty"`
	URLProducto        *string   `gorm:"type:text" json:"url_producto,omitempty"`
	URLImagen          *string   `gorm:"type:text" json:"url_imagen,omitempty"`
	EnStock            bool      `gorm:"default:true" json:"en_stock"`
	UltimaExtraccionEl time.Time `gorm:"default:now();not null" json:"ultima_extraccion_el"`

	Sucursal *SucursalSupermercado `gorm:"foreignKey:SucursalID;constraint:OnDelete:CASCADE" json:"-"`
}

func (ProductoCrudo) TableName() string {
	return "scraper.productos_crudos"
}

// CapturaPrecio mapea scraper.capturas_precios
type CapturaPrecio struct {
	ID              int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductoCrudoID uuid.UUID `gorm:"type:uuid;not null;index" json:"producto_crudo_id"`
	PrecioNormal    float64   `gorm:"type:decimal(12,2);not null" json:"precio_normal"`
	PrecioOferta    *float64  `gorm:"type:decimal(12,2)" json:"precio_oferta,omitempty"`
	PrecioTarjeta   *float64  `gorm:"type:decimal(12,2)" json:"precio_tarjeta,omitempty"`
	PrecioPorUnidad *float64  `gorm:"type:decimal(12,2)" json:"precio_por_unidad,omitempty"`
	MetricaUnidad   *string   `gorm:"type:varchar(20)" json:"metrica_unidad,omitempty"`
	EstaDisponible  bool      `gorm:"default:true" json:"esta_disponible"`
	CapturadoEl     time.Time `gorm:"default:now();not null" json:"capturado_el"`

	ProductoCrudo *ProductoCrudo `gorm:"foreignKey:ProductoCrudoID;constraint:OnDelete:CASCADE" json:"-"`
}

func (CapturaPrecio) TableName() string {
	return "scraper.capturas_precios"
}

// =======================================================
// ESQUEMA rutas: LISTAS DE COMPRA Y OPTIMIZACIÓN ESPACIAL
// =======================================================

// ListaCompra mapea rutas.listas_compras
type ListaCompra struct {
	ID            uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UsuarioID     uuid.UUID `gorm:"type:uuid;not null;index" json:"usuario_id"`
	Nombre        string    `gorm:"type:varchar(150);not null" json:"nombre"`
	Estado        string    `gorm:"type:varchar(30);default:'activa'" json:"estado"`
	CreadaEl      time.Time `gorm:"default:now();not null" json:"creada_el"`
	ActualizadaEl time.Time `gorm:"default:now();not null" json:"actualizada_el"`

	Usuario *Usuario `gorm:"foreignKey:UsuarioID;constraint:OnDelete:CASCADE" json:"-"`
}

func (ListaCompra) TableName() string {
	return "rutas.listas_compras"
}

// ArticuloListaCompra mapea rutas.articulos_lista_compras
type ArticuloListaCompra struct {
	ID                    int       `gorm:"primaryKey;autoIncrement" json:"id"`
	ListaID               uuid.UUID `gorm:"type:uuid;not null;index" json:"lista_id"`
	ProductoNormalizadoID uuid.UUID `gorm:"type:uuid;not null;index" json:"producto_normalizado_id"`
	Cantidad              int       `gorm:"default:1;not null" json:"cantidad"`
	EstaComprado          bool      `gorm:"default:false" json:"esta_comprado"`

	Lista               *ListaCompra         `gorm:"foreignKey:ListaID;constraint:OnDelete:CASCADE" json:"-"`
	ProductoNormalizado *ProductoNormalizado `gorm:"foreignKey:ProductoNormalizadoID;constraint:OnDelete:CASCADE" json:"-"`
}

func (ArticuloListaCompra) TableName() string {
	return "rutas.articulos_lista_compras"
}

// EjecucionOptimizacion mapea rutas.ejecuciones_optimizacion
type EjecucionOptimizacion struct {
	ID                    uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ListaID               uuid.UUID `gorm:"type:uuid;not null;index" json:"lista_id"`
	TransporteUsuarioID   *int      `gorm:"index" json:"transporte_usuario_id,omitempty"`
	LatInicio             float64   `gorm:"type:decimal(10,8);not null" json:"lat_inicio"`
	LonInicio             float64   `gorm:"type:decimal(11,8);not null" json:"lon_inicio"`
	CostoTotalProductos   float64   `gorm:"type:decimal(12,2);not null" json:"costo_total_productos"`
	CostoEstimadoViaje    float64   `gorm:"type:decimal(12,2);not null" json:"costo_estimado_viaje"`
	AhorroNetoEstimado    float64   `gorm:"type:decimal(12,2);not null" json:"ahorro_neto_estimado"`
	DistanciaTotalMetros  *int      `json:"distancia_total_metros,omitempty"`
	DuracionTotalSegundos *int      `json:"duracion_total_segundos,omitempty"`
	CalculadoEl           time.Time `gorm:"default:now();not null" json:"calculado_el"`

	Lista *ListaCompra `gorm:"foreignKey:ListaID;constraint:OnDelete:CASCADE" json:"-"`
}

func (EjecucionOptimizacion) TableName() string {
	return "rutas.ejecuciones_optimizacion"
}

// ParadaOptimizacion mapea rutas.paradas_optimizacion
type ParadaOptimizacion struct {
	ID             int       `gorm:"primaryKey;autoIncrement" json:"id"`
	OptimizacionID uuid.UUID `gorm:"type:uuid;not null;index" json:"optimizacion_id"`
	SucursalID     int       `gorm:"not null;index" json:"sucursal_id"`
	OrdenVisita    int       `gorm:"not null" json:"orden_visita"`
	CostoSubtotal  float64   `gorm:"type:decimal(12,2);not null" json:"costo_subtotal"`

	Optimizacion *EjecucionOptimizacion `gorm:"foreignKey:OptimizacionID;constraint:OnDelete:CASCADE" json:"-"`
	Sucursal     *SucursalSupermercado  `gorm:"foreignKey:SucursalID;constraint:OnDelete:CASCADE" json:"-"`
}

func (ParadaOptimizacion) TableName() string {
	return "rutas.paradas_optimizacion"
}

// DetalleArticuloParada mapea rutas.detalle_articulos_parada
type DetalleArticuloParada struct {
	ID                     int       `gorm:"primaryKey;autoIncrement" json:"id"`
	ParadaID               int       `gorm:"not null;index" json:"parada_id"`
	ProductoCrudoID        uuid.UUID `gorm:"type:uuid;not null;index" json:"producto_crudo_id"`
	CapturaPrecioID        int64     `gorm:"not null;index" json:"captura_precio_id"`
	Cantidad               int       `gorm:"default:1;not null" json:"cantidad"`
	PrecioUnitarioAplicado float64   `gorm:"type:decimal(12,2);not null" json:"precio_unitario_aplicado"`

	Parada        *ParadaOptimizacion `gorm:"foreignKey:ParadaID;constraint:OnDelete:CASCADE" json:"-"`
	ProductoCrudo *ProductoCrudo      `gorm:"foreignKey:ProductoCrudoID;constraint:OnDelete:CASCADE" json:"-"`
	CapturaPrecio *CapturaPrecio      `gorm:"foreignKey:CapturaPrecioID;constraint:OnDelete:CASCADE" json:"-"`
}

func (DetalleArticuloParada) TableName() string {
	return "rutas.detalle_articulos_parada"
}
