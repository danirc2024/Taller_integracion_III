import { useState } from 'react';
import { User, ShieldAlert, CreditCard, Car, Bus, Apple, Leaf, Utensils, TrendingUp, Save, Zap, Settings, BarChart2, Key, Bell, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockUser } from '@/data/mock';
import { Link } from 'react-router-dom';
import MockShell from '@/pages/mocks/MockShell';

export default function Profile() {
    const [budget, setBudget] = useState(50000);
    const [transportMode, setTransportMode] = useState<'car' | 'bus'>('car');
    const [diet, setDiet] = useState<string[]>(['none']);
    const [activeTab, setActiveTab] = useState<'cuenta' | 'preferencias' | 'estadisticas'>('preferencias');

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
        <MockShell sprint="Sprint 2">
        <div className="flex flex-col h-full bg-background font-sans text-foreground overflow-hidden relative">

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background">
                <div className="max-w-[1600px] mx-auto w-full mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Perfil y Configuración</h1>
                </div>

                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-8 md:gap-12 w-full">
                    
                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-row md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {[
                                { id: 'cuenta', label: 'Mi Cuenta', icon: User },
                                { id: 'preferencias', label: 'Preferencias de Ruta', icon: Settings },
                                { id: 'estadisticas', label: 'Mis Estadísticas', icon: BarChart2 }
                            ].map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={cn("flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all whitespace-nowrap", activeTab === item.id ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]" : "hover:bg-accent text-muted-foreground")}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Tab Content */}
                    <div className="flex-1 min-w-0">
                        
                        {activeTab === 'cuenta' && (
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-2xl font-bold">Información de Cuenta</h2>
                                
                                {/* User Tier / Account Info */}
                                <section className="bg-gradient-to-r from-secondary to-background rounded-2xl p-6 text-primary-foreground shadow-lg flex flex-col sm:flex-row sm:items-center gap-5">
                                    <div className={`h-16 w-16 bg-white/20 rounded-full flex items-center justify-center shrink-0 border-2 border-white/30 ${mockUser.plan === 'Plus' ? 'border-amber-400 bg-amber-500/20' : ''}`}>
                                        {mockUser.plan === 'Plus' ? <Zap className="h-8 w-8 text-amber-500" /> : <User className="h-8 w-8 text-primary-foreground" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold">{mockUser.nombre_completo}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] uppercase tracking-wider font-bold ${mockUser.plan === 'Plus' ? 'bg-amber-100 text-amber-700' : 'bg-primary/20 text-primary-foreground'}`}>
                                                {mockUser.plan === 'Plus' ? 'Plus' : 'Básico'}
                                            </span>
                                        </div>
                                        <p className="text-primary text-sm flex items-center gap-1.5 mb-2">
                                            <ShieldAlert className="h-4 w-4" /> Cuota: {mockUser.cuota_tokens_ia}/5 consultas IA
                                        </p>
                                        <p className="text-sm text-primary-foreground/80">{mockUser.correo}</p>
                                        <Link to="/planes" className="mt-4 inline-block bg-white text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary transition-colors hover:text-primary-foreground border-2 border-transparent hover:border-white shadow-sm">
                                            {mockUser.plan === 'Plus' ? 'Administrar Suscripción' : 'Ver Planes y Mejorar'}
                                        </Link>
                                    </div>
                                </section>

                                {/* Perfil Fields */}
                                <section className="space-y-6 pt-6 border-t border-border">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Datos Personales</h3>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground">Nombre Completo</label>
                                                <input type="text" defaultValue={mockUser.nombre_completo} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-muted-foreground">Correo Electrónico</label>
                                                <input type="email" defaultValue={mockUser.correo} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                                            </div>
                                        </div>
                                        <button className="text-sm font-bold text-primary hover:underline flex items-center gap-2 mt-4">
                                            <Key className="h-4 w-4" /> Cambiar Contraseña
                                        </button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'preferencias' && (
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="border-b border-border pb-6">
                                    <h2 className="text-2xl font-bold mb-1">Preferencias de Ruta</h2>
                                    <p className="text-muted-foreground text-sm">Ajusta cómo el motor logístico calcula tus listas y ofertas.</p>
                                </div>

                                {/* RN-00 & RN-22: Budget & Transport */}
                                <section className="space-y-6 pt-2">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Parámetros del Motor Logístico</h3>

                                    <div className="space-y-8">

                                        {/* Transport Mode */}
                                        <div>
                                            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <Car className="h-4 w-4 text-primary" /> Transporte por Defecto
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setTransportMode('car')}
                                                    className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer", transportMode === 'car' ? "border-border bg-primary text-primary-foreground shadow-[4px_4px_0px_var(--color-border)]" : "border-border text-muted-foreground hover:bg-accent")}
                                                >
                                                    <Car className="h-6 w-6 mb-2" />
                                                    <span className="text-sm font-semibold">Vehículo Particular</span>
                                                </button>
                                                <button
                                                    onClick={() => setTransportMode('bus')}
                                                    className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer", transportMode === 'bus' ? "border-border bg-primary text-primary-foreground shadow-[4px_4px_0px_var(--color-border)]" : "border-border text-muted-foreground hover:bg-accent")}
                                                >
                                                    <Bus className="h-6 w-6 mb-2" />
                                                    <span className="text-sm font-semibold">Transporte Público</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Budget */}
                                        <div>
                                            <label className="text-sm font-semibold mb-3 flex items-center justify-between">
                                                <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Presupuesto Promedio Mensual</span>
                                                <span className="text-primary font-bold">${budget.toLocaleString()}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="10000" max="300000" step="5000"
                                                value={budget}
                                                onChange={(e) => setBudget(parseInt(e.target.value))}
                                                className="w-full accent-black dark:accent-white h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                                                <span>$10.000</span>
                                                <span>$300.000</span>
                                            </div>
                                        </div>

                                    </div>
                                </section>

                                {/* RN-00: Diet Restrictions */}
                                <section className="space-y-6 pt-6 border-t border-border">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Restricciones Dietéticas</h3>
                                    <div>
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
                                                        "cursor-pointer flex flex-col items-center text-center p-3 rounded-xl border transition-all h-full justify-center",
                                                        diet.includes(d.id) ? "border-border bg-primary text-primary-foreground shadow-[4px_4px_0px_var(--color-border)]" : "border-border text-muted-foreground hover:bg-accent"
                                                    )}
                                                >
                                                    <d.icon className="h-5 w-5 mb-2" />
                                                    <span className="text-xs font-semibold leading-tight">{d.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-6 border-t border-border">
                                    <button className="w-full sm:w-auto px-8 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-[4px_4px_0px_var(--color-border)] active:shadow-none active:translate-y-1">
                                        <Save className="h-5 w-5" />
                                        Guardar Preferencias
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'estadisticas' && (
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="border-b border-border pb-6">
                                    <h2 className="text-2xl font-bold mb-1">Mis Estadísticas</h2>
                                    <p className="text-muted-foreground text-sm">El impacto de RutaAhorro en tu bolsillo mensual.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                            <TrendingUp className="h-5 w-5 text-olive" />
                                            <h4 className="font-bold">Ahorro Histórico</h4>
                                        </div>
                                        <p className="text-4xl font-extrabold text-foreground">$145.900</p>
                                        <p className="text-sm text-olive font-medium mt-2">↑ +$12.400 este mes</p>
                                    </div>
                                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                            <Activity className="h-5 w-5 text-primary" />
                                            <h4 className="font-bold">Listas Generadas</h4>
                                        </div>
                                        <p className="text-4xl font-extrabold text-foreground">24</p>
                                        <p className="text-sm text-muted-foreground mt-2">En 4 supermercados distintos</p>
                                    </div>
                                </div>
                                
                                {/* Chart Mock */}
                                <div className="pt-6 border-t border-border">
                                    <h4 className="font-bold mb-6 text-foreground">Ahorro Mensual (Últimos 6 meses)</h4>
                                    <div className="w-full h-48 bg-background border border-border rounded-xl relative overflow-hidden flex items-end">
                                        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-primary/10">
                                            <path d="M0 40 L0 30 L20 25 L40 32 L60 15 L80 18 L100 5 L100 40 Z" fill="currentColor" />
                                            <path d="M0 30 L20 25 L40 32 L60 15 L80 18 L100 5" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
                                        </svg>
                                        {/* Chart dots */}
                                        <div className="absolute inset-0 flex justify-between items-center px-2">
                                            {[30, 25, 32, 15, 18, 5].map((val, i) => (
                                                <div key={i} className="h-full flex flex-col justify-end" style={{ paddingBottom: `${40 - val}%` }}>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shadow-sm -mb-1.5 z-10" />
                                                    <span className="text-[10px] text-muted-foreground mt-4 mb-2">M{i+1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </main>
        </div>
        </MockShell>
    );
}
