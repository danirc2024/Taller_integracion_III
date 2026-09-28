import { useState } from "react";
import { Outlet, useOutletContext, useLocation } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { SideBar } from "@/components/Sidebar";
import { CartSidebar } from "@/components/CartSidebar";
import BottomNav from "@/components/BottomNav";
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
  const { pathname } = useLocation();
  const activeTab = 
    pathname.startsWith('/chat') ? 'chat' :
    pathname.startsWith('/history') ? 'history' :
    pathname.startsWith('/route') ? 'route' :
    pathname.startsWith('/colaborador') ? 'colaborador' :
    pathname.startsWith('/profile') ? 'profile' :
    'dashboard';

  return (
    <div className="flex h-dvh flex-col bg-background">
      <CartSidebar />
      <SideBar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeMarket={activeMarket}
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
