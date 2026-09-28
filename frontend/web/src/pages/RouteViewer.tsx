import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, Navigation, TrendingDown, AlertTriangle, CheckCircle2, Car, Bus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { supermarkets, products } from '@/data/mock';

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
 const [isCalculating, setIsCalculating] = useState(true);

 // Business Rules States
 const [productCost, setProductCost] = useState(0);
 const [logisticCost, setLogisticCost] = useState(0);
 const [totalCost, setTotalCost] = useState(0);
 const [savings, setSavings] = useState(0);

 // Constants based on RN-08 & RN-20
 const MIN_AMOUNT = 5000;
 const RENTABILITY_THRESHOLD = 500;

 useEffect(() => {
 setIsCalculating(true);
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

 const timer = setTimeout(() => setIsCalculating(false), 800);
 return () => clearTimeout(timer);
 }, [maxStops, transportMode]);

 const isValidAmount = productCost >= MIN_AMOUNT;
 const isProfitable = savings >= RENTABILITY_THRESHOLD;

 // Path coordinates for polyline
 const polylinePositions: [number, number][] = activeStores.map(store => [store.lat, store.lng]);

 return (
 <div className="flex flex-col-reverse md:flex-row flex-1 h-full bg-background text-foreground overflow-hidden">

 {/* Left Panel: Logistics & Business Rules */}
 <div className="w-full md:w-[400px] lg:w-[450px] bg-card border-r border-border flex flex-col h-[40vh] md:h-full z-10 shadow-xl overflow-y-auto shrink-0">

 {/* Header Area */}
 <div className="bg-gradient-to-b from-secondary to-transparent dark:from-secondary px-4 pt-4 pb-3 border-b border-border sticky top-0 bg-card z-20 backdrop-blur-md">
 <div>
 <h1 className="text-lg font-bold mt-0 text-foreground">Ruta Optimizada</h1>
 <p className="text-xs text-muted-foreground mt-0.5">3 Supermercados • 12 Productos</p>
 </div>
 </div>

 <div className="p-3 sm:p-4 space-y-4 flex-1 pb-16 md:pb-4">

 {/* Transport Mode */}
 <section className="space-y-3">
 <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">Medio de Transporte</h3>
 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={() => setTransportMode('car')}
 className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all", transportMode === 'car' ?"border-border bg-primary text-primary-foreground border-2 border-border shadow-[4px_4px_0px_var(--color-border)] border-2 border-border shadow-[4px_4px_0px_var(--color-border)]":"border-border bg-background text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700")}
 >
 <Car className="h-6 w-6 mb-2"/>
 <span className="text-xs font-semibold">Particular</span>
 </button>
 <button
 onClick={() => setTransportMode('bus')}
 className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all", transportMode === 'bus' ?"border-border bg-primary text-primary-foreground border-2 border-border shadow-[4px_4px_0px_var(--color-border)] border-2 border-border shadow-[4px_4px_0px_var(--color-border)]":"border-border bg-background text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700")}
 >
 <Bus className="h-6 w-6 mb-2"/>
 <span className="text-xs font-semibold">Transporte Público</span>
 </button>
 </div>
 </section>

 {/* RN-07: Stops Limit */}
 <section className="space-y-3">
 <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Costos de Logística</h3>
 <div className="bg-background border border-border rounded-xl p-3 shadow-sm">
 <div className="flex justify-between mb-2">
 <span className="text-xs font-medium">Máximo de paradas:</span>
 <span className="text-xs font-bold text-foreground">{maxStops}</span>
 </div>
 <input
 type="range"
 min="1"max="3"step="1"
 value={maxStops}
 onChange={(e) => setMaxStops(parseInt(e.target.value))}
 className="w-full accent-black dark:accent-white"
 />
 </div>
 </section>

 {isCalculating ? (
 <div className="space-y-4 pt-2">
 <Skeleton className="h-[72px] w-full rounded-xl" />
 <div className="space-y-2">
 <Skeleton className="h-3 w-32 rounded mb-2" />
 <Skeleton className="h-[120px] w-full rounded-xl" />
 </div>
 <Skeleton className="h-11 w-full rounded-xl mt-4" />
 </div>
 ) : (
 <>
 {/* Alert RN-20: Minimum Amount */}
 {!isValidAmount && (
 <div className="bg-primary dark:bg-primary p-3 rounded-xl border border-border dark:border-border flex items-start gap-2">
 <AlertTriangle className="h-4 w-4 text-primary dark:text-primary mt-0.5 shrink-0"/>
 <div>
 <p className="text-sm font-bold text-primary dark:text-primary">Monto Mínimo (RN-20)</p>
 <p className="text-xs text-primary dark:text-primary mt-0.5">Tu compra de ${productCost.toLocaleString()} no supera el mínimo de ${MIN_AMOUNT.toLocaleString()} para justificar esta ruta.</p>
 </div>
 </div>
 )}

 {/* Alert RN-08: Rentability Threshold */}
 {isValidAmount && !isProfitable && (
 <div className="bg-primary dark:bg-primary p-3 rounded-xl border border-border dark:border-border flex items-start gap-2">
 <TrendingDown className="h-4 w-4 text-primary dark:text-primary mt-0.5 shrink-0"/>
 <div>
 <p className="text-sm font-bold text-primary dark:text-primary">Micro-ahorro Detectado (RN-08)</p>
 <p className="text-xs text-primary dark:text-primary mt-0.5">El ahorro proyectado (${savings.toLocaleString()}) no supera el umbral de rentabilidad (${RENTABILITY_THRESHOLD.toLocaleString()}) por el costo de desplazamiento. Sugerimos agrupar en menos tiendas.</p>
 </div>
 </div>
 )}

 {/* RN-00: Cost Function Breakdown */}
 <section className="space-y-2">
 <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Función de Costo Total</h3>
 <div className="bg-background border border-border rounded-xl p-3 shadow-sm">
 <div className="space-y-1.5 mb-2">
 <div className="flex justify-between items-center text-xs">
 <span className="text-muted-foreground">Precio Productos</span>
 <span className="font-medium text-foreground">${productCost.toLocaleString()}</span>
 </div>
 <div className="flex justify-between items-center text-xs">
 <span className="text-muted-foreground">Costo Desplazamiento</span>
 <span className="font-medium text-primary dark:text-primary">+ ${logisticCost.toLocaleString()}</span>
 </div>
 <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
 <span className="font-semibold text-foreground text-sm">Costo Objetivo Total</span>
 <span className="font-bold text-foreground text-base">${totalCost.toLocaleString()}</span>
 </div>
 </div>

 {isValidAmount && isProfitable && (
 <div className="bg-primary text-primary-foreground border-2 border-border shadow-[4px_4px_0px_var(--color-border)] mt-3 p-3 rounded-xl border-2 border-border shadow-[4px_4px_0px_var(--color-border)] flex items-start gap-2">
 <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0"/>
 <div>
 <p className="text-sm font-bold">Ruta Rentable</p>
 <p className="text-xs mt-0.5">El ahorro en productos (${savings.toLocaleString()}) supera el costo de traslado.</p>
 </div>
 </div>
 )}
 </div>
 </section>

 {/* Action Button */}
 <button
 disabled={!isValidAmount || !isProfitable}
 className="w-full mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-2.5 px-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.98]"
 >
 <Navigation className="h-5 w-5"/>
 Iniciar Ruta Turn-by-Turn
 </button>
 </>
 )}
 </div>
 </div>

 {/* Right Panel: Map Area */}
 <div className="flex-1 min-h-[45vh] md:h-full relative bg-muted z-0">
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
 <div className="text-xs text-foreground font-semibold mb-2">Parada {index + 1} • Gasto: ${store.cost.toLocaleString()}</div>
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
 <MapPin className="h-4 w-4 text-foreground"/>
 <span className="text-sm font-semibold text-foreground">Plataforma Logística Temuco</span>
 </div>
 </div>
 </div>
 );
}
