import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usuarioService from "../../services/usuarioService";
import "./Administrador.scss";

import Navbar from "../Shared/Navbar/Navbar";
import Sidebar from "../Shared/Sidebar/Sidebar";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const cargarDatosAdmin = async () => {
      try {
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

        // Validación correcta usando idUsuario
        if (!usuarioLocal || !usuarioLocal.idUsuario) {
          navigate("/login");
          return;
        }

        // Obtener la info completa del admin
        const response = await usuarioService.getUsuarioById(
          usuarioLocal.idUsuario
        );

        setAdmin(response.data);
        localStorage.setItem("adminLogueado", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error al cargar datos del administrador:", error);
        setErrorMsg(
          "Error al cargar los datos del administrador. Por favor, intente nuevamente."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatosAdmin();
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("adminLogueado");
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
          <p className="loading-text">Cargando datos del administrador...</p>
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

  // Si admin todavía no cargó (evita errores)
  if (!admin) return null;

  return (
    <div className="dashboard-admin-root">
      <img src="/icons/gear.svg" className="bg-icon i1" alt="" />
      <img src="/icons/users.svg" className="bg-icon i2" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={admin} onLogout={handleLogout} tipo="admin" />

      <div className="main-area">
        <Navbar admin={admin} onLogout={handleLogout} />

        <main className="content">
          <section className="hero">
            <h1>
              Bienvenido, {admin.nombre} {admin.apellido}
            </h1>
            <p className="subtitle">
              Supervise la información general y mantenga la configuración del sistema actualizada.
            </p>
          </section>

          <section className="cards-grid">
            <article
              className="card"
              onClick={() => handleNavigate("/admin/usuarios")}
              role="button"
            >
              <img src="../../../public/gestion.png" alt="Usuarios" />
              <h3>Gestión de Usuarios</h3>
              <p>Cree, edite o desactive usuarios del sistema.</p>
            </article>

            <article
              className="card"
              onClick={() => handleNavigate("/admin/roles")}
              role="button"
            >
              <img src="../../../public/gestion-de-equipos.png" alt="Roles" />
              <h3>Gestión de Roles</h3>
              <p>Administre los roles y permisos del sistema.</p>
            </article>

            <article
              className="card"
              onClick={() => handleNavigate("/admin/estados")}
              role="button"
            >
              <img src="../../../public/gestion-de-riesgos.png" alt="Estados" />
              <h3>Gestión de Estados</h3>
              <p>Actualice los estados de las entidades del sistema.</p>
            </article>

            <article
              className="card"
              onClick={() => handleNavigate("/admin/agenda")}
              role="button"
            >
              <img src="../../../public/agenda.png" alt="Agenda Global" />
              <h3>Agenda Global</h3>
              <p>Visualice todas las citas registradas en el sistema.</p>
            </article>

            <article
              className="card"
              onClick={() => handleNavigate("/admin/monitoria")}
              role="button"
            >
              <img src="../../../public/supervision.png" alt="Monitoría" />
              <h3>Monitoría del Sistema</h3>
              <p>Revise los eventos y acciones ejecutadas por los usuarios.</p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
