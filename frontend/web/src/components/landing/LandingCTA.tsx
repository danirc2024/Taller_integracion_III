import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="landing-section" style={{ paddingTop: 0, paddingBottom: "1rem" }}>
      <div className="container">
        <div className="landing-cta">
          <h2>Tu hogar merece compras más inteligentes</h2>
          <p>
            Crea tu cuenta gratis y descubre cuánto puedes ahorrar esta semana.
            Sin tarjetas, sin compromisos.
          </p>
          <div className="landing-cta__actions">
            <Link
              className={buttonVariants({ size: "lg", className: "!bg-[oklch(0.98_0.01_83)] !text-[var(--brand-dark-2)] hover:!bg-white" })}
              to="/onboarding"
            >Crear cuenta gratis</Link>
            <Link
              className={buttonVariants({ variant: "outline", size: "lg", className: "!bg-transparent !text-white !border-white/40 hover:!bg-white/10" })}
              to="/dashboard"
            >Explorar como invitado</Link>
          </div>
        </div>
      </div>
    </section>
  );
}