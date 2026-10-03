import { Zap, CheckCircle2, Shield, Rocket } from 'lucide-react';
import { mockUser } from '@/data/mock';
import MockShell from '@/pages/mocks/MockShell';

export default function Planes() {
  return (
    <MockShell sprint="Sprint 2">
      <div className="flex flex-col h-full bg-background font-sans text-foreground overflow-y-auto">
      {/* Hero Section */}
      <section className="px-6 py-12 md:py-20 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Sube de nivel tus ahorros
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades de compra. Comienza gratis y desbloquea el verdadero poder de la inteligencia artificial.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-20 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

        {/* Free Tier */}
        <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm flex flex-col h-full transition-transform hover:-translate-y-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Plan Básico</h2>
            <p className="text-muted-foreground text-sm mt-2">Perfecto para empezar a organizar tus compras.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-extrabold text-foreground">$0</span>
            <span className="text-muted-foreground"> /mes</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['Comparación en 3 supermercados', 'Creación de listas de compras ilimitadas', 'Acceso al motor logístico básico', 'Soporte comunitario'].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button
            disabled={mockUser.plan === 'Usuario'}
            className="w-full py-3.5 rounded-xl border-2 border-primary text-primary font-bold transition-colors disabled:opacity-50 disabled:bg-primary/5 disabled:cursor-not-allowed hover:bg-primary/10"
          >
            {mockUser.plan === 'Usuario' ? 'Tu plan actual' : 'Cambiar a Básico'}
          </button>
        </div>

        {/* Pro Tier */}
        <div className="relative bg-primary text-primary-foreground rounded-3xl p-8 shadow-2xl flex flex-col h-full transform md:-translate-y-4 shadow-[8px_8px_0px_var(--color-amber)] border-2 border-border transition-transform hover:-translate-y-5">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Zap className="h-4 w-4" />
            Más Popular
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-foreground">Suscripción Plus</h2>
            <p className="text-primary-foreground/80 text-sm mt-2">Para los verdaderos maestros del ahorro.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-extrabold">$2.990</span>
            <span className="text-primary-foreground/80"> /mes</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {[
              'Todo lo del Plan Básico',
              'Comparación ilimitada de supermercados',
              'Consultas Ilimitadas (Recetas, sustitutos)',
              'Rutas de múltiples paradas optimizadas',
              'Alertas de bajadas de precio en tiempo real',
              'Soporte prioritario'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button
            disabled={mockUser.plan === 'Plus'}
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mockUser.plan === 'Plus' ? 'Suscripción Activa' : 'Mejorar a Plus'}
          </button>
        </div>

        {/* Annual Pro Tier */}
        <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm flex flex-col h-full transition-transform hover:-translate-y-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Plus (Anual)</h2>
            <p className="text-muted-foreground text-sm mt-2">Ahorra más a largo plazo con un solo pago.</p>
          </div>
          <div className="mb-8 relative">
            <div className="absolute -top-3 -right-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-md rotate-3">
              Ahorras 33%
            </div>
            <span className="text-5xl font-extrabold text-foreground">$23.900</span>
            <span className="text-muted-foreground"> /año</span>
            <p className="text-xs text-primary font-bold mt-2">$1.990 /mes</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {[
              'Todo lo de la Suscripción Plus',
              'Acceso ininterrumpido por 12 meses',
              'Protección contra subidas de precio'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button
            className="w-full py-3.5 rounded-xl border-2 border-primary text-primary font-bold transition-colors hover:bg-primary hover:text-primary-foreground hover:shadow-md"
          >
            Pagar Anual
          </button>
        </div>

      </section>

      {/* FAQ or Trust Section */}
      <section className="bg-muted px-6 py-16 text-center border-t border-border mt-auto">
        <h3 className="text-xl font-bold text-foreground mb-8">Preguntas Frecuentes</h3>
        <div className="max-w-3xl mx-auto text-left space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h4 className="font-bold text-foreground flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> ¿Puedo cancelar en cualquier momento?</h4>
            <p className="text-muted-foreground text-sm mt-2">Sí, puedes cancelar tu Suscripción Plus en cualquier momento desde tu perfil sin ningún tipo de recargo adicional.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h4 className="font-bold text-foreground flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> ¿Cómo funciona el motor logístico Plus?</h4>
            <p className="text-muted-foreground text-sm mt-2">El motor logístico Plus optimiza rutas complejas considerando múltiples paradas (hasta 5 tiendas diferentes) e incluye estimaciones de costo de bencina y transporte público para garantizar rentabilidad neta real.</p>
          </div>
        </div>
      </section>

    </div>
    </MockShell>
  );
}
