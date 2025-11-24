import "./Privacidad.scss";

export default function Privacidad() {
  return (
    <div className="privacidad-container">
      <h1>Política de Privacidad</h1>

      <p><strong>⚠️ Nota: Esta página es un ejemplo de pruebas.</strong></p>

      <p>
        La presente Política de Privacidad describe, a modo demostrativo, cómo 
        un sistema como HealPoint podría recopilar, almacenar y utilizar los datos 
        personales de los usuarios. Esta versión no representa un documento legal 
        definitivo y tiene fines únicamente ilustrativos para la estructura del
        sistema.
      </p>

      <p>
        En un entorno real, la política incluiría información detallada sobre:
        el tratamiento de datos, derechos del usuario, almacenamiento seguro,
        tiempo de retención, transferencias y cumplimiento con normativas como
        la Ley de Protección de Datos Personales.
      </p>

      <button className="back-btn" onClick={() => window.location.href = "/"}>
        Volver al inicio
      </button>
    </div>
  );
}
