import { useState } from 'react';
import { ShieldCheck, MapPin, Store, ThumbsUp, ThumbsDown, CheckCircle2, TrendingUp } from 'lucide-react';
import { SuccessCard } from '@/components/ui/SuccessCard';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import { products, supermarketById, mockUser } from '@/data/mock';
import { formatPrice } from '@/data/mock';
import { Footer } from '@/components/Footer';

export default function Crowdsourcing() {
  const { toast } = useToast();
 // Get some products from mock for missions
 const product1 = products[0]; // Pechuga de Pollo
 const product2 = products.find(p => p.name.includes('Harina')) || products[1];
 const store1 = supermarketById(product1.supermarketId);
 const store2 = supermarketById(product2.supermarketId);

 const [missions, setMissions] = useState([
 { id: 1, type: 'price', store: store1?.name || 'Lider', product: product1.name, expectedPrice: formatPrice(product1.price), status: 'pending' },
 { id: 2, type: 'stock', store: store2?.name || 'Jumbo', product: product2.name, expectedPrice: null, status: 'pending' },
 ]);

 const [points, setPoints] = useState(150);

 const handleAction = (id: number, action: 'confirm' | 'deny') => {
 setMissions(prev => prev.map(m => m.id === id ? { ...m, status: action } : m));
 setPoints(p => p + 50);
 if (action === 'confirm') {
 toast('¡Aporte validado con éxito!', 'success');
 } else {
 toast('Gracias por actualizar la información.', 'info');
 }
 };

 return (
 <div className="flex flex-col h-full bg-background font-sans text-foreground overflow-hidden relative">

 <header className="flex-none flex items-center justify-between px-4 py-4 bg-card border-b border-border shadow-sm z-10">
 <div>
 <h1 className="font-bold text-lg leading-tight">Misiones Colaborador</h1>
 <p className="text-xs text-muted-foreground font-medium">Ayuda a mantener la precisión</p>
 </div>
 <div className="bg-primary text-primary-foreground border-2 border-border shadow-[4px_4px_0px_var(--color-border)] px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold">
 <TrendingUp className="h-4 w-4"/> {points} pts
 </div>
 </header>

 <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
 <div className="max-w-2xl mx-auto space-y-6">

 <div className="bg-gradient-to-br from-secondary to-background rounded-2xl p-6 text-primary-foreground shadow-lg relative overflow-hidden">
 <div className="relative z-10">
 <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6"/> Rango: {mockUser.rol === 'admin' ? 'Administrador' : 'Explorador'}</h2>
 <p className="text-primary-foreground/90 text-sm mt-2 max-w-sm leading-relaxed">
 Valida 2 misiones más hoy para desbloquear el rango **Colaborador** y obtener consultas IA ilimitadas.
 </p>

 <div className="mt-5">
 <div className="flex justify-between text-xs font-bold mb-1.5 text-primary-foreground">
 <span>Progreso Semanal</span>
 <span>3 / 5</span>
 </div>
 <div className="h-2 bg-background rounded-full overflow-hidden border border-border">
 <div className="h-full bg-primary-foreground rounded-full w-[60%]"></div>
 </div>
 </div>
 </div>
 <div className="absolute -right-6 -bottom-6 opacity-10">
 <ShieldCheck className="h-40 w-40"/>
 </div>
 </div>

 <div className="space-y-4">
 <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Misiones Cercanas (A menos de 2km)</h3>

 {missions.map(mission => (
 <div key={mission.id} className={cn("bg-card rounded-2xl border p-5 shadow-sm transition-all", mission.status !== 'pending' ? 'border-border dark:border-border opacity-60' : 'border-border')}>

 {mission.status === 'pending' ? (
 <>
 <div className="flex justify-between items-start mb-4">
 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-foreground bg-primary border-2 border-border px-2.5 py-1 rounded-md">
 {mission.type === 'price' ? 'Validar Precio' : 'Reportar Stock'}
 </div>
 <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/> 1.2 km</span>
 </div>

 <h4 className="text-base md:text-lg font-bold mb-0.5 md:mb-1 text-foreground">{mission.product}</h4>
 <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 mb-4 md:mb-5"><Store className="h-3.5 w-3.5 md:h-4 md:w-4"/> {mission.store}</p>

 {mission.type === 'price' && (
 <div className="bg-background rounded-xl p-3 md:p-4 mb-4 md:mb-5 border border-border text-center">
 <p className="text-xs md:text-sm text-muted-foreground mb-1">¿El precio actual en góndola es</p>
 <p className="text-2xl md:text-3xl font-black text-foreground">{mission.expectedPrice}?</p>
 </div>
 )}

 <div className="grid grid-cols-2 gap-2 md:gap-3">
 <button
 onClick={() => handleAction(mission.id, 'deny')}
 className="flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 rounded-xl border-2 border-border text-foreground hover:bg-muted font-bold transition-colors text-xs md:text-base"
 >
 <ThumbsDown className="h-4 w-4 md:h-5 md:w-5"/> No, cambiar
 </button>
 <button
 onClick={() => handleAction(mission.id, 'confirm')}
 className="flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 rounded-xl border-2 border-border bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors shadow-[2px_2px_0px_var(--color-border)] md:shadow-[4px_4px_0px_var(--color-border)] text-xs md:text-base leading-tight px-1"
 >
 <ThumbsUp className="h-4 w-4 md:h-5 md:w-5 shrink-0"/> <span className="truncate">{mission.type === 'stock' ? 'Sí, hay stock' : 'Sí, es correcto'}</span>
 </button>
 </div>
 </>
 ) : (
 <SuccessCard 
 title="Misión Completada" 
 subtitle="+50 puntos añadidos" 
 className="py-6 border-none shadow-none bg-transparent"
 />
 )}
 </div>
 ))}

 </div>
 </div>
 <Footer />
 </main>
 </div>
 );
}
