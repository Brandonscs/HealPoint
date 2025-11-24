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

        const pacienteReal = respPaciente.data;

        // 3️⃣ Guardar paciente con toda su información
        setPaciente(pacienteReal);
        localStorage.setItem("pacienteLogueado", JSON.stringify(pacienteReal));
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setErrorMsg(
          "Error al cargar los datos del paciente. Por favor, intente nuevamente."
        );

        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: "No se pudieron cargar los datos del paciente.",
          confirmButtonColor: "#d33",
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
          <button onClick={() => window.location.reload()} className="btn-retry">
            Reintentar
          </button>
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
              Gestione sus citas médicas y consulte su historial de forma rápida y segura.
            </p>
            <p className="user-info">
              <strong>Rol:</strong> {usuario.rol?.nombreRol || "Paciente"}
            </p>
          </section>

          <section className="cards-grid">
            <article
              className="card"
              onClick={() => handleNavigate("/paciente/citas")}
              role="button"
            >
              <img src="/icons/calendar.svg" alt="Mis Citas" />
              <h3>Mis Citas</h3>
              <p>Visualice y administre sus citas programadas.</p>
            </article>

            <article
              className="card"
              onClick={() => handleNavigate("/paciente/historial")}
              role="button"
            >
              <img src="/icons/file-medical.svg" alt="Historial" />
              <h3>Historial Médico</h3>
              <p>Consulte su historial de consultas y diagnósticos.</p>
            </article>

            <article
              className="card"
              onClick={() => handleNavigate("/paciente/configuracion")}
              role="button"
            >
              <img src="/icons/gear.svg" alt="Configuración" />
              <h3>Configuración</h3>
              <p>Actualice su información personal y preferencias.</p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}