import { Link } from "react-router-dom";
import { Brain, Coffee } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="landing-footer__grid">

          <div className="landing-footer__col">
            <h4>Producto</h4>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#ahorro">Ahorro real</a>
            <Link to="/dashboard">Catálogo</Link>
          </div>

          <div className="landing-footer__col">
            <h4>Proyecto</h4>
            <a href="#">Sobre el equipo</a>
            <a href="#">Documentación</a>
            <a href="#">Metodología</a>
            <a href="#">Contacto</a>
          </div>

          <div className="landing-footer__col">
            <h4>Legal</h4>
            <a href="#">Privacidad</a>
            <a href="#">Términos de uso</a>
            <a href="#">Cookies</a>
            <a href="#">Fuentes de datos</a>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <span>© 2026 RutaAhorro Todos los derechos reservados</span>
          <span className="inline-flex items-center gap-1.5">Hecho con <Coffee size={14} /> y <Brain size={14} /> en Temuco, Chile.</span>
        </div>
      </div>
    </footer>
  );
}