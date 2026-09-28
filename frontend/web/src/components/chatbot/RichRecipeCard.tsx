import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { products, supermarketById, formatPrice } from '@/data/mock';

interface RichRecipeCardProps {
  onAddToCart?: () => void;
  className?: string;
}

export function RichRecipeCard({ onAddToCart, className }: RichRecipeCardProps) {
  const items = [
    { 
      name: products[0].name, 
      market: supermarketById(products[0].supermarketId)?.name || "Supermercado", 
      marketColor: `bg-[${supermarketById(products[0].supermarketId)?.color}]/10 text-[${supermarketById(products[0].supermarketId)?.color}] border-[${supermarketById(products[0].supermarketId)?.color}]/20`, 
      price: formatPrice(products[0].price), 
      stock: true 
    },
    { 
      name: products[1].name, 
      market: supermarketById(products[1].supermarketId)?.name || "Supermercado", 
      marketColor: `bg-[${supermarketById(products[1].supermarketId)?.color}]/10 text-[${supermarketById(products[1].supermarketId)?.color}] border-[${supermarketById(products[1].supermarketId)?.color}]/20`, 
      price: formatPrice(products[1].price), 
      stock: true 
    },
    { 
      name: products[3].name, 
      market: supermarketById(products[3].supermarketId)?.name || "Supermercado", 
      marketColor: `bg-[${supermarketById(products[3].supermarketId)?.color}]/10 text-[${supermarketById(products[3].supermarketId)?.color}] border-[${supermarketById(products[3].supermarketId)?.color}]/20`, 
      price: formatPrice(products[3].price), 
      stock: false, 
      substitute: "Sustituto sugerido: Cous Cous"
    }
  ];

  return (
    <div className={cn("space-y-5", className)}>
      <p className="leading-relaxed">
        ¡Excelente elección! He calculado la alternativa más económica para tu almuerzo saludable. Aquí tienes los ingredientes optimizados según los catálogos vigentes:
      </p>
      
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-border dark:hover:border-border transition-colors">
            <div className="flex gap-3 items-start sm:items-center">
              <input type="checkbox" defaultChecked className="mt-1 sm:mt-0 h-4 w-4 rounded border-input text-foreground focus:ring-ring" />
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", item.marketColor)}>
                    {item.market}
                  </span>
                  {!item.stock && (
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-100 text-red-700 border-red-200">
                      Sin Stock
                    </span>
                  )}
                  {item.substitute && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {item.substitute}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-sm">{item.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button 
          onClick={onAddToCart}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold shadow-[4px_4px_0px_var(--color-border)] border-2 border-border transition-all active:translate-y-[2px] active:shadow-[2px_2px_0px_var(--color-border)]"
        >
          <ShoppingCart className="h-4 w-4" />
          Agregar ingredientes al Carrito
        </button>
      </div>
    </div>
  );
}
