import React, { useState } from 'react';
import { User, ShieldAlert, CreditCard, Car, Bus, Apple, Leaf, Utensils, TrendingUp, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockUser } from '@/data/mock';

export default function Profile() {
  const [budget, setBudget] = useState(50000);
  const [transportMode, setTransportMode] = useState<'car' | 'bus'>('car');
  const [diet, setDiet] = useState<string[]>(['none']);

  const toggleDiet = (d: string) => {
    if (d === 'none') {
      setDiet(['none']);
      return;
    }
    const newDiet = diet.includes(d) ? diet.filter(i => i !== d) : [...diet.filter(i => i !== 'none'), d];
    if (newDiet.length === 0) setDiet(['none']);
    else setDiet(newDiet);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background font-sans text-foreground overflow-hidden relative">
      
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-4 py-4 bg-card border-b border-border shadow-sm z-10">
        <h1 className="font-bold text-lg">Perfil y Preferencias</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* User Tier / Account Info */}
          <section className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex items-center gap-5">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center shrink-0 border-2 border-white/30">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{mockUser.nombreCompleto}</h2>
              <p className="text-emerald-100 text-sm mt-1 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Cuota: {mockUser.cuotaTokensIa}/5 consultas IA
              </p>
              <button className="mt-3 bg-white text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors">
                Mejorar a Colaborador
              </button>
            </div>
          </section>

          {/* RN-00 & RN-22: Budget & Transport */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Parámetros del Motor Logístico (RN-22)</h3>
            
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-6">
              
              {/* Transport Mode */}
              <div>
                <label className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4 text-emerald-600" /> Transporte por Defecto
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setTransportMode('car')}
                    className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all", transportMode === 'car' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-border text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700")}
                  >
                    <Car className="h-6 w-6 mb-2" />
                    <span className="text-sm font-semibold">Vehículo Particular</span>
                    <span className="text-xs font-normal opacity-70">Usa API CNE (km/L)</span>
                  </button>
                  <button 
                    onClick={() => setTransportMode('bus')}
                    className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all", transportMode === 'bus' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-border text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-700")}
                  >
                    <Bus className="h-6 w-6 mb-2" />
                    <span className="text-sm font-semibold">Transporte Público</span>
                    <span className="text-xs font-normal opacity-70">Rutas OTP (Temuco)</span>
                  </button>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="text-sm font-semibold mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-600" /> Presupuesto Promedio Mensual</span>
                  <span className="text-emerald-600 font-bold">${budget.toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="10000" max="300000" step="5000" 
                  value={budget} 
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                  <span>$10.000</span>
                  <span>$300.000</span>
                </div>
              </div>

            </div>
          </section>

          {/* RN-00: Diet Restrictions */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Restricciones Dietéticas (RN-00)</h3>
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'none', label: 'Sin Restricciones', icon: Utensils },
                  { id: 'celiac', label: 'Celiaco / Sin Gluten', icon: Apple },
                  { id: 'vegan', label: 'Vegano', icon: Leaf },
                  { id: 'keto', label: 'Keto', icon: TrendingUp }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => toggleDiet(d.id)}
                    className={cn(
                      "flex flex-col items-center text-center p-3 rounded-xl border transition-all h-full justify-center",
                      diet.includes(d.id) ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <d.icon className="h-5 w-5 mb-2" />
                    <span className="text-xs font-semibold leading-tight">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <button className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-md">
            <Save className="h-5 w-5" />
            Guardar Preferencias
          </button>
        </div>
      </main>
    </div>
  );
}
