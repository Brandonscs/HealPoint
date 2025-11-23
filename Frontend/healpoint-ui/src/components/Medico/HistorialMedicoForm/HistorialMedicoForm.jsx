import React, { useState, useEffect } from "react";
import historialService from "../../../services/historialService";
import "./HistorialMedicoForm.scss";

export default function HistorialMedicoForm() {
  // Estados principales
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Datos del médico logueado
  const [medicoLogueado, setMedicoLogueado] = useState(null);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' o 'edit'
  const [selectedHistorial, setSelectedHistorial] = useState(null);

  // Modal de detalles (solo lectura)
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [historialDetalle, setHistorialDetalle] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    idCita: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
    fechaRegistro: new Date().toISOString().split('T')[0]
  });

  const [formErrors, setFormErrors] = useState({});

  // Confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [historialAEliminar, setHistorialAEliminar] = useState(null);

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  useEffect(() => {
    cargarMedicoLogueado();
    cargarHistoriales();
  }, []);

  const cargarMedicoLogueado = () => {
    try {
      const medicoData = JSON.parse(localStorage.getItem("medicoLogueado"));
      if (medicoData) {
        setMedicoLogueado(medicoData);
      }
    } catch (err) {
      console.error("Error al cargar médico:", err);
    }
  };

  const cargarHistoriales = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await historialService.getHistoriales();

      if (Array.isArray(response.data)) {
        // Ordenar por fecha más reciente
        const ordenados = response.data.sort((a, b) => 
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
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FILTRADO Y BÚSQUEDA
  // ========================================
  const historialesFiltrados = historiales.filter((historial) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (historial.diagnostico?.toLowerCase() || "").includes(searchLower) ||
      (historial.tratamiento?.toLowerCase() || "").includes(searchLower) ||
      (historial.cita?.paciente?.usuario?.nombre?.toLowerCase() || "").includes(searchLower) ||
      (historial.cita?.paciente?.usuario?.apellido?.toLowerCase() || "").includes(searchLower)
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

  // ========================================
  // MANEJO DEL FORMULARIO
  // ========================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validarFormulario = () => {
    const errors = {};

    if (!formData.idCita) {
      errors.idCita = "Debe seleccionar una cita";
    }

    if (!formData.diagnostico?.trim()) {
      errors.diagnostico = "El diagnóstico es requerido";
    }

    if (!formData.tratamiento?.trim()) {
      errors.tratamiento = "El tratamiento es requerido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========================================
  // CRUD OPERATIONS
  // ========================================
  const abrirModalCrear = () => {
    setModalMode("create");
    setSelectedHistorial(null);
    setFormData({
      idCita: "",
      diagnostico: "",
      tratamiento: "",
      observaciones: "",
      fechaRegistro: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setShowModal(true);
  };

  const abrirModalEditar = (historial) => {
    setModalMode("edit");
    setSelectedHistorial(historial);
    setFormData({
      idCita: historial.cita?.idCita || "",
      diagnostico: historial.diagnostico || "",
      tratamiento: historial.tratamiento || "",
      observaciones: historial.observaciones || "",
      fechaRegistro: historial.fechaRegistro || new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedHistorial(null);
    setFormData({
      idCita: "",
      diagnostico: "",
      tratamiento: "",
      observaciones: "",
      fechaRegistro: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    const idUsuarioEditor = usuarioLocal?.idUsuario;

    if (!idUsuarioEditor) {
      setError("No se pudo identificar el usuario.");
      return;
    }

    try {
      const payload = {
        cita: { idCita: formData.idCita },
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        observaciones: formData.observaciones,
        fechaRegistro: formData.fechaRegistro
      };

      if (modalMode === "create") {
        await historialService.crearHistorial(payload, idUsuarioEditor);
        setSuccess("Historial médico creado exitosamente");
      } else {
        await historialService.actualizarHistorial(
          selectedHistorial.idHistorialMedico,
          payload,
          idUsuarioEditor
        );
        setSuccess("Historial médico actualizado exitosamente");
      }

      await cargarHistoriales();
      cerrarModal();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al guardar historial:", err);
      setError("Error al guardar el historial médico.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const abrirDetalles = (historial) => {
    setHistorialDetalle(historial);
    setShowDetallesModal(true);
  };

  const cerrarDetalles = () => {
    setShowDetallesModal(false);
    setHistorialDetalle(null);
  };

  const confirmarEliminar = (historial) => {
    setHistorialAEliminar(historial);
    setShowConfirmModal(true);
  };

  const eliminarHistorial = async () => {
    if (!historialAEliminar) return;

    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    const idUsuarioEditor = usuarioLocal?.idUsuario;

    if (!idUsuarioEditor) {
      setError("No se pudo identificar el usuario.");
      return;
    }

    try {
      await historialService.eliminarHistorial(
        historialAEliminar.idHistorialMedico,
        idUsuarioEditor
      );
      setSuccess("Historial médico eliminado exitosamente");
      await cargarHistoriales();
      setShowConfirmModal(false);
      setHistorialAEliminar(null);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al eliminar historial:", err);
      setError("Error al eliminar el historial médico.");
      setTimeout(() => setError(""), 5000);
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "N/A";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "N/A";
    }
  };

  const getNombrePaciente = (cita) => {
    if (!cita?.paciente?.usuario) return "N/A";
    const { nombre, apellido } = cita.paciente.usuario;
    return `${nombre || ""} ${apellido || ""}`.trim() || "N/A";
  };

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <div className="historial-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando historiales médicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-card">
        {/* Encabezado */}
        <div className="card-header">
          <div className="header-content">
            <h1 className="title">Historiales Médicos</h1>
            <p className="subtitle">
              Registre y gestione los diagnósticos y tratamientos de sus pacientes
            </p>
            {medicoLogueado && (
              <p className="medico-info">
                <strong>Médico:</strong> Dr. {medicoLogueado.usuario?.nombre}{" "}
                {medicoLogueado.usuario?.apellido}
              </p>
            )}
          </div>
          <button className="btn-nuevo" onClick={abrirModalCrear}>
            <span className="btn-icon">➕</span>
            Nuevo Historial
          </button>
        </div>

        {/* Alertas */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
            <button onClick={() => setError("")} className="alert-close">✕</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✓</span>
            {success}
            <button onClick={() => setSuccess("")} className="alert-close">✕</button>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="search-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por paciente, diagnóstico o tratamiento..."
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

        {/* Tabla */}
        <div className="table-wrapper">
          <table className="historial-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Fecha</th>
                <th>Diagnóstico</th>
                <th>Tratamiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historialesPaginados.length > 0 ? (
                historialesPaginados.map((historial) => (
                  <tr key={historial.id_historial}>
                    <td className="td-paciente">
                      {getNombrePaciente(historial.cita)}
                    </td>
                    <td className="td-fecha">
                      {formatearFecha(historial.fechaRegistro)}
                    </td>
                    <td className="td-diagnostico">
                      {historial.diagnostico?.length > 50
                        ? `${historial.diagnostico.substring(0, 50)}...`
                        : historial.diagnostico || "N/A"}
                    </td>
                    <td className="td-tratamiento">
                      {historial.tratamiento?.length > 50
                        ? `${historial.tratamiento.substring(0, 50)}...`
                        : historial.tratamiento || "N/A"}
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
                        <button
                          className="btn-action btn-editar"
                          onClick={() => abrirModalEditar(historial)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-action btn-eliminar"
                          onClick={() => confirmarEliminar(historial)}
                          title="Eliminar"
                        >
                          🗑️
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
                  key={pageNum}
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
              Mostrando {startIndex + 1}-{Math.min(endIndex, historialesFiltrados.length)} de{" "}
              {historialesFiltrados.length} historiales
            </span>
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "create"
                  ? "Nuevo Historial Médico"
                  : "Editar Historial Médico"}
              </h2>
              <button className="modal-close" onClick={cerrarModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>ID de Cita *</label>
                <input
                  type="number"
                  name="idCita"
                  value={formData.idCita}
                  onChange={handleInputChange}
                  className={formErrors.idCita ? "error" : ""}
                  placeholder="Ingrese el ID de la cita"
                />
                {formErrors.idCita && (
                  <span className="error-message">{formErrors.idCita}</span>
                )}
              </div>

              <div className="form-group">
                <label>Fecha de Registro</label>
                <input
                  type="date"
                  name="fechaRegistro"
                  value={formData.fechaRegistro}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Diagnóstico *</label>
                <textarea
                  name="diagnostico"
                  value={formData.diagnostico}
                  onChange={handleInputChange}
                  className={formErrors.diagnostico ? "error" : ""}
                  placeholder="Describa el diagnóstico del paciente"
                  rows="4"
                />
                {formErrors.diagnostico && (
                  <span className="error-message">{formErrors.diagnostico}</span>
                )}
              </div>

              <div className="form-group">
                <label>Tratamiento *</label>
                <textarea
                  name="tratamiento"
                  value={formData.tratamiento}
                  onChange={handleInputChange}
                  className={formErrors.tratamiento ? "error" : ""}
                  placeholder="Describa el tratamiento recomendado"
                  rows="4"
                />
                {formErrors.tratamiento && (
                  <span className="error-message">{formErrors.tratamiento}</span>
                )}
              </div>

              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Observaciones adicionales (opcional)"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {modalMode === "create" ? "Crear Historial" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetallesModal && historialDetalle && (
        <div className="modal-overlay" onClick={cerrarDetalles}>
          <div className="modal-content modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Historial Médico</h2>
              <button className="modal-close" onClick={cerrarDetalles}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detalle-row">
                <span className="detalle-label">Paciente:</span>
                <span className="detalle-value">
                  {getNombrePaciente(historialDetalle.cita)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Fecha de Registro:</span>
                <span className="detalle-value">
                  {formatearFecha(historialDetalle.fechaRegistro)}
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

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div
            className="modal-content modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">⚠️</div>
            <h2>¿Eliminar historial médico?</h2>
            <p>
              Esta acción no se puede deshacer. Se eliminará el historial del paciente{" "}
              <strong>{getNombrePaciente(historialAEliminar?.cita)}</strong>
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={eliminarHistorial}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}