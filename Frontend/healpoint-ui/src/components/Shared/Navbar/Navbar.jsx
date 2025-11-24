import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.scss";

const Navbar = ({ medico, paciente, admin, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // -------------------------------------------------------------------
  // OBTENER DATOS DEL USUARIO (admin, medico o paciente)
  // -------------------------------------------------------------------
  const userData = useMemo(() => {
    // Caso 1: Admin (estructura directa)
    if (admin) {
      return {
        nombre: `${admin.nombre} ${admin.apellido}`,
        nombreCorto: admin.nombre,
        rol: admin.rol?.nombreRol || "Administrador",
        tipo: "admin",
      };
    }

    // Caso 2: Médico (tiene usuario anidado)
    if (medico) {
      return {
        nombre: `Dr. ${medico.usuario?.nombre} ${medico.usuario?.apellido}`,
        nombreCorto: medico.usuario?.nombre,
        rol: "Médico",
        tipo: "medico",
      };
    }

    // Caso 3: Paciente (estructura directa, igual que admin)
    if (paciente) {
      return {
        nombre: `${paciente.nombre} ${paciente.apellido}`,
        nombreCorto: paciente.nombre,
        rol: paciente.rol?.nombreRol || "Paciente",
        tipo: "paciente",
      };
    }

    // Default
    return {
      nombre: "Usuario",
      nombreCorto: "Usuario",
      rol: "Invitado",
      tipo: "guest",
    };
  }, [medico, paciente, admin]);

  const getInitial = () =>
    userData.nombreCorto?.charAt(0)?.toUpperCase() || "U";

  // -------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------

  const handleLogout = () => {
    onLogout?.();
    localStorage.clear();
    navigate("/");
  };

  // -------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------
  return (
    <nav className="navbar-hp">
      {/* IZQUIERDA: LOGO Y HEALPOINT ============================== */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <img src="/icons/logo2.png" alt="HealPoint Logo" className="logo-img" />
          <span className="logo-text">HealPoint</span>
        </div>
      </div>

      {/* DERECHA: PERFIL CON INICIAL, NOMBRE Y ROL ================ */}
      <div className="navbar-right">
        <div className="navbar-profile">
          <div className="profile-avatar">{getInitial()}</div>

          <div className="profile-info">
            <span className="profile-name">{userData.nombreCorto}</span>
            <span className="profile-role">{userData.rol}</span>
          </div>

          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;