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
      { icon: "🏠", label: "Inicio", path: "/dashboard-paciente", locked: false },
      { icon: "📅", label: "Agendar Cita", path: "/paciente/agendar", locked: false },
      { icon: "🕐", label: "Mis Citas", path: "/paciente/citas", locked: false },
      { icon: "🩺", label: "Historial Médico", path: "/paciente/historial", locked: false },
      { icon: "⚙️", label: "Configuración", path: "/paciente/configuracion", locked: true },
    ],
    Medico: [
      { icon: "🏠", label: "Inicio", path: "/dashboard-medico", locked: false },
      { icon: "🕒", label: "Mi Disponibilidad", path: "/medico/disponibilidad", locked: false },
      { icon: "📋", label: "Mis Citas", path: "/medico/citas", locked: false },
      { icon: "🩻", label: "Historiales Médicos", path: "/medico/historial", locked: false },
      { icon: "⚙️", label: "Configuración", path: "/medico/configuracion", locked: true },
    ],
    Administrador: [
      { icon: "🏠", label: "Inicio", path: "/dashboard-admin", locked: false },
      { icon: "👥", label: "Usuarios", path: "/admin/usuarios", locked: false },
      { icon: "🧩", label: "Roles", path: "/admin/roles", locked: false },
      { icon: "⚙️", label: "Estados", path: "/admin/estados", locked: false },
      { icon: "📆", label: "Agenda Global", path: "/admin/agenda", locked: false },
      { icon: "🕵️", label: "Monitoría", path: "/admin/monitoreo", locked: false },
    ],
  }), []);

  // Determinar rol del usuario
  const rol = useMemo(() => {
    return usuario?.rol?.nombreRol || "Paciente";
  }, [usuario]);

  // Obtener menú según rol
  const sidebarMenu = useMemo(() => {
    return menus[rol] || menus.Paciente;
  }, [menus, rol]);

  // Verificar si una ruta está activa
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Manejar navegación
  const handleNavigate = (path, locked) => {
    // Si está bloqueado, no hacer nada
    if (locked) {
      return;
    }
    navigate(path);
  };

  // Toggle collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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

      {/* Encabezado con Logo */}
      <div className="sidebar-header">
        <div className="logo-container">
          <img 
            src="/icons/logo2.png" 
            alt="HealPoint Logo" 
            className="logo-image"
          />
          {!isCollapsed && (
            <div className="brand-info">
              <h2 className="brand">HealPoint</h2>
              <p className="tagline">Sistema Médico</p>
            </div>
          )}
        </div>
      </div>

      <hr className="divider" />

      {/* Menú de navegación */}
      <nav className="menu">
        {sidebarMenu.map((item, index) => (
          <button
            key={index}
            className={`menu-item ${isActiveRoute(item.path) ? 'active' : ''} ${item.locked ? 'locked' : ''}`}
            onClick={() => handleNavigate(item.path, item.locked)}
            title={item.locked ? `${item.label} (Bloqueado)` : item.label}
            aria-label={item.label}
            disabled={item.locked}
          >
            <span className="icon">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="label">{item.label}</span>
                {item.locked && (
                  <span className="lock-icon">🔒</span>
                )}
                {isActiveRoute(item.path) && !item.locked && (
                  <span className="active-indicator">●</span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Footer con Cerrar Sesión */}
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