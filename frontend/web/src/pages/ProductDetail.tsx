import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  discountPct,
  formatPrice,
  products,
  supermarketById,
} from '@/data/mock';
import { ROUTES } from '@/core/routes';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          El producto <code className="rounded bg-muted px-1.5 py-0.5">{id}</code> no existe en el catálogo.
        </p>
        <Button className="mt-6" onClick={() => navigate(ROUTES.CATALOGO)}>
          Volver al catálogo
        </Button>
      </div>
    );
  }

  const market = supermarketById(product.supermarketId);
  const pct = discountPct(product);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        to={ROUTES.CATALOGO}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
          {pct > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-md bg-discount px-2 py-1 text-xs font-bold text-discount-foreground">
              -{pct}%
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-8"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{product.unit}</p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {pct > 0 && (
              <span className="font-mono text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm">
            <img
              src={market.logo}
              alt={market.name}
              className="h-6 w-6 rounded-full object-contain"
            />
            <span className="font-medium">{market.name}</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Temuco
            </span>
          </div>

          <Button size="lg" className="mt-2 w-full gap-2">
            <Plus className="h-5 w-5" />
            Añadir a la lista
          </Button>
        </div>
      </div>
    </main>
  );
}