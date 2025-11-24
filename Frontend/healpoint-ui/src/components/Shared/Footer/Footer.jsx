import "./Footer.scss";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Texto principal */}
        <span className="footer-text">
          © 2025 HealPoint – Todos los derechos reservados.
        </span>

        {/* Enlaces secundarios */}
        <div className="footer-links">
          <a href="/privacidad">Política de privacidad</a>
          <a href="/terminos">Términos de uso</a>
          <a href="/contacto">Contacto</a>
        </div>
      </div>
    </footer>
  );
}
