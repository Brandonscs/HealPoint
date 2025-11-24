import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import citaService from "../../../services/citaService";
import medicoService from "../../../services/medicoService";
import pacienteService from "../../../services/pacienteService";
import estadoService from "../../../services/estadoService";
import usuarioService from "../../../services/usuarioService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./AgendaGlobal.scss";
import Swal from "sweetalert2";

export default function AgendaGlobal() {
  const navigate = useNavigate();

  // Estados principales
  const [admin, setAdmin] = useState(null);
  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Datos para filtros
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [estados, setEstados] = useState([]);

  // Filtros
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  // Vista
  const [vistaActual, setVistaActual] = useState("tabla");

  // Modales
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [showModalEstado, setShowModalEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const citasPorPagina = 10;

  // Cargar datos iniciales
  const cargarDatosIniciales = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

      if (!usuarioLocal || !usuarioLocal.idUsuario) {
        navigate("/login");
        return;
      }

      const adminResponse = await usuarioService.getUsuarioById(usuarioLocal.idUsuario);
      setAdmin(adminResponse.data);
      localStorage.setItem("adminLogueado", JSON.stringify(adminResponse.data));

      const citasResponse = await citaService.getCitas();
      if (Array.isArray(citasResponse.data)) {
        const ordenadas = citasResponse.data.sort((a, b) => {
          const fechaA = new Date(`${a.fecha}T${a.hora}`);
          const fechaB = new Date(`${b.fecha}T${b.hora}`);
          return fechaB - fechaA;
        });
        setCitas(ordenadas);
        setCitasFiltradas(ordenadas);
      } else {
        setCitas([]);
        setCitasFiltradas([]);
      }

      const medicosResponse = await medicoService.getMedicos();
      if (Array.isArray(medicosResponse.data)) {
        setMedicos(medicosResponse.data);
      }

      const pacientesResponse = await pacienteService.getPacientes();
      if (Array.isArray(pacientesResponse.data)) {
        setPacientes(pacientesResponse.data);
      }

      const estadosResponse = await estadoService.getEstados();
      if (Array.isArray(estadosResponse.data)) {
        setEstados(estadosResponse.data);
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos de la agenda. Por favor, intente nuevamente.");

      Swal.fire({
        icon: "error",
        title: "Error de carga",
        text: "No se pudieron cargar los datos de la agenda.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // Aplicar filtros
  const aplicarFiltros = useCallback(() => {
    let resultado = [...citas];

    if (filtroMedico) {
      resultado = resultado.filter((cita) => {
        const idMedico = cita.medico?.idMedico || cita.medico?.id_medico;
        return idMedico?.toString() === filtroMedico;
      });
    }

    if (filtroPaciente) {
      resultado = resultado.filter((cita) => {
        const idPaciente = cita.paciente?.idPaciente;
        return idPaciente?.toString() === filtroPaciente;
      });
    }

    if (filtroEstado) {
      resultado = resultado.filter((cita) => {
        const idEstado = cita.estado?.idEstado;
        return idEstado?.toString() === filtroEstado;
      });
    }

    if (filtroFechaInicio) {
      resultado = resultado.filter((cita) => cita.fecha >= filtroFechaInicio);
    }

    if (filtroFechaFin) {
      resultado = resultado.filter((cita) => cita.fecha <= filtroFechaFin);
    }

    setCitasFiltradas(resultado);
    setPaginaActual(1);
  }, [citas, filtroMedico, filtroPaciente, filtroEstado, filtroFechaInicio, filtroFechaFin]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const limpiarFiltros = () => {
    setFiltroMedico("");
    setFiltroPaciente("");
    setFiltroEstado("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
    setPaginaActual(1);
  };

  // Paginación
  const indexUltimaCita = paginaActual * citasPorPagina;
  const indexPrimeraCita = indexUltimaCita - citasPorPagina;
  const citasPaginadas = citasFiltradas.slice(indexPrimeraCita, indexUltimaCita);
  const totalPaginas = Math.ceil(citasFiltradas.length / citasPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Modales
  const abrirModalDetalles = (cita) => {
    setCitaSeleccionada(cita);
    setShowModalDetalles(true);
  };

  const cerrarModalDetalles = () => {
    setShowModalDetalles(false);
    setCitaSeleccionada(null);
  };

  const abrirModalEstado = (cita) => {
    setCitaSeleccionada(cita);
    setNuevoEstado(cita.estado?.idEstado?.toString() || "");
    setShowModalEstado(true);
  };

  const cerrarModalEstado = () => {
    setShowModalEstado(false);
    setCitaSeleccionada(null);
    setNuevoEstado("");
  };

  // Actualizar estado
  const actualizarEstadoCita = async () => {
    if (!citaSeleccionada || !nuevoEstado) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Debe seleccionar un estado para continuar.",
        confirmButtonColor: "#f0ad4e",
      });
      return;
    }

    try {
      const idCita = citaSeleccionada.idCita || citaSeleccionada.id_cita;

      const citaActualizada = {
        paciente: {
          idPaciente: citaSeleccionada.paciente?.idPaciente,
        },
        medico: {
          id_medico: citaSeleccionada.medico?.id_medico || citaSeleccionada.medico?.idMedico,
        },
        fecha: citaSeleccionada.fecha,
        hora: citaSeleccionada.hora,
        motivo: citaSeleccionada.motivo,
        estado: {
          idEstado: parseInt(nuevoEstado),
        },
      };

      await citaService.actualizarCita(idCita, citaActualizada);

      setSuccess("Estado de la cita actualizado exitosamente");

      await cargarDatosIniciales();

      cerrarModalEstado();

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: "El estado de la cita fue actualizado correctamente.",
        confirmButtonColor: "#3085d6",
        timer: 2000,
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const mensajeError = typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || "Error al actualizar el estado de la cita.";

      setError(mensajeError);

      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });

      setTimeout(() => setError(""), 5000);
    }
  };

  // Cancelar cita
  const cancelarCita = async (cita) => {
    const result = await Swal.fire({
      title: "¿Cancelar cita?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener",
    });

    if (!result.isConfirmed) return;

    try {
      const idCita = cita.idCita || cita.id_cita;
      await citaService.eliminarCita(idCita);

      setSuccess("Cita cancelada exitosamente");
      await cargarDatosIniciales();

      Swal.fire({
        icon: "success",
        title: "Cita cancelada",
        text: "La cita ha sido cancelada correctamente.",
        confirmButtonColor: "#3085d6",
        timer: 2000,
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const mensajeError = typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || "Error al cancelar la cita.";

      setError(mensajeError);

      Swal.fire({
        icon: "error",
        title: "Error al cancelar",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });

      setTimeout(() => setError(""), 5000);
    }
  };

  // Utilidades
  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("adminLogueado");
    navigate("/login");
  }, [navigate]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const [año, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${año}`;
  };

  const formatearHora = (hora) => {
    if (!hora) return "N/A";
    return hora.substring(0, 5);
  };

  const obtenerColorEstado = (estado) => {
    const nombreEstado = estado?.nombreEstado || estado;

    const colores = {
      PROGRAMADA: "estado-programada",
      CONFIRMADA: "estado-confirmada",
      EN_CURSO: "estado-en-curso",
      COMPLETADA: "estado-completada",
      CANCELADA: "estado-cancelada",
      NO_ASISTIO: "estado-no-asistio",
    };
    return colores[nombreEstado] || "estado-default";
  };

  const obtenerTextoEstado = (estado) => {
    if (typeof estado === "object" && estado !== null) {
      return estado.nombreEstado || "N/A";
    }
    return estado || "N/A";
  };

  // Estadísticas
  const calcularEstadisticas = () => {
    const total = citas.length;
    const hoy = new Date().toISOString().split("T")[0];
    const citasHoy = citas.filter((c) => c.fecha === hoy).length;
    const programadas = citas.filter((c) => {
      const nombreEstado = c.estado?.nombreEstado || "";
      return nombreEstado === "PROGRAMADA" || nombreEstado === "CONFIRMADA";
    }).length;
    const completadas = citas.filter((c) => c.estado?.nombreEstado === "COMPLETADA").length;

    return { total, citasHoy, programadas, completadas };
  };

  const stats = calcularEstadisticas();

  // Render - Loading
  if (loading) {
    return (
      <div className="dashboard-admin-root">
        <Sidebar usuario={admin} onLogout={handleLogout} />
        <div className="main-area">
          <Navbar admin={admin} onLogout={handleLogout} />
          <main className="content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando agenda global...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Render - Error
  if (error && !admin) {
    return (
      <div className="dashboard-admin-root">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate("/login")} className="btn-retry">
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  // Render - Principal
  return (
    <div className="dashboard-admin-root">
      <img src="/icons/calendar.svg" className="bg-icon i1" alt="" />
      <img src="/icons/stethoscope.svg" className="bg-icon i2" alt="" />
      <img src="/icons/heart-pulse.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={admin} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar admin={admin} onLogout={handleLogout} />

        <main className="content">
          <div className="agenda-global-card">
            <div className="card-header">
              <div className="header-content">
                <h1 className="title">Agenda Global de Citas Médicas</h1>
                <p className="subtitle">
                  Visualización consolidada de todas las citas del sistema
                </p>
              </div>
              <div className="header-actions">
                <button
                  className={`btn-vista ${vistaActual === "tabla" ? "active" : ""}`}
                  onClick={() => setVistaActual("tabla")}
                >
                  📋 Tabla
                </button>
                <button
                  className={`btn-vista ${vistaActual === "calendario" ? "active" : ""}`}
                  onClick={() => setVistaActual("calendario")}
                  title="Próximamente"
                  disabled
                >
                  📅 Calendario
                </button>
              </div>
            </div>

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

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Citas</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.citasHoy}</span>
                  <span className="stat-label">Citas Hoy</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🕐</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.programadas}</span>
                  <span className="stat-label">Pendientes</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.completadas}</span>
                  <span className="stat-label">Completadas</span>
                </div>
              </div>
            </div>

            <div className="filtros-section">
              <h3 className="filtros-title">🔍 Filtros de Búsqueda</h3>

              <div className="filtros-grid">
                <div className="filtro-group">
                  <label>Médico</label>
                  <select value={filtroMedico} onChange={(e) => setFiltroMedico(e.target.value)}>
                    <option value="">Todos los médicos</option>
                    {medicos.map((medico) => (
                      <option
                        key={medico.idMedico || medico.id_medico}
                        value={(medico.idMedico || medico.id_medico).toString()}
                      >
                        Dr. {medico.usuario?.nombre} {medico.usuario?.apellido} - {medico.especialidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>Paciente</label>
                  <select value={filtroPaciente} onChange={(e) => setFiltroPaciente(e.target.value)}>
                    <option value="">Todos los pacientes</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.idPaciente} value={paciente.idPaciente.toString()}>
                        {paciente.usuario?.nombre} {paciente.usuario?.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>Estado</label>
                  <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    {estados.map((estado) => (
                      <option key={estado.idEstado} value={estado.idEstado.toString()}>
                        {estado.nombreEstado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  />
                </div>

                <div className="filtro-group">
                  <label>Fecha Fin</label>
                  <input
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                  />
                </div>

                <div className="filtro-group filtro-actions">
                  <button className="btn-limpiar" onClick={limpiarFiltros}>
                    🔄 Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>

            {vistaActual === "tabla" && (
              <div className="tabla-wrapper">
                <table className="agenda-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Paciente</th>
                      <th>Médico</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasPaginadas.length > 0 ? (
                      citasPaginadas.map((cita) => (
                        <tr key={cita.idCita || cita.id_cita}>
                          <td>{cita.idCita || cita.id_cita}</td>
                          <td>
                            <div className="paciente-cell">
                              <strong>
                                {cita.paciente?.usuario?.nombre} {cita.paciente?.usuario?.apellido}
                              </strong>
                              <span className="documento">
                                {cita.paciente?.usuario?.numeroDocumento}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="medico-cell">
                              <strong>
                                Dr. {cita.medico?.usuario?.nombre} {cita.medico?.usuario?.apellido}
                              </strong>
                              <span className="especialidad">{cita.medico?.especialidad}</span>
                            </div>
                          </td>
                          <td>{formatearFecha(cita.fecha)}</td>
                          <td>{formatearHora(cita.hora)}</td>
                          <td>
                            <span className={`estado-badge ${obtenerColorEstado(cita.estado)}`}>
                              {obtenerTextoEstado(cita.estado)}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-action btn-ver"
                                onClick={() => abrirModalDetalles(cita)}
                                title="Ver detalles"
                              >
                                👁️
                              </button>
                              {cita.estado?.nombreEstado !== "COMPLETADA" &&
                                cita.estado?.nombreEstado !== "CANCELADA" && (
                                  <>
                                    <button
                                      className="btn-action btn-editar"
                                      onClick={() => abrirModalEstado(cita)}
                                      title="Cambiar estado"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      className="btn-action btn-cancelar"
                                      onClick={() => cancelarCita(cita)}
                                      title="Cancelar cita"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data">
                          <div className="no-citas">
                            <div className="no-citas-icon">📋</div>
                            <h3>No se encontraron citas</h3>
                            <p>No hay citas que coincidan con los filtros seleccionados</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {citasFiltradas.length > citasPorPagina && (
              <div className="paginacion">
                <button
                  className="btn-paginacion"
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  ◀ Anterior
                </button>

                <div className="numeros-pagina">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                    <button
                      key={numero}
                      className={`btn-numero ${paginaActual === numero ? "active" : ""}`}
                      onClick={() => cambiarPagina(numero)}
                    >
                      {numero}
                    </button>
                  ))}
                </div>

                <button
                  className="btn-paginacion"
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente ▶
                </button>

                <span className="info-paginacion">
                  Mostrando {indexPrimeraCita + 1} -{" "}
                  {Math.min(indexUltimaCita, citasFiltradas.length)} de {citasFiltradas.length} citas
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL DETALLES */}
      {showModalDetalles && citaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModalDetalles}>
          <div className="modal-content modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Cita</h2>
              <button className="modal-close" onClick={cerrarModalDetalles}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detalle-section">
                <h3>Información de la Cita</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">ID:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.idCita || citaSeleccionada.id_cita}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha:</span>
                    <span className="detalle-value">{formatearFecha(citaSeleccionada.fecha)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Hora:</span>
                    <span className="detalle-value">{formatearHora(citaSeleccionada.hora)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Estado:</span>
                    <span className={`estado-badge ${obtenerColorEstado(citaSeleccionada.estado)}`}>
                      {obtenerTextoEstado(citaSeleccionada.estado)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detalle-section">
                <h3>Información del Paciente</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Nombre:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.paciente?.usuario?.nombre}{" "}
                      {citaSeleccionada.paciente?.usuario?.apellido}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Documento:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.paciente?.usuario?.numeroDocumento || "N/A"}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Teléfono:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.paciente?.usuario?.telefono || "N/A"}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Correo:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.paciente?.usuario?.correo || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detalle-section">
                <h3>Información del Médico</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Nombre:</span>
                    <span className="detalle-value">
                      Dr. {citaSeleccionada.medico?.usuario?.nombre}{" "}
                      {citaSeleccionada.medico?.usuario?.apellido}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Especialidad:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.medico?.especialidad || "N/A"}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Teléfono:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.medico?.usuario?.telefono || "N/A"}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Correo:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.medico?.usuario?.correo || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detalle-section">
                <h3>Motivo de la Consulta</h3>
                <div className="motivo-texto">
                  {citaSeleccionada.motivo || "No se especificó motivo"}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cerrar" onClick={cerrarModalDetalles}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR ESTADO */}
      {showModalEstado && citaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModalEstado}>
          <div className="modal-content modal-estado" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Actualizar Estado de la Cita</h2>
              <button className="modal-close" onClick={cerrarModalEstado}>✕</button>
            </div>

            <div className="modal-body">
              <div className="cita-info-resumen">
                <p>
                  <strong>Paciente:</strong> {citaSeleccionada.paciente?.usuario?.nombre}{" "}
                  {citaSeleccionada.paciente?.usuario?.apellido}
                </p>
                <p>
                  <strong>Médico:</strong> Dr. {citaSeleccionada.medico?.usuario?.nombre}{" "}
                  {citaSeleccionada.medico?.usuario?.apellido}
                </p>
                <p>
                  <strong>Fecha y Hora:</strong> {formatearFecha(citaSeleccionada.fecha)} a las{" "}
                  {formatearHora(citaSeleccionada.hora)}
                </p>
                <p>
                  <strong>Estado Actual:</strong>{" "}
                  <span className={`estado-badge ${obtenerColorEstado(citaSeleccionada.estado)}`}>
                    {obtenerTextoEstado(citaSeleccionada.estado)}
                  </span>
                </p>
              </div>

              <div className="form-group">
                <label>Seleccione el nuevo estado:</label>
                <select
                  className="estado-select"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  <option value="">-- Seleccione un estado --</option>
                  {estados.map((estado) => (
                    <option key={estado.idEstado} value={estado.idEstado.toString()}>
                      {estado.nombreEstado}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cerrarModalEstado}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={actualizarEstadoCita}>
                Actualizar Estado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}