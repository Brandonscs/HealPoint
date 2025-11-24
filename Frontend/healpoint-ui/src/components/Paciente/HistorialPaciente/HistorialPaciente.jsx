import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import historialService from "../../../services/historialService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./HistorialPaciente.scss";
import Swal from "sweetalert2";

export default function HistorialPaciente() {
  const navigate = useNavigate();

  // Estados principales
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Datos del paciente logueado
  const [pacienteLogueado, setPacienteLogueado] = useState(null);

  // Modal de detalles (solo lectura)
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [historialDetalle, setHistorialDetalle] = useState(null);

  // ================================
  // CARGAR DATOS INICIALES
  // ================================
  useEffect(() => {
    cargarPacienteLogueado();
    cargarHistorialesPaciente();
  }, []);

  const cargarPacienteLogueado = () => {
    try {
      const pacienteData = JSON.parse(
        localStorage.getItem("pacienteLogueado")
      );
      if (pacienteData) {
        setPacienteLogueado(pacienteData);
      } else {
        navigate("/login");
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "No se pudieron cargar los datos del paciente.",
        confirmButtonColor: "#d33",
      });
      navigate("/login");
    }
  };

  const cargarHistorialesPaciente = async () => {
    try {
      setLoading(true);
      setError("");
      const pacienteData = JSON.parse(
        localStorage.getItem("pacienteLogueado")
      );

      if (!pacienteData?.idPaciente) {
        setError("No se pudo identificar el ID del paciente.");
        setLoading(false);
        return;
      }

      // Obtener todos los historiales
      const response = await historialService.getHistoriales();

      if (Array.isArray(response.data)) {
        // Filtrar solo los historiales donde el idPaciente coincida con el del paciente logueado
        const historialesFiltrados = response.data.filter(
          (historial) =>
            historial.cita?.paciente?.idPaciente === pacienteData.idPaciente
        );

        // Ordenar por fecha más reciente
        const ordenados = historialesFiltrados.sort(
          (a, b) =>
            new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
        );

        setHistoriales(ordenados);
      } else {
        setHistoriales([]);
      }
    } catch (err) {
      console.error("Error al cargar historiales:", err);
      setError("Error al cargar los historiales médicos.");
      setHistoriales([]);

      Swal.fire({
        icon: "error",
        title: "Error al cargar historiales",
        text: "No se pudieron cargar los historiales médicos. Por favor, intente nuevamente.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("pacienteLogueado");
    navigate("/");
  }, [navigate]);

  // ================================
  // FILTRADO Y BÚSQUEDA
  // ================================
  const historialesFiltrados = historiales.filter((historial) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (historial.diagnostico?.toLowerCase() || "").includes(searchLower) ||
      (historial.tratamiento?.toLowerCase() || "").includes(searchLower) ||
      (historial.cita?.medico?.usuario?.nombre?.toLowerCase() || "").includes(searchLower) ||
      (historial.cita?.medico?.usuario?.apellido?.toLowerCase() || "").includes(searchLower)
    );
  });

  // Paginación
  const totalPages = Math.ceil(historialesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const historialesPaginados = historialesFiltrados.slice(startIndex, endIndex);

  const cambiarPagina = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ================================
  // MODAL DETALLES
  // ================================
  const abrirDetalles = (historial) => {
    setHistorialDetalle(historial);
    setShowDetallesModal(true);
  };

  const cerrarDetalles = () => {
    setShowDetallesModal(false);
    setHistorialDetalle(null);
  };

  // ================================
  // FUNCIONES AUXILIARES
  // ================================
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "N/A";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getNombreMedico = (cita) => {
    if (!cita?.medico?.usuario) return "N/A";
    const { nombre, apellido } = cita.medico.usuario;
    return `Dr. ${nombre || ""} ${apellido || ""}`.trim() || "N/A";
  };

  const getEspecialidad = (cita) => {
    return cita?.medico?.especialidad || "No especificada";
  };

  // ================================
  // RENDER
  // ================================
  if (loading) {
    return (
      <div className="historial-paciente-root">
        <Sidebar usuario={pacienteLogueado?.usuario} onLogout={handleLogout} />
        <div className="main-area">
          <Navbar paciente={pacienteLogueado} onLogout={handleLogout} />
          <main className="content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando mis historiales...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-paciente-root">
      <img src="/icons/stetho.svg" className="bg-icon i1" alt="" />
      <img src="/icons/microscope.svg" className="bg-icon i2" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={pacienteLogueado?.usuario} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar paciente={pacienteLogueado} onLogout={handleLogout} />

        <main className="content">
          <div className="historial-card">
            <div className="card-header">
              <div className="header-content">
                <h1 className="title">Mis Historiales Médicos</h1>
                <p className="subtitle">
                  Consulte todos los historiales médicos de sus citas registradas
                </p>
                {pacienteLogueado && (
                  <p className="paciente-info">
                    <strong>Paciente:</strong> {pacienteLogueado.usuario?.nombre}{" "}
                    {pacienteLogueado.usuario?.apellido}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠️</span>
                {error}
                <button onClick={() => setError("")} className="alert-close">
                  ✕
                </button>
              </div>
            )}

            <div className="search-bar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por médico, diagnóstico o tratamiento..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Médico</th>
                    <th>Especialidad</th>
                    <th>Fecha</th>
                    <th>Diagnóstico</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historialesPaginados.length > 0 ? (
                    historialesPaginados.map((historial) => (
                      <tr key={historial.id_historial}>
                        <td className="td-medico">
                          {getNombreMedico(historial.cita)}
                        </td>
                        <td className="td-especialidad">
                          {getEspecialidad(historial.cita)}
                        </td>
                        <td className="td-fecha">
                          {formatearFecha(historial.fechaRegistro)}
                        </td>
                        <td className="td-diagnostico">
                          {historial.diagnostico?.length > 50
                            ? `${historial.diagnostico.substring(0, 50)}...`
                            : historial.diagnostico || "N/A"}
                        </td>
                        <td className="td-actions">
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-ver"
                              onClick={() => abrirDetalles(historial)}
                              title="Ver detalles"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">
                        {searchTerm
                          ? "No se encontraron historiales con el criterio de búsqueda"
                          : "No hay historiales médicos registrados"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
                      className={`page-number ${
                        currentPage === pageNum ? "active" : ""
                      }`}
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
                  Mostrando {startIndex + 1}-{Math.min(endIndex, historialesFiltrados.length)}{" "}
                  de {historialesFiltrados.length} historiales
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {showDetallesModal && historialDetalle && (
        <div className="modal-overlay" onClick={cerrarDetalles}>
          <div
            className="modal-content modal-detalles"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Detalles del Historial Médico</h2>
              <button className="modal-close" onClick={cerrarDetalles}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detalle-row">
                <span className="detalle-label">Médico:</span>
                <span className="detalle-value">
                  {getNombreMedico(historialDetalle.cita)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Especialidad:</span>
                <span className="detalle-value">
                  {getEspecialidad(historialDetalle.cita)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Teléfono del Médico:</span>
                <span className="detalle-value">
                  {historialDetalle.cita?.medico?.usuario?.telefono || "N/A"}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Correo del Médico:</span>
                <span className="detalle-value">
                  {historialDetalle.cita?.medico?.usuario?.correo || "N/A"}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Fecha de Registro:</span>
                <span className="detalle-value">
                  {formatearFecha(historialDetalle.fechaRegistro)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Fecha de la Cita:</span>
                <span className="detalle-value">
                  {formatearFecha(historialDetalle.cita?.fecha)}
                </span>
              </div>

              <div className="detalle-row detalle-full">
                <span className="detalle-label">Diagnóstico:</span>
                <div className="detalle-texto">
                  {historialDetalle.diagnostico || "Sin diagnóstico"}
                </div>
              </div>

              <div className="detalle-row detalle-full">
                <span className="detalle-label">Tratamiento:</span>
                <div className="detalle-texto">
                  {historialDetalle.tratamiento || "Sin tratamiento"}
                </div>
              </div>

              {historialDetalle.observaciones && (
                <div className="detalle-row detalle-full">
                  <span className="detalle-label">Observaciones:</span>
                  <div className="detalle-texto">
                    {historialDetalle.observaciones}
                  </div>
                </div>
              )}
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