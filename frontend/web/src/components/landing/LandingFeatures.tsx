import { Bot, Bus, Leaf, MapPin, Tag, Zap } from "lucide-react";
import landingData from "@/data/landing.json";

const featureIcons = { Bot, Bus, Leaf, MapPin, Tag, Zap } as const;

export function LandingFeatures() {
  return (
    <section id="beneficios" className="landing-section landing-section--alt">
      <div className="container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Por qué RutaAhorro</span>
          <h2>Pensado para el bolsillo y para tu tiempo</h2>
          <p>
            No solo comparamos precios: entendemos que ir al súper es una decisión
            que afecta tu casa, tu tiempo y tu tranquilidad.
          </p>
        </div>

        <div className="landing-features">
          {landingData.features.map((f) => {
            const Icon = featureIcons[f.icon as keyof typeof featureIcons];
            return (
            <div key={f.title} className="landing-feature">
              <div className="landing-feature__icon"><Icon size={24} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}