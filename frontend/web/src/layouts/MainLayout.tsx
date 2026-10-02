import { useEffect, useState } from "react";
import { Outlet, useOutletContext, useLocation } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { SideBar } from "@/components/Sidebar";
import { CartSidebar } from "@/components/CartSidebar";
import BottomNav from "@/components/BottomNav";
import { getProducts } from "@/lib/products-api";
import type { UiSupermarket } from "@/types";
type LayoutContextType = {
  query: string;
  activeMarket: string | null;
};

export function useLayoutContext() {
  return useOutletContext<LayoutContextType>();
}

export function MainLayout() {
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMarket, setActiveMarket] = useState<string | null>(null);
  const [availableMarkets, setAvailableMarkets] = useState<UiSupermarket[]>([]);
  const { pathname } = useLocation();
  const activeTab = 
    pathname.startsWith('/chat') ? 'chat' :
    pathname.startsWith('/history') ? 'history' :
    pathname.startsWith('/route') ? 'route' :
    pathname.startsWith('/colaborador') ? 'colaborador' :
    pathname.startsWith('/profile') ? 'profile' :
    'dashboard';

  useEffect(() => {
    let isMounted = true;

    getProducts('?limit=100&en_stock=true')
      .then(({ products }) => {
        if (!isMounted) return;

        const markets = new Map<string, UiSupermarket>();
        products.forEach((product) => {
          if (!product.supermarketName || markets.has(product.supermarketId)) return;

          markets.set(product.supermarketId, {
            id: product.supermarketId,
            dbId: 0,
            name: product.supermarketName,
            logo: '/placeholder.svg',
            color: 'oklch(0.5 0 0)',
            coords: [0, 0],
          });
        });
        setAvailableMarkets(Array.from(markets.values()));
      })
      .catch(() => {
        if (isMounted) setAvailableMarkets([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <CartSidebar />
      <SideBar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeMarket={activeMarket}
        availableMarkets={availableMarkets}
        onSelectMarket={(id) => {
          setActiveMarket(id);
          setSidebarOpen(false);
        }}
      />
      
      <TopNav
        query={query}
        onQueryChange={setQuery}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
        {/* Main Content Area */}
        <Outlet context={{ query, activeMarket } satisfies LayoutContextType} />
      </div>
      
      <div className="md:hidden">
        <BottomNav active={activeTab} />
      </div>
    </div>
  );
}
