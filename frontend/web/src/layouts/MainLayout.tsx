import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { SideBar } from "@/components/Sidebar";
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

      {/* pb-16 reserva espacio para el BottomNav fijo y evita tapar contenido */}
      <div className="flex flex-1 flex-col overflow-hidden pb-16">
        {/* overflow-y-auto permite que Home / ProductDetail puedan scrollear */}
        <div className="flex-1 overflow-y-auto">
          <Outlet context={{ query, activeMarket } satisfies LayoutContextType} />
        </div>
      </div>

      <BottomNav active="dashboard" />
    </div>
  );
}