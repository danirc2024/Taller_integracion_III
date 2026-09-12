import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, AlertCircle, RefreshCw, ChevronRight, CheckSquare, Square, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function History() {
  const [lists, setLists] = useState([
    {
      id: 1,
      name: 'Almuerzo Saludable 4 pers.',
      date: 'Hoy, 12:45',
      items: 6,
      total: '$15.490',
      status: 'fresh', // fresh, expired, out-of-stock
      expiresIn: '2 horas'
    },
    {
      id: 2,
      name: 'Asado Fin de Semana',
      date: 'Ayer, 18:20',
      items: 12,
      total: '$42.990',
      status: 'expired',
      expiresIn: 'Expiró'
    },
    {
      id: 3,
      name: 'Cena Vegana Rápida',
      date: 'Lun, 09:15',
      items: 4,
      total: '$8.200',
      status: 'out-of-stock',
      expiresIn: '4 horas',
      missingItem: 'Tofu Extra Firme'
    }
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background font-sans text-foreground overflow-hidden relative">
      
      <header className="flex-none flex items-center justify-between px-4 py-4 bg-card border-b border-border shadow-sm z-10">
        <h1 className="font-bold text-lg">Historial de Listas</h1>
        <button className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10">
          <Trash2 className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          
          <p className="text-sm text-muted-foreground font-medium px-1 mb-2">Las listas generadas conservan precios válidos según el reloj de frescura (RN-01).</p>
          
          {lists.map(list => (
            <div key={list.id} className={cn(
              "bg-card rounded-2xl border p-5 shadow-sm transition-all group",
              list.status === 'expired' ? "border-border opacity-70 grayscale-[30%]" : 
              list.status === 'out-of-stock' ? "border-amber-200 dark:border-amber-900/50" : 
              "border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400"
            )}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground leading-tight">{list.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Calendar className="h-3.5 w-3.5" /> {list.date} • {list.items} ítems
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-lg text-foreground">{list.total}</span>
                </div>
              </div>

              {/* Status Indicator (RN-01 / RN-02) */}
              <div className="mb-4">
                {list.status === 'fresh' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle className="h-3.5 w-3.5" /> Precios Vigentes por {list.expiresIn}
                  </div>
                )}
                {list.status === 'expired' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-bold border border-border">
                    <Clock className="h-3.5 w-3.5" /> Precios Expirados
                  </div>
                )}
                {list.status === 'out-of-stock' && (
                  <div className="inline-flex flex-col gap-1 w-full">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-800 w-fit">
                      <AlertCircle className="h-3.5 w-3.5" /> Quiebre de Stock Detectado
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 pl-1">
                      El producto <span className="font-semibold line-through">"{list.missingItem}"</span> ya no está disponible.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 flex gap-2">
                {list.status === 'fresh' ? (
                  <Link to="/route" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors text-sm">
                    Ver Ruta
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity text-sm shadow-sm">
                    <RefreshCw className="h-4 w-4" />
                    Recalcular con IA
                  </button>
                )}
                <button className="px-4 py-2.5 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-accent transition-colors">
                  Detalles
                </button>
              </div>
            </div>
          ))}

        </div>
      </main>
    </div>
  );
}
