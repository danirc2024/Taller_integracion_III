import { supermarkets } from './constants'
import type { UiProduct as Product } from '@/types'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

type ApiProduct = {
  id: string
  nombre: string
  marca: string
  categoria: string
  supermercado: string
  precio: number
  precio_normal: number
  precio_oferta?: number
  en_oferta: boolean
  url_imagen: string
  unidad: string
  en_stock: boolean
}

export type ApiPriceHistory = {
  precio_normal: number
  precio_oferta?: number
  capturado_el: string
}

export type ApiProductDetail = ApiProduct & {
  historial: ApiPriceHistory[]
}

type ProductPage = {
  data: ApiProduct[]
  total_registros: number
}

function supermarketId(name: string) {
  return supermarkets.find((market) => market.name.toLowerCase() === name.toLowerCase())?.id || name.toLowerCase()
}

export function toUiProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.nombre,
    brand: product.marca || 'Sin marca',
    category: product.categoria || undefined,
    image: product.url_imagen,
    unit: product.unidad || 'Unidad',
    price: product.precio,
    originalPrice: product.precio_normal || product.precio,
    supermarketId: supermarketId(product.supermercado),
    supermarketName: product.supermercado,
    inStock: product.en_stock,
  }
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)
  if (!response.ok) throw new Error(`La API respondió con ${response.status}`)
  return response.json() as Promise<T>
}

export async function getProducts(params = '') {
  const page = await request<ProductPage>(`/productos${params}`)
  return { products: page.data.map(toUiProduct), total: page.total_registros }
}

export async function getProductDetail(id: string) {
  const product = await request<ApiProductDetail>(`/productos/${encodeURIComponent(id)}`)
  return { product: toUiProduct(product), history: product.historial }
}