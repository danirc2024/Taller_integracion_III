import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import landingData from "@/data/landing.json";

export function LandingSavings() {
  return (
    <section id="ahorro" className="landing-section">
      <div className="container">
        <div className="landing-savings">
          <div className="landing-savings__text">
            <span className="landing-eyebrow">Caso real</span>
            <h2>El ahorro que sientes en el bolsillo</h2>
            <p>
              Una familia en Temuco compra los mismos 8 productos cada semana.
              Mira lo que pasa cuando considera el costo de traslado:
            </p>

            <ul className="landing-savings__list">
              {landingData.savings.items.map((item) => (
                <li key={item}>
                  <span className="check">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link className={buttonVariants({ size: "lg" })} to="/onboarding">
              Quiero ver mi ahorro <ArrowRight />
            </Link>
          </div>

          <div className="landing-savings__visual">
            {landingData.savings.bars.map((b) => (
              <div key={b.label} className="bar-row">
                <div className="bar-row__label">
                  <span>{b.label}</span>
                  <span className="val">{b.value}</span>
                </div>
                <div className="bar">
                  <div className={`bar__fill bar__fill--${b.variant}`} style={{ width: b.width }} />
                </div>
              </div>
            ))}

            <div className="landing-savings__footer">
              <span className="label">Ahorro neto semanal</span>
              <span className="value">{landingData.savings.weeklySaving}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}