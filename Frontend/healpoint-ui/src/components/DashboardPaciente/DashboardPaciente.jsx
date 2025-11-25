import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import pacienteService from "../../services/pacienteService";
import "../DashboardPaciente/DashboardPaciente.scss";
import Navbar from "../Shared/Navbar/Navbar";
import Sidebar from "../Shared/Sidebar/Sidebar";
import Swal from "sweetalert2";

export default function DashboardPaciente() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ================================
  // CARGAR DATOS INICIALES
  // ================================
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1️⃣ Obtener usuario del localStorage
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

        if (!usuarioLocal || !usuarioLocal.idUsuario) {
          navigate("/login");
          return;
        }

        // Validar que sea paciente
        if (usuarioLocal.rol?.nombreRol !== "Paciente") {
          navigate("/");
          return;
        }

        setUsuario(usuarioLocal);

        // 2️⃣ Obtener datos completos del paciente usando idUsuario
        const respPaciente = await pacienteService.getPacientePorIdUsuario(
          usuarioLocal.idUsuario
        );

        // Verificar si la respuesta es un objeto o un mensaje de error
        if (typeof respPaciente.data === 'string') {
          throw new Error(respPaciente.data);
        }

        const pacienteReal = respPaciente.data;

        // 3️⃣ Guardar paciente con toda su información
        setPaciente(pacienteReal);
        localStorage.setItem("pacienteLogueado", JSON.stringify(pacienteReal));
      } catch (error) {
        console.error("Error al cargar datos:", error);
        
        // Mensaje de error más específico
        let mensajeError = "Error al cargar los datos del paciente.";
        
        if (error.response) {
          // El servidor respondió con un código de error
          if (typeof error.response.data === 'string') {
            mensajeError = error.response.data;
          } else if (error.response.data?.message) {
            mensajeError = error.response.data.message;
          }
        } else if (error.message) {
          mensajeError = error.message;
        }

        setErrorMsg(mensajeError);

        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: mensajeError,
          confirmButtonColor: "#d33",
          footer: '<a href="/login">¿Necesitas volver a iniciar sesión?</a>'
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  // ================================
  // LOGOUT
  // ================================
  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("pacienteLogueado");
    navigate("/login");
  }, [navigate]);

  // ================================
  // NAVEGACIÓN
  // ================================
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  // ================================
  // RENDER - LOADING
  // ================================
  if (loading) {
    return (
      <div className="dashboard-paciente-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  // ================================
  // RENDER - ERROR
  // ================================
  if (errorMsg) {
    return (
      <div className="dashboard-paciente-root">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">{errorMsg}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn-retry">
              Reintentar
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si paciente aún no cargó
  if (!paciente || !usuario) return null;

  // ================================
  // RENDER - DASHBOARD
  // ================================
  return (
    <div className="dashboard-paciente-root">
      <img src="/icons/heart-pulse.svg" className="bg-icon i1" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i2" alt="" />
      <img src="/icons/stethoscope.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={usuario} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar paciente={paciente} onLogout={handleLogout} />

        <main className="content">
          <section className="hero">
            <h1>
              Bienvenido, {usuario.nombre} {usuario.apellido}
            </h1>
            <p className="subtitle">
              Aquí puedes gestionar tus citas y ver tu historial médico.
            </p>
            <p className="user-info">
              <strong>Rol:</strong> {usuario.rol?.nombreRol || "Paciente"} | 
              <strong> EPS:</strong> {paciente.eps || "No asignada"}
            </p>
          </section>

          <section className="cards-grid">
            {/* Tarjeta: Agendar Cita */}
            <article
              className="card"
              onClick={() => handleNavigate("/paciente/agendar")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleNavigate("/paciente/agendar");
              }}
            >
              <div className="card-icon">
                <img src="../../../public/cita-paciente.png" alt="Agendar Cita" />
              </div>
              <h3>Agendar Cita</h3>
              <p>Solicita una nueva cita médica según disponibilidad.</p>
            </article>

            {/* Tarjeta: Mis Citas */}
            <article
              className="card"
              onClick={() => handleNavigate("/paciente/citas")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleNavigate("/paciente/citas");
              }}
            >
              <div className="card-icon">
                <img src="../../../public/cita-medica.png" alt="Mis Citas" />
              </div>
              <h3>Mis Citas</h3>
              <p>Consulta tus citas pendientes o completadas.</p>
            </article>

            {/* Tarjeta: Historial Médico */}
            <article
              className="card"
              onClick={() => handleNavigate("/paciente/historial")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleNavigate("/paciente/historial");
              }}
            >
              <div className="card-icon">
                <img src="../../../public/informe-medico.png" alt="Historial Médico" />
              </div>
              <h3>Historial Médico</h3>
              <p>Revisa tus diagnósticos y tratamientos anteriores.</p>
            </article>

            {/* Tarjeta: Configuración */}
            <article 
              className="card card-configuracion card-empty"
              role="button"
              tabIndex={0}
              aria-disabled="true"
            >
              <img src="../../../public/configuracion-de-la-nube.png" alt="Configuración" />
              <h3>Configuración</h3>
              <p>Preferencias y datos de la cuenta.</p>
              <span className="badge-soon">Próximamente</span>
            </article>
          </section>
        </main>

        <footer className="footer">
          <p>© 2025 HealPoint – Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}