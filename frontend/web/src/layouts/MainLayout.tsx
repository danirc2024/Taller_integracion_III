import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { TopNav } from "@/components/top-nav";
import { SideBar } from "@/components/side-bar";

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

  return (
    <div className="flex h-dvh flex-col bg-background">
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

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <Outlet context={{ query, activeMarket } satisfies LayoutContextType} />
        
        {/* Futuro Footer */}
        <footer className="border-t border-border bg-card p-4 text-center text-sm text-muted-foreground mt-auto">
          &copy; {new Date().getFullYear()} PrecioRuta. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
