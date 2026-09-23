import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, Navigation, TrendingDown, AlertTriangle, CheckCircle2, Car, Bus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Fix Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Temuco Coordinates
const CENTER_LAT = -38.7359;
const CENTER_LNG = -72.5904;

import { supermarkets, products } from '@/data/mock';

const STORES = supermarkets.map(s => {
  const storeProducts = products.filter(p => p.supermarketId === s.id);
  const cost = storeProducts.reduce((acc, p) => acc + p.price, 0);
  return {
    id: s.id,
    name: s.name,
    lat: s.coords[0],
    lng: s.coords[1],
    color: `text-[${s.color}]`,
    bg: `bg-[${s.color}]/10`,
    cost: cost || Math.floor(Math.random() * 10000) + 2000 // default fallback
  }
});

export default function RouteViewer() {
  const [maxStops, setMaxStops] = useState(3);
  const [transportMode, setTransportMode] = useState<'car' | 'bus'>('car');
  const [activeStores, setActiveStores] = useState(STORES);

  // Business Rules States
  const [productCost, setProductCost] = useState(0);
  const [logisticCost, setLogisticCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [savings, setSavings] = useState(0);

  // Constants based on RN-08 & RN-20
  const MIN_AMOUNT = 5000;
  const RENTABILITY_THRESHOLD = 500;

  useEffect(() => {
    // Simulate Logic based on RN-00 (Objective Cost Function)
    const currentStores = STORES.slice(0, maxStops);
    setActiveStores(currentStores);

    const pCost = currentStores.reduce((acc, store) => acc + store.cost, 0);
    setProductCost(pCost);

    // Simulate Logistic Cost: Distances * Rate
    // For car: ~ $200 per stop. For bus: $800 fixed + $0 per stop (simplified)
    const lCost = transportMode === 'car' ? currentStores.length * 250 : 800 + (currentStores.length * 50);
    setLogisticCost(lCost);

    setTotalCost(pCost + lCost);

    // Simulate savings vs going to a single most expensive store
    const maxSingleStoreCost = pCost * 1.25; // Dummy logic for single store cost
    const calculatedSavings = maxSingleStoreCost - (pCost + lCost);
    setSavings(calculatedSavings);

  }, [maxStops, transportMode]);

  const isValidAmount = productCost >= MIN_AMOUNT;
  const isProfitable = savings >= RENTABILITY_THRESHOLD;

  // Path coordinates for polyline
  const polylinePositions: [number, number][] = activeStores.map(store => [store.lat, store.lng]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground">

      {/* Left Panel: Logistics & Business Rules */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-card border-r border-border flex flex-col h-full z-10 shadow-xl overflow-y-auto shrink-0">

        {/* Header Area */}
        <div className="bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-card z-20 backdrop-blur-md">
          <Link to="/chat" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold mt-1 text-foreground">Ruta Optimizada</h1>
            <p className="text-sm text-muted-foreground mt-0.5">3 Supermercados • 12 Productos</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 flex-1">

          {/* Transport Mode */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Medio de Transporte</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTransportMode('car')}
                className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all", transportMode === 'car' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-border bg-background text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700")}
              >
                <Car className="h-6 w-6 mb-2" />
                <span className="text-sm font-semibold">Particular</span>
              </button>
              <button
                onClick={() => setTransportMode('bus')}
                className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all", transportMode === 'bus' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-border bg-background text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700")}
              >
                <Bus className="h-6 w-6 mb-2" />
                <span className="text-sm font-semibold">Transporte Público</span>
              </button>
            </div>
          </section>

          {/* RN-07: Stops Limit */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Costos de Logística</h3>
            <div className="bg-background border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Máximo de paradas:</span>
                <span className="text-sm font-bold text-emerald-600">{maxStops}</span>
              </div>
              <input
                type="range"
                min="1" max="3" step="1"
                value={maxStops}
                onChange={(e) => setMaxStops(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </section>

          {/* Alert RN-20: Minimum Amount */}
          {!isValidAmount && (
            <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-800 dark:text-rose-300">Monto Mínimo (RN-20)</p>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">Tu compra de ${productCost.toLocaleString()} no supera el mínimo de ${MIN_AMOUNT.toLocaleString()} para justificar esta ruta.</p>
              </div>
            </div>
          )}

          {/* Alert RN-08: Rentability Threshold */}
          {isValidAmount && !isProfitable && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Micro-ahorro Detectado (RN-08)</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">El ahorro proyectado (${savings.toLocaleString()}) no supera el umbral de rentabilidad (${RENTABILITY_THRESHOLD.toLocaleString()}) por el costo de desplazamiento. Sugerimos agrupar en menos tiendas.</p>
              </div>
            </div>
          )}

          {/* RN-00: Cost Function Breakdown */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Función de Costo Total</h3>
            <div className="bg-background border border-border rounded-2xl p-4 shadow-sm">
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Precio Productos</span>
                  <span className="font-medium text-foreground">${productCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Costo Desplazamiento</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">+ ${logisticCost.toLocaleString()}</span>
                </div>
                <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Costo Objetivo Total</span>
                  <span className="font-bold text-foreground text-lg">${totalCost.toLocaleString()}</span>
                </div>
              </div>

              {isValidAmount && isProfitable && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 mt-3 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Ruta Rentable</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">El ahorro en productos (${savings.toLocaleString()}) supera el costo de traslado.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Button */}
          <button
            disabled={!isValidAmount || !isProfitable}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
          >
            <Navigation className="h-5 w-5" />
            Iniciar Ruta Turn-by-Turn
          </button>
        </div>
      </div>

      {/* Right Panel: Map Area */}
      <div className="flex-1 h-[50vh] md:h-full relative bg-muted z-0">
        <MapContainer
          center={[CENTER_LAT, CENTER_LNG]}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Custom Zoom Control position if needed */}

          {activeStores.map((store, index) => (
            <Marker key={store.id} position={[store.lat, store.lng]}>
              <Popup className="rounded-xl font-sans">
                <div className="text-center pb-1">
                  <div className="font-bold text-sm mb-1">{store.name}</div>
                  <div className="text-xs text-emerald-600 font-semibold mb-2">Parada {index + 1} • Gasto: ${store.cost.toLocaleString()}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {activeStores.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="#10b981"
              weight={4}
              dashArray="8, 8"
              opacity={0.8}
            />
          )}
        </MapContainer>

        {/* Map Overlay info */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur shadow-lg border border-border px-4 py-2 rounded-full flex items-center gap-3 z-[1000] pointer-events-none">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-foreground">Plataforma Logística Temuco</span>
        </div>
      </div>
    </div>
  );
}
