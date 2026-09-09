export type Usuario = {
  id: string;
  nombreCompleto: string;
  urlAvatar: string | null;
  rol: 'user' | 'colaborador' | 'admin';
  cuotaTokensIa: number;
  colaboradorHasta: string | null;
  estaActivo: boolean;
  creadoEl: string;
};

export type PreferenciasDieteticas = {
  usuarioId: string;
  etiquetas: string[]; // e.g., 'vegan', 'celiac', 'keto', 'none'
};

export type CadenaSupermercado = {
  id: number;
  nombre: string;
  urlSitioWeb: string | null;
  urlLogo: string;
  configScraperJson: any;
  estaActiva: boolean;
};

export type SucursalSupermercado = {
  id: number;
  cadenaId: number;
  codigoSucursal: string;
  nombre: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  lat: number;
  lon: number;
  horaApertura: string | null;
  horaCierre: string | null;
  estaActiva: boolean;
};

export type Categoria = {
  id: number;
  padreId: number | null;
  nombre: string;
  slug: string;
};

export type Marca = {
  id: number;
  nombre: string;
};

export type ProductoNormalizado = {
  id: string;
  categoriaId: number | null;
  marcaId: number | null;
  codigoBarrasEan: string | null;
  nombreEstandar: string;
  contenidoNeto: number | null;
  unidadMedida: string | null;
  esSinGluten: boolean;
  esVegano: boolean;
  esSinLactosa: boolean;
};

export type ProductoCrudo = {
  id: string;
  sucursalId: number;
  sku: string;
  tituloCrudo: string;
  marcaCruda: string | null;
  categoriaCruda: string | null;
  urlProducto: string | null;
  urlImagen: string | null;
  enStock: boolean;
  ultimaExtraccionEl: string;
};

export type CapturaPrecio = {
  id: number;
  productoCrudoId: string;
  precioNormal: number | null;
  precioOferta: number | null;
  precioTarjeta: number | null;
  precioPorUnidad: number | null;
  metricaUnidad: string | null;
  estaDisponible: boolean;
  capturadoEl: string;
};

// UI Specific Types (Derived from DB models for easier frontend consumption)

export type UiSupermarket = {
  id: string; // derived or mapped
  dbId: number;
  name: string;
  logo: string;
  color: string;
  coords: [number, number];
};

export type UiProduct = {
  id: string;
  name: string;
  brand: string;
  image: string;
  unit: string;
  price: number;
  originalPrice: number;
  supermarketId: string; // reference to UiSupermarket
};
