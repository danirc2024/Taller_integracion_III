import landingData from "@/data/landing.json";

export function LandingTrustStrip() {
  return (
    <div className="landing-trust">
      <div className="container landing-trust__inner">
        {landingData.metrics.map((m) => (
          <div key={m.num} className="landing-trust__item">
            <div className="landing-trust__num">{m.num}</div>
            <div className="landing-trust__txt">{m.lines.map((line) => <span key={line}>{line}<br /></span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}