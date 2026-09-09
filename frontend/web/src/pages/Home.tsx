import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-4">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Unificación de Interfaces
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl">
          Selecciona una de las interfaces generadas por v0 para visualizarla y probarla.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <Link to="/dashboard" className="w-full">
            <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 border-zinc-800 transition-all text-white hover:text-white bg-zinc-950">
              <span className="text-xl font-semibold">Dashboard</span>
              <span className="text-sm text-zinc-500 font-normal">Panel de Control</span>
            </Button>
          </Link>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 border-zinc-800 transition-all text-white hover:text-white bg-zinc-950">
              <span className="text-xl font-semibold">Login</span>
              <span className="text-sm text-zinc-500 font-normal">Acceso y Registro</span>
            </Button>
          </Link>
          <Link to="/onboarding" className="w-full">
            <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 border-zinc-800 transition-all text-white hover:text-white bg-zinc-950">
              <span className="text-xl font-semibold">Onboarding</span>
              <span className="text-sm text-zinc-500 font-normal">Primeros pasos</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
