export type Supermarket = {
  id: string
  name: string
  logo: string
  color: string
  // Approx. coordinates (Temuco center as demo) for the route map
  coords: [number, number]
}

export type Product = {
  id: string
  name: string
  brand: string
  image: string
  unit: string
  price: number
  originalPrice: number
  supermarketId: string
}

export const HOME: { coords: [number, number]; label: string } = {
  coords: [-38.73965, -72.59842],
  label: 'Tu ubicación',
}

export const supermarkets: Supermarket[] = [
  {
    id: 'jumbo',
    name: 'Jumbo',
    logo: '/logos/verdemart.png',
    color: 'oklch(0.56 0.2 25)', // Red/Green vibe
    coords: [-38.7410, -72.6000],
  },
  {
    id: 'lider',
    name: 'Lider',
    logo: '/logos/superahorro.png',
    color: 'oklch(0.45 0.2 250)', // Blue
    coords: [-38.7350, -72.5900],
  },
  {
    id: 'unimarc',
    name: 'Unimarc',
    logo: '/logos/mercadia.png',
    color: 'oklch(0.6 0.2 30)', // Reddish orange
    coords: [-38.7450, -72.6100],
  },
  {
    id: 'superofertas',
    name: 'Superofertas',
    logo: '/logos/colmadoplus.png',
    color: 'oklch(0.8 0.15 90)', // Yellow
    coords: [-38.7300, -72.6050],
  },
]

export const supermarketById = (id: string) =>
  supermarkets.find((s) => s.id === id)!

export const products: Product[] = [
  {
    id: 'leche',
    name: 'Leche entera',
    brand: 'Central Lechera',
    image: '/products/leche.png',
    unit: '1 L',
    price: 890,
    originalPrice: 1150,
    supermarketId: 'jumbo',
  },
  {
    id: 'huevos',
    name: 'Huevos camperos',
    brand: 'Granja del Sol',
    image: '/products/huevos.png',
    unit: 'Docena',
    price: 2190,
    originalPrice: 2990,
    supermarketId: 'lider',
  },
  {
    id: 'pan',
    name: 'Pan de molde',
    brand: 'Panadería Real',
    image: '/products/pan.png',
    unit: '460 g',
    price: 1290,
    originalPrice: 1750,
    supermarketId: 'unimarc',
  },
  {
    id: 'cafe',
    name: 'Café molido natural',
    brand: 'Aromas',
    image: '/products/cafe.png',
    unit: '250 g',
    price: 2850,
    originalPrice: 4100,
    supermarketId: 'superofertas',
  },
  {
    id: 'pasta',
    name: 'Espaguetis',
    brand: 'Trigo de Oro',
    image: '/products/pasta.png',
    unit: '500 g',
    price: 750,
    originalPrice: 1050,
    supermarketId: 'jumbo',
  },
  {
    id: 'aceite',
    name: 'Aceite de oliva virgen extra',
    brand: 'Olivar',
    image: '/products/aceite.png',
    unit: '1 L',
    price: 6490,
    originalPrice: 8200,
    supermarketId: 'lider',
  },
  {
    id: 'leche-2',
    name: 'Leche semidesnatada',
    brand: 'Prado Verde',
    image: '/products/leche.png',
    unit: '1 L',
    price: 820,
    originalPrice: 990,
    supermarketId: 'unimarc',
  },
  {
    id: 'cafe-2',
    name: 'Café en grano',
    brand: 'Tostadero',
    image: '/products/cafe.png',
    unit: '1 kg',
    price: 9900,
    originalPrice: 13500,
    supermarketId: 'superofertas',
  },
]

export const discountPct = (p: Product) =>
  Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value)
