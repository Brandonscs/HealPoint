import "./Contacto.scss";

export default function Contacto() {
  return (
    <div className="contacto-container">
      <h1>Contacto</h1>

      <p><strong>⚠️ Nota: Esta página es un ejemplo de pruebas.</strong></p>

      <p>
        Esta sección muestra cómo podría lucir una página de contacto para un sistema 
        como HealPoint. Los siguientes íconos representan canales de comunicación 
        simulados y no están vinculados a servicios reales. Su función es permitir 
        validar el diseño y visualización dentro del sistema.
      </p>

      <div className="icon-list">
        <div className="icon-item"><i className="bi bi-facebook"></i><span>Facebook</span></div>
        <div className="icon-item"><i className="bi bi-instagram"></i><span>Instagram</span></div>
        <div className="icon-item"><i className="bi bi-linkedin"></i><span>LinkedIn</span></div>
        <div className="icon-item"><i className="bi bi-envelope-fill"></i><span>Correo corporativo</span></div>
        <div className="icon-item"><i className="bi bi-whatsapp"></i><span>WhatsApp</span></div>
      </div>

      <button className="back-btn" onClick={() => window.location.href = "/"}>
        Volver al inicio
      </button>
    </div>
  );
}
