import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usuarioService from "../../services/usuarioService";
import "../DashboardPaciente/DashboardPaciente.scss";

import Navbar from "../Shared/Navbar/Navbar";
import Sidebar from "../Shared/Sidebar/Sidebar";

export default function DashboardPaciente() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const cargarDatosPaciente = async () => {
      try {
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

        // Validación correcta usando idUsuario
        if (!usuarioLocal || !usuarioLocal.idUsuario) {
          navigate("/login");
          return;
        }

        // Obtener la info completa del paciente desde usuarioService
        const response = await usuarioService.getUsuarioById(
          usuarioLocal.idUsuario
        );

        setPaciente(response.data);
        localStorage.setItem("pacienteLogueado", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error al cargar datos del paciente:", error);
        setErrorMsg(
          "Error al cargar los datos del paciente. Por favor, intente nuevamente."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatosPaciente();
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("pacienteLogueado");
    navigate("/login");
  }, [navigate]);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="dashboard-admin-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="dashboard-admin-root">
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

  // Si paciente todavía no cargó (evita errores)
  if (!paciente) return null;

  return (
    <div className="dashboard-paciente-root">
      <img src="/icons/heart-pulse.svg" className="bg-icon i1" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i2" alt="" />
      <img src="/icons/stethoscope.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={paciente} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar paciente={paciente} onLogout={handleLogout} />

        <main className="content">
          <section className="hero">
            <h1>
              Bienvenido, {paciente.nombre} {paciente.apellido}
            </h1>
            <p className="subtitle">
              Gestione sus citas médicas y consulte su historial de forma rápida y segura.
            </p>
          </section>

          <section className="cards-grid">
            <article
              className="card"
              onClick={() => handleNavigate("/paciente/agendar")}
              role="button"
            >
              <img src="/icons/calendar-plus.svg" alt="Agendar Cita" />
              <h3>Agendar Cita</h3>
              <p>Programe una nueva cita médica con su especialista.</p>
            </article>

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

            <article
              className="card"
              onClick={() => handleNavigate("/paciente/medicos")}
              role="button"
            >
              <img src="/icons/user-doctor.svg" alt="Médicos" />
              <h3>Mis Médicos</h3>
              <p>Vea la información de sus médicos tratantes.</p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}