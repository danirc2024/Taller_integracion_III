import { Link } from 'react-router-dom';
import { Search, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/core/routes';

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 text-center">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Taller de Integración III
        </span>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
          Compara precios y arma la ruta más barata
        </h1>
        <p className="max-w-2xl text-balance text-lg text-muted-foreground">
          Encuentra los productos que buscas en los supermercados de Temuco, compara
          precios en tiempo real y calcula cuánto te cuesta realmente trasladarte.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to={ROUTES.CATALOGO}>
            <Button size="lg" className="gap-2">
              <Search className="h-4 w-4" />
              Explorar catálogo
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button size="lg" variant="outline" className="gap-2">
              Iniciar sesión
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Search,
            title: 'Compara precios',
            body: 'Miles de productos de Jumbo, Líder, Unimarc y más en un solo lugar.',
          },
          {
            icon: MapPin,
            title: 'Optimiza tu ruta',
            body: 'Calculamos si el ahorro justifica el viaje, en auto o en transporte público.',
          },
          {
            icon: Sparkles,
            title: 'Asistente IA',
            body: 'Pídele recetas o sustitutos y te sugiere productos reales del catálogo.',
          },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}