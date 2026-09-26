import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingBasket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import landingData from "@/data/landing.json";

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="landing-nav">
      <div className="container landing-nav__inner">
        <Link to="/" className="landing-nav__brand">
          <span className="landing-nav__brand-mark">
            <ShoppingBasket size={20} />
          </span>
          <span className="landing-nav__brand-text">
            RutaAhorro
          </span>
        </Link>

        <ul className="landing-nav__links">
          {landingData.navigation.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="landing-nav__actions">
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} to="/login">Iniciar sesión</Link>
          <Link className={buttonVariants({ size: "sm" })} to="/onboarding">Crear cuenta</Link>
          <button
            type="button"
            className="landing-mobile-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="landing-mobile-links">
          {landingData.navigation.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
          <Link to="/onboarding" onClick={() => setMenuOpen(false)}>Crear cuenta</Link>
        </div>
      )}
    </nav>
  );
}