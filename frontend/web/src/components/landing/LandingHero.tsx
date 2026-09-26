import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Lock, MapPin, ShoppingBasket, Car, PiggyBank } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import landingData from "@/data/landing.json";

export function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-orb o1" />
      <div className="landing-orb o2" />
      <div className="landing-orb o3" />

      <div className="container landing-hero__grid">
        {/* Columna izquierda */}
        <div>

          <h1>
            Compra para tu hogar <em>sin pagar de más</em> por el traslado.
          </h1>

          <p className="landing-hero__lead">
            Reunimos los precios de tus supermercados, calculamos el costo real de
            desplazarte y te mostramos la alternativa que <strong>de verdad</strong> te
            conviene. Sin hojas de cálculo, sin recorrer media ciudad, sin sorpresas.
          </p>

          <div className="landing-hero__cta">
            <Link className={buttonVariants({ size: "lg" })} to="/dashboard">
                Comenzar gratis <ArrowRight />
            </Link>
            <a className={buttonVariants({ variant: "outline", size: "lg" })} href="#como-funciona">Ver cómo funciona</a>
          </div>

          <div className="landing-hero__trust">
            <span><Lock size={14} /> No guardamos tu ubicación</span>
            <span><Leaf size={14} /> Datos verificados en tiempo real</span>
            <span><MapPin size={14} /> Hecho en Chile</span>
          </div>
        </div>

        {/* Columna derecha: mockup */}
        <div className="landing-hero__visual">
          <div className="landing-float landing-float--amber f1">
            <Car size={16} /> Viaje: 2.1 km · 6 min
          </div>
          <div className="landing-float landing-float--olive f2">
            <PiggyBank size={16} /> Ahorro neto: $6.140
          </div>

          <div className="landing-hero__card">
            <div className="landing-hero__card-head">
              <span className="title">Tu lista de compras</span>
              <span style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                padding: "0.25rem 0.6rem",
                borderRadius: "999px",
                background: "var(--landing-olive-soft)",
                border: "2px solid var(--landing-olive)",
                color: "var(--brand-dark)",
              }}>
                ● 8 productos
              </span>
            </div>

            {landingData.heroProducts.map((p) => (
              <div key={p.name} className="mini-product">
                <div className="emoji"><ShoppingBasket size={20} /></div>
                <div className="info">
                  <div className="name">{p.name}</div>
                  <div className="meta">{p.meta}</div>
                </div>
                <div>
                  <div className="price mono">{p.price}</div>
                  <div className="save">{p.save}</div>
                </div>
              </div>
            ))}

            <div className="landing-hero__total">
              <div>
                <div className="label">Costo total estimado</div>
                <div style={{ fontSize: "0.6875rem", opacity: 0.75, marginTop: 2 }}>
                  Productos + desplazamiento
                </div>
              </div>
              <div className="value">$45.780</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}