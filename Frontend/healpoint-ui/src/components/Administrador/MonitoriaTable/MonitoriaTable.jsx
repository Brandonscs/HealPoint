import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import usuarioService from "../../../services/usuarioService";
import monitoriaService from "../../../services/monitoriaService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./MonitoriaTable.scss";

export default function MonitoriaTable() {
  const navigate = useNavigate();
  
  // Estado del administrador
  const [admin, setAdmin] = useState(null);
  
  // Estados principales
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados de búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [accionFilter, setAccionFilter] = useState("Todas");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Estados de modal de detalles
  const [showDetalles, setShowDetalles] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

        if (!usuarioLocal || !usuarioLocal.idUsuario) {
          navigate("/login");
          return;
        }

        // Cargar admin
        const adminResponse = await usuarioService.getUsuarioById(
          usuarioLocal.idUsuario
        );
        setAdmin(adminResponse.data);

        // Cargar registros
        await cargarRegistros();
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
        
        Swal.fire({
          icon: "error",
          title: "Error al cargar",
          text: "No se pudieron cargar los datos iniciales",
          confirmButtonColor: "#00b4c6",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await monitoriaService.getMonitorias();
      
      // Verificar si la respuesta es un array o un string
      if (typeof response.data === 'string') {
        setRegistros([]);
        setError("");
      } else if (Array.isArray(response.data)) {
        // Ordenar por fecha más reciente primero
        const registrosOrdenados = response.data.sort((a, b) => 
          new Date(b.fecha) - new Date(a.fecha)
        );
        setRegistros(registrosOrdenados);
      } else {
        setRegistros([]);
      }
    } catch (err) {
      console.error("Error al cargar registros:", err);
      setError("Error al cargar los registros de monitoría.");
      setRegistros([]);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los registros de monitoría",
        confirmButtonColor: "#00b4c6",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Está seguro de que desea salir?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00b4c6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("usuario");
        localStorage.removeItem("adminLogueado");
        navigate("/login");
      }
    });
  }, [navigate]);

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================
  const getIconoAccion = (accion) => {
    if (!accion) return { icon: "⚪", color: "#757575", text: "N/A" };
    
    const accionUpper = accion.toUpperCase();
    switch (accionUpper) {
      case "INSERT":
      case "CREAR":
      case "CREATE":
        return { icon: "🟢", color: "#2e7d32", text: "Crear" };
      case "UPDATE":
      case "ACTUALIZAR":
        return { icon: "🟡", color: "#f57c00", text: "Actualizar" };
      case "DELETE":
      case "ELIMINAR":
        return { icon: "🔴", color: "#d32f2f", text: "Eliminar" };
      case "SELECT":
      case "CONSULTAR":
        return { icon: "🔵", color: "#1976d2", text: "Consultar" };
      case "ACTIVATE":
      case "ACTIVAR":
        return { icon: "🟢", color: "#2e7d32", text: "Activar" };
      default:
        return { icon: "⚪", color: "#757575", text: accion };
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "N/A";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getNombreUsuario = (usuarioResponsable) => {
    if (!usuarioResponsable) return "Sistema";
    const nombre = usuarioResponsable.nombre || "";
    const apellido = usuarioResponsable.apellido || "";
    return `${nombre} ${apellido}`.trim() || "Sistema";
  };

  const getRolUsuario = (usuarioResponsable) => {
    if (!usuarioResponsable) return "Sistema";
    if (usuarioResponsable.rol?.nombreRol) {
      return usuarioResponsable.rol.nombreRol;
    }
    return "Usuario";
  };

  // ========================================
  // FILTRADO Y BÚSQUEDA
  // ========================================
  const registrosFiltrados = useMemo(() => {
    return registros.filter((registro) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        (registro.tablaAfectada?.toLowerCase() || "").includes(searchLower) ||
        (registro.accion?.toLowerCase() || "").includes(searchLower) ||
        getNombreUsuario(registro.usuarioResponsable).toLowerCase().includes(searchLower) ||
        (registro.descripcion?.toLowerCase() || "").includes(searchLower);

      // Filtro por tipo de acción
      const matchAccion =
        accionFilter === "Todas" ||
        registro.accion?.toUpperCase() === accionFilter;

      // Filtro por rango de fechas
      let matchFecha = true;
      if (fechaDesde || fechaHasta) {
        const fechaRegistro = new Date(registro.fecha);
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          desde.setHours(0, 0, 0, 0);
          matchFecha = matchFecha && fechaRegistro >= desde;
        }
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          matchFecha = matchFecha && fechaRegistro <= hasta;
        }
      }

      return matchSearch && matchAccion && matchFecha;
    });
  }, [registros, searchTerm, accionFilter, fechaDesde, fechaHasta]);

  // ========================================
  // PAGINACIÓN
  // ========================================
  const totalPages = Math.ceil(registrosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const registrosPaginados = registrosFiltrados.slice(startIndex, endIndex);

  const cambiarPagina = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, accionFilter, fechaDesde, fechaHasta]);

  // ========================================
  // MANEJO DE DETALLES
  // ========================================
  const abrirDetalles = (registro) => {
    setRegistroSeleccionado(registro);
    setShowDetalles(true);
  };

  const cerrarDetalles = () => {
    setShowDetalles(false);
    setRegistroSeleccionado(null);
  };

  // ========================================
  // LIMPIAR FILTROS
  // ========================================
  const limpiarFiltros = () => {
    setSearchTerm("");
    setAccionFilter("Todas");
    setFechaDesde("");
    setFechaHasta("");
    setCurrentPage(1);

    Swal.fire({
      icon: "success",
      title: "Filtros limpiados",
      text: "Se han restablecido todos los filtros",
      confirmButtonColor: "#00b4c6",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // ========================================
  // EXPORTAR DATOS
  // ========================================
  const exportarCSV = () => {
    if (registrosFiltrados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin datos",
        text: "No hay registros para exportar",
        confirmButtonColor: "#00b4c6",
      });
      return;
    }

    const headers = ["ID", "Tabla", "Acción", "Fecha", "Usuario", "Descripción"];
    const rows = registrosFiltrados.map(r => [
      r.idMonitoria || "",
      r.tablaAfectada || "",
      r.accion || "",
      formatearFecha(r.fecha),
      getNombreUsuario(r.usuarioResponsable),
      r.descripcion || ""
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `monitoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    Swal.fire({
      icon: "success",
      title: "¡Exportado!",
      text: `Se han exportado ${registrosFiltrados.length} registros`,
      confirmButtonColor: "#00b4c6",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <div className="dashboard-admin-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando registros de monitoría...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="dashboard-admin-root">
      <Sidebar usuario={admin} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar admin={admin} onLogout={handleLogout} />

        <main className="content">
          <div className="monitoria-container">
            <div className="monitoria-card">
              {/* Encabezado */}
              <div className="card-header">
                <div className="header-content">
                  <h1 className="title">Registro de Monitoría del Sistema</h1>
                  <p className="subtitle">
                    Auditoría y trazabilidad de todas las operaciones
                  </p>
                </div>
                <button 
                  className="btn-exportar" 
                  onClick={exportarCSV} 
                  title="Exportar a CSV"
                  disabled={registrosFiltrados.length === 0}
                >
                  📥 Exportar
                </button>
              </div>

              {/* Barra de acciones y filtros */}
              <div className="actions-bar">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Buscar por usuario, tabla o acción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>

                <div className="filter-group">
                  <select
                    value={accionFilter}
                    onChange={(e) => setAccionFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="Todas">Todas las acciones</option>
                    <option value="INSERT">🟢 Crear (INSERT)</option>
                    <option value="UPDATE">🟡 Actualizar (UPDATE)</option>
                    <option value="DELETE">🔴 Eliminar (DELETE)</option>
                    <option value="ACTIVATE">🟢 Activar (ACTIVATE)</option>
                  </select>

                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="date-input"
                    placeholder="Desde"
                    title="Fecha desde"
                  />

                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="date-input"
                    placeholder="Hasta"
                    title="Fecha hasta"
                  />

                  <button
                    className="btn-limpiar"
                    onClick={limpiarFiltros}
                    title="Limpiar filtros"
                  >
                    🗑️
                  </button>

                  <button
                    className="btn-actualizar"
                    onClick={cargarRegistros}
                    title="Actualizar registros"
                  >
                    🔄 Actualizar
                  </button>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="stats-bar">
                <div className="stat-item">
                  <span className="stat-icon">📊</span>
                  <div className="stat-info">
                    <span className="stat-value">{registrosFiltrados.length}</span>
                    <span className="stat-label">Registros</span>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-icon">🟢</span>
                  <div className="stat-info">
                    <span className="stat-value">
                      {registrosFiltrados.filter(r => r.accion?.toUpperCase() === "INSERT" || r.accion?.toUpperCase() === "CREATE").length}
                    </span>
                    <span className="stat-label">Creaciones</span>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-icon">🟡</span>
                  <div className="stat-info">
                    <span className="stat-value">
                      {registrosFiltrados.filter(r => r.accion?.toUpperCase() === "UPDATE").length}
                    </span>
                    <span className="stat-label">Actualizaciones</span>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-icon">🔴</span>
                  <div className="stat-info">
                    <span className="stat-value">
                      {registrosFiltrados.filter(r => r.accion?.toUpperCase() === "DELETE").length}
                    </span>
                    <span className="stat-label">Eliminaciones</span>
                  </div>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="alert alert-error">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              {/* Tabla */}
              <div className="table-wrapper">
                <table className="monitoria-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Acción</th>
                      <th>Tabla Afectada</th>
                      <th>Fecha y Hora</th>
                      <th>Usuario Responsable</th>
                      <th>Descripción</th>
                      <th>Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosPaginados.length > 0 ? (
                      registrosPaginados.map((registro) => {
                        const accionInfo = getIconoAccion(registro.accion);
                        return (
                          <tr key={registro.idMonitoria} className="table-row">
                            <td className="td-id">#{registro.idMonitoria}</td>
                            <td className="td-accion">
                              <span
                                className="accion-badge"
                                style={{ borderColor: accionInfo.color }}
                              >
                                <span className="accion-icon">{accionInfo.icon}</span>
                                <span style={{ color: accionInfo.color }}>
                                  {accionInfo.text}
                                </span>
                              </span>
                            </td>
                            <td className="td-tabla">
                              <span className="tabla-name">{registro.tablaAfectada || "N/A"}</span>
                            </td>
                            <td className="td-fecha">
                              {formatearFecha(registro.fecha)}
                            </td>
                            <td className="td-usuario">
                              <div className="usuario-info">
                                <span className="usuario-nombre">
                                  {getNombreUsuario(registro.usuarioResponsable)}
                                </span>
                                <span className="usuario-rol">
                                  {getRolUsuario(registro.usuarioResponsable)}
                                </span>
                              </div>
                            </td>
                            <td className="td-descripcion">
                              <span className="descripcion-text">
                                {registro.descripcion?.length > 60
                                  ? `${registro.descripcion.substring(0, 60)}...`
                                  : (registro.descripcion || "Sin descripción")}
                              </span>
                            </td>
                            <td className="td-actions">
                              <button
                                className="btn-ver-detalles"
                                onClick={() => abrirDetalles(registro)}
                                title="Ver detalles completos"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data">
                          {searchTerm || accionFilter !== "Todas" || fechaDesde || fechaHasta
                            ? "No se encontraron registros con los filtros aplicados"
                            : "No hay registros de monitoría disponibles"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => cambiarPagina(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ⏪
                  </button>

                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    return (
                      <button
                        key={`page-${pageNum}`}
                        className={`page-number ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => cambiarPagina(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    className="page-btn"
                    onClick={() => cambiarPagina(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ⏩
                  </button>

                  <span className="pagination-info">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, registrosFiltrados.length)} de{" "}
                    {registrosFiltrados.length} registros
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Detalles */}
      {showDetalles && registroSeleccionado && (
        <div className="modal-overlay" onClick={cerrarDetalles}>
          <div className="modal-content modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Registro de Monitoría</h2>
              <button className="modal-close" onClick={cerrarDetalles}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detalle-row">
                <span className="detalle-label">ID de Registro:</span>
                <span className="detalle-value">#{registroSeleccionado.idMonitoria}</span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Acción Realizada:</span>
                <span className="detalle-value">
                  <span
                    className="accion-badge-large"
                    style={{
                      borderColor: getIconoAccion(registroSeleccionado.accion).color,
                      color: getIconoAccion(registroSeleccionado.accion).color
                    }}
                  >
                    {getIconoAccion(registroSeleccionado.accion).icon}{" "}
                    {registroSeleccionado.accion || "N/A"}
                  </span>
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Tabla Afectada:</span>
                <span className="detalle-value tabla-badge">
                  {registroSeleccionado.tablaAfectada || "N/A"}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Fecha y Hora:</span>
                <span className="detalle-value">
                  {formatearFecha(registroSeleccionado.fecha)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Usuario Responsable:</span>
                <span className="detalle-value">
                  <div className="usuario-detalle">
                    <span className="usuario-nombre-detalle">
                      {getNombreUsuario(registroSeleccionado.usuarioResponsable)}
                    </span>
                    <span className="usuario-rol-detalle">
                      {getRolUsuario(registroSeleccionado.usuarioResponsable)}
                    </span>
                  </div>
                </span>
              </div>

              <div className="detalle-row detalle-descripcion-row">
                <span className="detalle-label">Descripción Completa:</span>
                <div className="detalle-descripcion">
                  {registroSeleccionado.descripcion || "Sin descripción disponible"}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cerrar-modal" onClick={cerrarDetalles}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}