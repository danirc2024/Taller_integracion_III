import { useState, useEffect, useMemo } from 'react';
import { supermarkets } from '@/lib/constants';
import { getProducts } from '@/lib/products-api';
import type { UiProduct as Product } from '@/types';

function normalizeCategoryTerm(term: string) {
  const normalized = term.trim().toLowerCase()
  if (normalized.length > 4 && normalized.endsWith('es')) return normalized.slice(0, -2)
  if (normalized.length > 3 && normalized.endsWith('s')) return normalized.slice(0, -1)
  return normalized
}

function getCategoryTerms(category: string) {
  return category
    .split(/[\s,/;]+/)
    .filter((term) => term !== 'y' && term !== 'e')
    .map(normalizeCategoryTerm)
    .filter(Boolean)
}

function productMatchesCategoryTerm(product: Product, term: string) {
  return product.name.toLowerCase().includes(term)
}

export function useCatalog(query: string, category: string | null, activeMarket: string | null) {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const [visibleCount, setVisibleCount] = useState(12)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // Fetch from API
  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)
    const market = supermarkets.find((item) => item.id === activeMarket)?.name
    const search = query.trim()
    const params = new URLSearchParams({ limit: '100', en_stock: 'true' })
    if (search.length >= 3) params.set('q', search)
    if (category) params.set('categoria', category)
    if (market) params.set('supermercado', market)

    getProducts(`?${params.toString()}`)
      .then(({ products: result }) => {
        if (!controller.signal.aborted) setProducts(result)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('No se pudo cargar el catálogo desde la base de datos.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [query, category, activeMarket])

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(12)
  }, [query, category, activeMarket])

  // Filter local logic
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const baseProducts = products.filter((p) => {
      const isAvailable = p.inStock === true
      const matchesMarket = activeMarket === null || p.supermarketId === activeMarket
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      return isAvailable && matchesMarket && matchesQuery
    })

    if (!category) return baseProducts

    const categoryTerms = getCategoryTerms(category)
    return baseProducts.filter((product) =>
      categoryTerms.some((term) => productMatchesCategoryTerm(product, term)),
    )
  }, [products, query, category, activeMarket])

  const supermarketCount = useMemo(() => {
    const ids = new Set(filtered.map((p) => p.supermarketId))
    return ids.size
  }, [filtered])

  const displayedProducts = filtered.slice(0, visibleCount);

  const fetchMore = () => {
    if (visibleCount < filtered.length && !isFetchingMore) {
      setIsFetchingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => prev + 12);
        setIsFetchingMore(false);
      }, 1000);
    }
  }

  return {
    isLoading,
    error,
    filtered,
    displayedProducts,
    supermarketCount,
    isFetchingMore,
    fetchMore
  }
}
