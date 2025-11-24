import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DashboardMedico.scss";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

export default function DashboardMedico() {
  const navigate = useNavigate();
  const [medico, setMedico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const cargarDatosMedico = async () => {
      try {
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

        if (!usuarioLocal || !usuarioLocal.idUsuario) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/medico/usuario/${usuarioLocal.idUsuario}`
        );

        setMedico(response.data);
        localStorage.setItem("medicoLogueado", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error al cargar datos del médico:", error);
        setErrorMsg("Error al cargar los datos del médico. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosMedico();
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("medicoLogueado");
    navigate("/");
  }, [navigate]);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Renderizado condicional para loading
  if (loading) {
    return (
      <div className="dashboard-medico-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando datos del médico...</p>
        </div>
      </div>
    );
  }

  // Renderizado condicional para error
  if (errorMsg) {
    return (
      <div className="dashboard-medico-root">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">{errorMsg}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-retry"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-medico-root">
      {/* Íconos translúcidos de fondo */}
      <img src="/icons/stetho.svg" className="bg-icon i1" alt="" />
      <img src="/icons/microscope.svg" className="bg-icon i2" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i3" alt="" />

      {/* Sidebar */}
      <Sidebar usuario={medico?.usuario} onLogout={handleLogout} />

      {/* Área principal */}
      <div className="main-area">
        {/* Navbar global */}
        <Navbar medico={medico} onLogout={handleLogout} />

        {/* Contenido */}
        <main className="content">
          {/* Hero section */}
          <section className="hero">
            <h1>
              Bienvenido, Dr. {medico.usuario?.nombre} {medico.usuario?.apellido}
            </h1>
            <p className="subtitle">
              Administre sus horarios y gestione las citas de sus pacientes.
            </p>
            <p className="especialidad-line">
              <strong>Especialidad:</strong> {medico.especialidad || "No especificada"}
              {medico.usuario?.correo && (
                <span className="correo"> · {medico.usuario.correo}</span>
              )}
            </p>
          </section>

          {/* Grid de tarjetas funcionales */}
          <section className="cards-grid">
            <article 
              className="card card-disponibilidad" 
              onClick={() => handleNavigate("/medico/disponibilidad")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleNavigate("/medico/disponibilidad")}
            >
              <img src="../../../public/disponibilidad.png" alt="Disponibilidad" />
              <h3>Disponibilidad</h3>
              <p>Configure sus horarios de atención.</p>
            </article>

            <article 
              className="card card-citas" 
              onClick={() => handleNavigate("/medico/citas")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleNavigate("/medico/citas")}
            >
              <img src="../../../public/cita-medica.png" alt="Citas" />
              <h3>Citas Asignadas</h3>
              <p>Consulte las citas programadas con sus pacientes.</p>
            </article>

            <article 
              className="card card-historial" 
              onClick={() => handleNavigate("/medico/historial")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleNavigate("/medico/historial")}
            >
              <img src="../../../public/informe-medico.png" alt="Historial" />
              <h3>Historial Médico</h3>
              <p>Registre diagnósticos y observaciones clínicas.</p>
            </article>

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

          {/* Footer */}
          <footer className="footer">
            © 2025 HealPoint – Portal Médico.
          </footer>
        </main>
      </div>
    </div>
  );
}