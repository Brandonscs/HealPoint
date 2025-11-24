import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.scss";

const Navbar = ({ medico, paciente, admin, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar datos del usuario según el rol
  const userData = useMemo(() => {
    if (medico) {
      return {
        nombre: `Dr. ${medico.usuario?.nombre} ${medico.usuario?.apellido}`,
        nombreCorto: medico.usuario?.nombre,
        rol: "Médico",
        especialidad: medico.especialidad,
        correo: medico.usuario?.correo,
        tipo: "medico"
      };
    }
    if (paciente) {
      return {
        nombre: `${paciente.usuario?.nombre} ${paciente.usuario?.apellido}`,
        nombreCorto: paciente.usuario?.nombre,
        rol: "Paciente",
        correo: paciente.usuario?.correo,
        tipo: "paciente"
      };
    }
    if (admin) {
      return {
        nombre: `${admin.usuario?.nombre} ${admin.usuario?.apellido}`,
        nombreCorto: admin.usuario?.nombre,
        rol: "Administrador",
        correo: admin.usuario?.correo,
        tipo: "admin"
      };
    }
    return {
      nombre: "Usuario",
      nombreCorto: "Usuario",
      rol: "Invitado",
      tipo: "guest"
    };
  }, [medico, paciente, admin]);

  // Obtener inicial del usuario
  const getInitial = () => {
    if (!userData.nombreCorto) return "U";
    return userData.nombreCorto.charAt(0).toUpperCase();
  };

  // Navegación según el rol
  const navLinks = useMemo(() => {
    switch (userData.tipo) {
      case "medico":
        return [
          { label: "Inicio", path: "/medico/dashboard", icon: "🏠" },
          { label: "Disponibilidad", path: "/medico/disponibilidad", icon: "🕒" },
          { label: "Citas", path: "/medico/citas", icon: "📅" },
          { label: "Historial", path: "/medico/historial", icon: "📋" }
        ];
      case "paciente":
        return [
          { label: "Inicio", path: "/paciente/dashboard", icon: "🏠" },
          { label: "Mis Citas", path: "/paciente/citas", icon: "📅" },
          { label: "Agendar", path: "/paciente/agendar", icon: "➕" },
          { label: "Historial", path: "/paciente/historial", icon: "📋" }
        ];
      case "admin":
        return [
          { label: "Inicio", path: "/admin/dashboard", icon: "🏠" },
          { label: "Usuarios", path: "/admin/usuarios", icon: "👥" },
          { label: "Médicos", path: "/admin/medicos", icon: "⚕️" },
          { label: "Agenda", path: "/admin/agenda", icon: "📆" }
        ];
      default:
        return [
          { label: "Inicio", path: "/", icon: "🏠" },
          { label: "Ayuda", path: "/ayuda", icon: "❓" },
          { label: "Contacto", path: "/contacto", icon: "📧" }
        ];
    }
  }, [userData.tipo]);

  // Verificar si una ruta está activa
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Manejar navegación
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Manejar logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <nav className="navbar-hp">
      {/* Logo */}
      <div 
        className="navbar-logo" 
        onClick={() => handleNavigate("/")}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleNavigate("/")}
      >
        <span className="logo-icon">⚕️</span>
        <span className="logo-text">HealPoint</span>
      </div>

      {/* Enlaces de navegación centrales */}
      <div className="navbar-links">
        {navLinks.map((link, index) => (
          <button
            key={index}
            className={`nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
            onClick={() => handleNavigate(link.path)}
            title={link.label}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Perfil del usuario */}
      <div className="navbar-profile">
        <div className="profile-avatar" title={userData.nombre}>
          {getInitial()}
        </div>

        <div className="profile-info">
          <span className="profile-name">{userData.nombreCorto}</span>
          <span className="profile-role">{userData.rol}</span>
        </div>

        <button 
          className="logout-btn" 
          onClick={handleLogout} 
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;