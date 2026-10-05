import { useState, useEffect } from 'react';
import { supermarkets, products } from '@/data/mock';

export interface OptimizedStore {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  cost: number;
}

const CENTER_LAT = -38.7359;
const CENTER_LNG = -72.5904;

const MIN_AMOUNT = 5000;
const RENTABILITY_THRESHOLD = 500;

// Transformar base
const ALL_STORES: OptimizedStore[] = supermarkets.map(s => {
  const storeProducts = products.filter(p => p.supermarketId === s.id);
  const cost = storeProducts.reduce((acc, p) => acc + p.price, 0);
  return {
    id: s.id,
    name: s.name,
    lat: s.coords[0],
    lng: s.coords[1],
    color: s.color, // CSS puro, no Tailwind dinámico
    cost: cost || Math.floor(Math.random() * 10000) + 2000
  };
});

export function useRouteOptimization(initialStops = 3, initialMode: 'car' | 'bus' = 'car') {
  const [maxStops, setMaxStops] = useState(initialStops);
  const [transportMode, setTransportMode] = useState<'car' | 'bus'>(initialMode);
  
  const [activeStores, setActiveStores] = useState<OptimizedStore[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);
  
  const [productCost, setProductCost] = useState(0);
  const [logisticCost, setLogisticCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    setIsCalculating(true);
    const controller = new AbortController();

    const timer = setTimeout(() => {
      const currentStores = ALL_STORES.slice(0, maxStops);
      setActiveStores(currentStores);

      const pCost = currentStores.reduce((acc, store) => acc + store.cost, 0);
      setProductCost(pCost);

      const lCost = transportMode === 'car' ? currentStores.length * 250 : 800 + (currentStores.length * 50);
      setLogisticCost(lCost);
      setTotalCost(pCost + lCost);

      const maxSingleStoreCost = pCost * 1.25;
      setSavings(maxSingleStoreCost - (pCost + lCost));
      
      setIsCalculating(false);
    }, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [maxStops, transportMode]);

  return {
    maxStops,
    setMaxStops,
    transportMode,
    setTransportMode,
    activeStores,
    isCalculating,
    productCost,
    logisticCost,
    totalCost,
    savings,
    isValidAmount: productCost >= MIN_AMOUNT,
    isProfitable: savings >= RENTABILITY_THRESHOLD,
    minAmount: MIN_AMOUNT,
    rentabilityThreshold: RENTABILITY_THRESHOLD,
    centerLat: CENTER_LAT,
    centerLng: CENTER_LNG
  };
}
