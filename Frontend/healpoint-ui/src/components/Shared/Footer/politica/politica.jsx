import "./Politica.scss";

export default function Politica() {
  return (
    <div className="politica-container">
      <h1>Términos de Uso</h1>

      <p><strong>⚠️ Nota: Esta página es un ejemplo de pruebas.</strong></p>

      <p>
        Estos Términos de Uso representan una versión de demostración creada para 
        ilustrar cómo sería la estructura legal de un servicio como HealPoint.
        Este contenido no es legal ni vinculante, y solo cumple una función
        visual y de pruebas dentro del desarrollo del sistema.
      </p>

      <p>
        En un documento real se especificarían las responsabilidades del usuario,
        las condiciones para acceder al servicio, el uso permitido, restricciones,
        derechos de propiedad intelectual, limitación de responsabilidades y 
        disposiciones finales.
      </p>

      <button className="back-btn" onClick={() => window.location.href = "/"}>
        Volver al inicio
      </button>
    </div>
  );
}
