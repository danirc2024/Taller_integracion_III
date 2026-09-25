import landingData from "@/data/landing.json";

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="landing-section">
      <div className="container">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Paso a paso</span>
          <h2>Del carro al hogar en tres pasos</h2>
          <p>
            Diseñado para que cualquier persona, sin conocimientos técnicos, pueda tomar
            la mejor decisión de compra para su familia.
          </p>
        </div>

        <div className="landing-steps">
          {landingData.steps.map((s) => (
            <div key={s.num} className="landing-step">
              <div className="landing-step__num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}