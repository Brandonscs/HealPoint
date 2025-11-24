import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.scss";

export default function Sidebar({ usuario, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Menús dinámicos por rol
  const menus = useMemo(() => ({
    Paciente: [
      { icon: "🏠", label: "Inicio", path: "/dashboard-paciente" },
      { icon: "📅", label: "Mis Citas", path: "/paciente/citas" },
      { icon: "🩺", label: "Historial Médico", path: "/paciente/historial" },
      { icon: "⚙️", label: "Configuración", path: "/paciente/configuracion" },
    ],
    Medico: [
      { icon: "🏠", label: "Inicio", path: "/dashboard-medico" },
      { icon: "🕒", label: "Mi Disponibilidad", path: "/medico/disponibilidad" },
      { icon: "📋", label: "Mis Citas", path: "/medico/citas" },
      { icon: "🩻", label: "Historiales Médicos", path: "/medico/historial" },
      { icon: "⚙️", label: "Configuración", path: "/medico/configuracion" },
    ],
    Administrador: [
      { icon: "🏠", label: "Inicio", path: "/dashboard-admin" },
      { icon: "👥", label: "Usuarios", path: "/admin/usuarios" },
      { icon: "🧩", label: "Roles", path: "/admin/roles" },
      { icon: "⚙️", label: "Estados", path: "/admin/estados" },
      { icon: "📆", label: "Agenda Global", path: "/admin/agenda" },
      { icon: "🕵️", label: "Monitoría", path: "/admin/monitoreo" },
    ],
  }), []);

  // Determinar rol del usuario
  const rol = useMemo(() => {
    return usuario?.rol?.nombreRol || "Medico";
  }, [usuario]);

  // Obtener menú según rol
  const sidebarMenu = useMemo(() => {
    return menus[rol] || menus.Medico;
  }, [menus, rol]);

  // Verificar si una ruta está activa
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Manejar navegación
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Toggle collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Obtener color del rol
  const getRoleColor = () => {
    switch (rol) {
      case "Paciente":
        return "#4caf50";
      case "Medico":
        return "#2196f3";
      case "Administrador":
        return "#ff9800";
      default:
        return "#00b4c6";
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Botón de colapsar */}
      <button 
        className="collapse-btn" 
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {isCollapsed ? "→" : "←"}
      </button>

      {/* Encabezado */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">⚕️</div>
          {!isCollapsed && (
            <div className="brand-info">
              <h2 className="brand">HealPoint</h2>
              <p className="tagline">Sistema Médico</p>
            </div>
          )}
        </div>
      </div>

      <hr className="divider" />

      {/* Información del usuario */}
      {!isCollapsed && usuario && (
        <div className="user-info">
          <div className="user-avatar" style={{ background: getRoleColor() }}>
            {usuario.nombre?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-details">
            <span className="user-name">
              {usuario.nombre} {usuario.apellido}
            </span>
            <span className="user-role" style={{ background: getRoleColor() }}>
              {rol}
            </span>
          </div>
        </div>
      )}

      {/* Menú de navegación */}
      <nav className="menu">
        {sidebarMenu.map((item, index) => (
          <button
            key={index}
            className={`menu-item ${isActiveRoute(item.path) ? 'active' : ''}`}
            onClick={() => handleNavigate(item.path)}
            title={item.label}
            aria-label={item.label}
          >
            <span className="icon">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="label">{item.label}</span>
                {isActiveRoute(item.path) && (
                  <span className="active-indicator">●</span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button 
          className="logout-btn" 
          onClick={onLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>

        {!isCollapsed && (
          <small className="copy">© 2025 HealPoint</small>
        )}
      </div>
    </aside>
  );
}