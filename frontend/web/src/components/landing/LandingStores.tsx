import { Plus, Store } from "lucide-react";
import landingData from "@/data/landing.json";

export function LandingStores() {
  return (
    <section id="supermercados" className="landing-section landing-section--alt">
      <div className="container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Cobertura</span>
          <h2>Los supermercados que ya conoces</h2>
          <p>
            Estamos integrando continuamente nuevas cadenas y sucursales en la
            región para que tengas el panorama completo.
          </p>
        </div>

        <div className="landing-stores">
          {landingData.stores.map((s, index) => (
            <div key={s.name} className="landing-store">
              <div className="landing-store__icon">{index === landingData.stores.length - 1 ? <Plus size={30} /> : <Store size={30} />}</div>
              <div className="landing-store__name">{s.name}</div>
              <div className="landing-store__desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}