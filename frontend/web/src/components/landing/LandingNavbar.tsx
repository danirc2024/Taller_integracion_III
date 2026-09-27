import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingBasket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import landingData from "@/data/landing.json";

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[oklch(0.958_0.015_90/0.85)] backdrop-blur-[14px] border-b-2 border-border">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 flex items-center justify-between gap-8 h-[76px]">
        <Link to="/" className="flex items-center gap-3 no-underline text-foreground">
          <span className="relative w-[44px] h-[44px] rounded-[var(--radius)] flex items-center justify-center text-[1.25rem] text-primary-foreground bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] border-2 border-border shadow-[3px_3px_0_var(--color-border)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(115deg, transparent 0 5px, oklch(0.2 0.02 60 / 0.12) 5px 6px)" }} />
            <ShoppingBasket size={20} className="relative z-10" />
          </span>
          <span className="flex flex-col leading-none font-['Fredoka'] font-bold text-[1.25rem]">
            RutaAhorro
          </span>
        </Link>

        <ul className="hidden md:flex gap-8 list-none flex-1 justify-center">
          {landingData.navigation.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="relative py-[6px] text-[0.875rem] font-bold text-foreground no-underline transition-colors duration-200 hover:text-[var(--brand)] group">
                {l.label}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[var(--brand)] rounded-sm transition-all duration-250 ease-out group-hover:w-full"></span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex gap-3 items-center">
          <div className="hidden md:flex gap-3">
            <Link className={buttonVariants({ variant: "outline", size: "sm" })} to="/login">Iniciar sesión</Link>
            <Link className={buttonVariants({ size: "sm" })} to="/login" state={{ tab: "signup" }}>Crear cuenta</Link>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 border-2 border-border rounded-[var(--radius)] bg-card text-foreground"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="flex flex-col gap-3 p-4 border-t-2 border-border bg-card absolute top-[76px] left-0 w-full shadow-[0_15px_25px_-5px_rgb(0_0_0/0.15)] z-40 md:hidden">
          {landingData.navigation.map((l) => (
            <a key={l.href} href={l.href} className="text-foreground font-bold no-underline" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <Link to="/login" className="text-foreground font-bold no-underline" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
          <Link to="/login" state={{ tab: "signup" }} className="text-foreground font-bold no-underline" onClick={() => setMenuOpen(false)}>Crear cuenta</Link>
        </div>
      )}
    </nav>
  );
}
