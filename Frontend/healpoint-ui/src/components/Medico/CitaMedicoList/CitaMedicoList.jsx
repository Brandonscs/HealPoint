import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import citaService from "../../../services/citaService";
import medicoService from "../../../services/medicoService";
import estadoService from "../../../services/estadoService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./CitaMedicoList.scss";
import Swal from "sweetalert2";

export default function CitaMedicoList() {
  const navigate = useNavigate();

  // Estados principales
  const [medico, setMedico] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados disponibles
  const [estados, setEstados] = useState([]);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [busquedaPaciente, setBusquedaPaciente] = useState("");

  // Modales
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const [showModalAprobar, setShowModalAprobar] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  const cargarDatosIniciales = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Obtener usuario del localStorage
      const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

      if (!usuarioLocal || !usuarioLocal.idUsuario) {
        navigate("/login");
        return;
      }

      // Validar que sea médico
      if (usuarioLocal.rol?.nombreRol !== "Medico") {
        navigate("/");
        return;
      }

      setUsuario(usuarioLocal);

      // 2. Obtener datos del médico
      const respMedico = await medicoService.getMedicoPorIdUsuario(usuarioLocal.idUsuario);
      const medicoData = respMedico.data;
      
      setMedico(medicoData);
      localStorage.setItem("medicoLogueado", JSON.stringify(medicoData));

      // 3. Cargar citas del médico
      const idMedico = medicoData.id_medico || medicoData.idMedico;
      const respCitas = await citaService.getCitasPorMedico(idMedico);

      if (typeof respCitas.data === 'string') {
        setCitas([]);
        setCitasFiltradas([]);
      } else if (Array.isArray(respCitas.data)) {
        // Ordenar por estado (pendientes primero) y luego por fecha
        const ordenadas = respCitas.data.sort((a, b) => {
          // Priorizar pendientes
          const estadoA = a.estado?.nombreEstado || "";
          const estadoB = b.estado?.nombreEstado || "";
          
          if (estadoA === "PENDIENTE" && estadoB !== "PENDIENTE") return -1;
          if (estadoB === "PENDIENTE" && estadoA !== "PENDIENTE") return 1;
          
          // Luego por fecha más reciente
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

      // 4. Cargar estados disponibles
      const respEstados = await estadoService.getEstados();
      if (Array.isArray(respEstados.data)) {
        setEstados(respEstados.data);
      }

    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos. Por favor, intente nuevamente.");

      Swal.fire({
        icon: "error",
        title: "Error de carga",
        text: "No se pudieron cargar los datos.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // ========================================
  // FILTROS
  // ========================================
  const aplicarFiltros = useCallback(() => {
    let resultado = [...citas];

    if (filtroEstado !== "TODAS") {
      resultado = resultado.filter(cita => {
        const idEstadoCita = cita.estado?.idEstado?.toString() || "";
        return idEstadoCita === filtroEstado;
      });
    }

    if (filtroFecha) {
      resultado = resultado.filter(cita => cita.fecha === filtroFecha);
    }

    if (busquedaPaciente.trim()) {
      const busqueda = busquedaPaciente.toLowerCase();
      resultado = resultado.filter(cita => {
        const nombreCompleto = `${cita.paciente?.usuario?.nombre || ""} ${cita.paciente?.usuario?.apellido || ""}`.toLowerCase();
        return nombreCompleto.includes(busqueda);
      });
    }

    setCitasFiltradas(resultado);
  }, [filtroEstado, filtroFecha, busquedaPaciente, citas]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const limpiarFiltros = () => {
    setFiltroEstado("TODAS");
    setFiltroFecha("");
    setBusquedaPaciente("");
  };

  // ========================================
  // MODALES
  // ========================================
  const abrirModalDetalles = (cita) => {
    setCitaSeleccionada(cita);
    setShowModalDetalles(true);
  };

  const cerrarModalDetalles = () => {
    setShowModalDetalles(false);
    setCitaSeleccionada(null);
  };

  const abrirModalConfirmar = (cita) => {
    setCitaSeleccionada(cita);
    setNuevoEstado(cita.estado?.idEstado?.toString() || "");
    setShowModalConfirmar(true);
  };

  const cerrarModalConfirmar = () => {
    setShowModalConfirmar(false);
    setCitaSeleccionada(null);
    setNuevoEstado("");
  };

  const abrirModalAprobar = (cita) => {
    setCitaSeleccionada(cita);
    setShowModalAprobar(true);
  };

  const cerrarModalAprobar = () => {
    setShowModalAprobar(false);
    setCitaSeleccionada(null);
  };

  // ========================================
  // APROBAR/RECHAZAR CITA PENDIENTE
  // ========================================
  const aprobarCita = async () => {
    if (!citaSeleccionada) return;

    try {
      const idCita = citaSeleccionada.idCita || citaSeleccionada.id_cita;

      // ✅ Buscar el estado "ACTIVA" (ID: 2) según tu tabla de estados
      const estadoConfirmada = estados.find(e => 
        e.nombreEstado === "ACTIVA"
      );

      if (!estadoConfirmada) {
        Swal.fire({
          icon: "error",
          title: "Error de configuración",
          text: "No se encontró el estado ACTIVA en el sistema. Contacte al administrador.",
          confirmButtonColor: "#d33",
        });
        return;
      }

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
          idEstado: estadoConfirmada.idEstado,
        },
      };

      console.log("📤 Aprobando cita:", citaActualizada);

      await citaService.actualizarCita(idCita, citaActualizada);

      setSuccess("Cita confirmada exitosamente");
      await cargarDatosIniciales();
      cerrarModalAprobar();

      Swal.fire({
        icon: "success",
        title: "¡Cita Confirmada!",
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><strong>La cita ha sido confirmada exitosamente</strong></p>
            <hr style="margin: 15px 0;">
            <p><span style="color: green; font-weight: bold;">✅ Estado:</span> ACTIVA</p>
            <p><strong>👤 Paciente:</strong> ${citaSeleccionada.paciente?.usuario?.nombre} ${citaSeleccionada.paciente?.usuario?.apellido}</p>
            <p><strong>📅 Fecha:</strong> ${formatearFecha(citaSeleccionada.fecha)}</p>
            <p><strong>🕐 Hora:</strong> ${formatearHora(citaSeleccionada.hora)}</p>
            <hr style="margin: 15px 0;">
            <p style="font-size: 0.9em; color: #666;">
              El paciente ha sido notificado de la confirmación
            </p>
          </div>
        `,
        confirmButtonColor: "#10b981",
        timer: 4000,
        width: 600,
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("❌ Error al aprobar cita:", err);
      
      const mensajeError = typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || "Error al aprobar la cita.";

      setError(mensajeError);

      Swal.fire({
        icon: "error",
        title: "Error al aprobar",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });

      setTimeout(() => setError(""), 5000);
    }
  };

  const rechazarCita = async () => {
    if (!citaSeleccionada) return;

    const result = await Swal.fire({
      title: '¿Rechazar esta cita?',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>¿Está seguro que desea rechazar esta solicitud?</strong></p>
          <hr style="margin: 15px 0;">
          <p><strong>👤 Paciente:</strong> ${citaSeleccionada.paciente?.usuario?.nombre} ${citaSeleccionada.paciente?.usuario?.apellido}</p>
          <p><strong>📅 Fecha:</strong> ${formatearFecha(citaSeleccionada.fecha)}</p>
          <p><strong>🕐 Hora:</strong> ${formatearHora(citaSeleccionada.hora)}</p>
          <p><strong>📝 Motivo:</strong> ${citaSeleccionada.motivo}</p>
          <hr style="margin: 15px 0;">
          <p style="font-size: 0.9em; color: #d33;">
            ⚠️ Esta acción cancelará la solicitud de cita
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      width: 600,
    });

    if (!result.isConfirmed) return;

    try {
      const idCita = citaSeleccionada.idCita || citaSeleccionada.id_cita;

      // ✅ Buscar el estado "CANCELADA" (ID: 4) según tu tabla de estados
      const estadoCancelada = estados.find(e => 
        e.nombreEstado === "CANCELADA"
      );

      if (!estadoCancelada) {
        Swal.fire({
          icon: "error",
          title: "Error de configuración",
          text: "No se encontró el estado CANCELADA en el sistema. Contacte al administrador.",
          confirmButtonColor: "#d33",
        });
        return;
      }

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
          idEstado: estadoCancelada.idEstado,
        },
      };

      console.log("📤 Rechazando cita:", citaActualizada);

      await citaService.actualizarCita(idCita, citaActualizada);

      setSuccess("Cita rechazada exitosamente");
      await cargarDatosIniciales();
      cerrarModalAprobar();

      Swal.fire({
        icon: "success",
        title: "Cita Rechazada",
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><strong>La solicitud de cita ha sido rechazada</strong></p>
            <hr style="margin: 15px 0;">
            <p><span style="color: red; font-weight: bold;">❌ Estado:</span> CANCELADA</p>
            <p>El paciente ha sido notificado del rechazo</p>
          </div>
        `,
        confirmButtonColor: "#3085d6",
        timer: 3000,
        width: 600,
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("❌ Error al rechazar cita:", err);
      
      const mensajeError = typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || "Error al rechazar la cita.";

      setError(mensajeError);

      Swal.fire({
        icon: "error",
        title: "Error al rechazar",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });

      setTimeout(() => setError(""), 5000);
    }
  };

  // ========================================
  // CONFIRMAR/ACTUALIZAR ESTADO DE CITA
  // ========================================
  const confirmarCita = async () => {
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
      cerrarModalConfirmar();

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

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("medicoLogueado");
    navigate("/login");
  }, [navigate]);

  // ========================================
  // UTILIDADES
  // ========================================
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
      PENDIENTE: "estado-pendiente",
      ACTIVA: "estado-activa",
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

  // ========================================
  // ESTADÍSTICAS
  // ========================================
  const calcularEstadisticas = () => {
    const total = citas.length;
    const hoy = new Date().toISOString().split("T")[0];
    const citasHoy = citas.filter((c) => c.fecha === hoy).length;
    
    const pendientes = citas.filter((c) => {
      const nombreEstado = c.estado?.nombreEstado || "";
      return nombreEstado === "PENDIENTE";
    }).length;
    
    const confirmadas = citas.filter((c) => 
      c.estado?.nombreEstado === "ACTIVA"
    ).length;

    return { total, citasHoy, pendientes, confirmadas };
  };

  const stats = calcularEstadisticas();

  // ========================================
  // RENDER - LOADING
  // ========================================
  if (loading) {
    return (
      <div className="citas-medico-root">
        <Sidebar usuario={usuario} onLogout={handleLogout} />
        <div className="main-area">
          <Navbar medico={medico} onLogout={handleLogout} />
          <main className="content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando citas...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER - ERROR
  // ========================================
  if (error && !medico) {
    return (
      <div className="citas-medico-root">
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

  // ========================================
  // RENDER - PRINCIPAL
  // ========================================
  return (
    <div className="citas-medico-root">
      <img src="/icons/heart-pulse.svg" className="bg-icon i1" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i2" alt="" />
      <img src="/icons/stethoscope.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={usuario} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar medico={medico} onLogout={handleLogout} />

        <main className="content">
          <div className="citas-card">
            <div className="card-header">
              <div className="header-content">
                <h1 className="title">Mis Citas Médicas</h1>
                <p className="subtitle">
                  Gestione las citas agendadas por sus pacientes
                </p>
                {medico && (
                  <p className="medico-info">
                    <strong>Dr(a).</strong> {usuario?.nombre} {usuario?.apellido} -{" "}
                    <strong>Especialidad:</strong> {medico.especialidad}
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

            {success && (
              <div className="alert alert-success">
                <span>✓</span>
                {success}
                <button onClick={() => setSuccess("")} className="alert-close">
                  ✕
                </button>
              </div>
            )}

            {stats.pendientes > 0 && (
              <div className="alert alert-warning">
                <span>⏳</span>
                Tienes {stats.pendientes} cita{stats.pendientes > 1 ? 's' : ''} pendiente{stats.pendientes > 1 ? 's' : ''} por aprobar
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
              <div className="stat-card stat-warning">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.pendientes}</span>
                  <span className="stat-label">Por Aprobar</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.confirmadas}</span>
                  <span className="stat-label">Confirmadas</span>
                </div>
              </div>
            </div>

            <div className="filtros-section">
              <h3 className="filtros-title">🔍 Filtros de Búsqueda</h3>
              <div className="filtros-grid">
                <div className="filtro-group">
                  <label>Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="TODAS">Todas</option>
                    {estados.map((estado) => (
                      <option key={estado.idEstado} value={estado.idEstado.toString()}>
                        {estado.nombreEstado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                  />
                </div>

                <div className="filtro-group">
                  <label>Buscar Paciente</label>
                  <input
                    type="text"
                    placeholder="Nombre del paciente..."
                    value={busquedaPaciente}
                    onChange={(e) => setBusquedaPaciente(e.target.value)}
                  />
                </div>

                <div className="filtro-group filtro-actions">
                  <button className="btn-limpiar" onClick={limpiarFiltros}>
                    🔄 Limpiar
                  </button>
                </div>
              </div>
            </div>

            <div className="citas-list">
              {citasFiltradas.length > 0 ? (
                citasFiltradas.map((cita) => {
                  const esPendiente = cita.estado?.nombreEstado === "PENDIENTE";
                  
                  return (
                    <div 
                      key={cita.idCita || cita.id_cita} 
                      className={`cita-item ${esPendiente ? 'cita-pendiente' : ''}`}
                    >
                      <div className="cita-header">
                        <div className="cita-fecha">
                          <span className="fecha">{formatearFecha(cita.fecha)}</span>
                          <span className="hora">{formatearHora(cita.hora)}</span>
                        </div>
                        <span className={`estado-badge ${obtenerColorEstado(cita.estado)}`}>
                          {obtenerTextoEstado(cita.estado)}
                        </span>
                      </div>

                      <div className="cita-body">
                        <div className="paciente-info">
                          <h3 className="paciente-nombre">
                            {cita.paciente?.usuario?.nombre} {cita.paciente?.usuario?.apellido}
                          </h3>
                          
                          <p className="paciente-telefono">
                            <strong>Teléfono:</strong> {cita.paciente?.usuario?.telefono || "N/A"}
                          </p>
                        </div>

                        <div className="cita-motivo">
                          <strong>Motivo:</strong> {cita.motivo || "No especificado"}
                        </div>
                      </div>

                      <div className="cita-actions">
                        <button
                          className="btn-action btn-detalles"
                          onClick={() => abrirModalDetalles(cita)}
                        >
                          👁️ Ver Detalles
                        </button>
                        
                        {esPendiente ? (
                          <button
                            className="btn-action btn-aprobar"
                            onClick={() => abrirModalAprobar(cita)}
                          >
                            ✅ Aprobar/Rechazar
                          </button>
                        ) : (
                          (cita.estado?.nombreEstado !== "COMPLETADA" &&
                            cita.estado?.nombreEstado !== "CANCELADA") && (
                            <button
                              className="btn-action btn-confirmar"
                              onClick={() => abrirModalConfirmar(cita)}
                            >
                              ✏️ Actualizar Estado
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-citas">
                  <div className="no-citas-icon">📋</div>
                  <h3>No se encontraron citas</h3>
                  <p>No hay citas que coincidan con los filtros seleccionados</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL DETALLES */}
      {showModalDetalles && citaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModalDetalles}>
          <div
            className="modal-content modal-detalles"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Detalles de la Cita</h2>
              <button className="modal-close" onClick={cerrarModalDetalles}>
                ✕
              </button>
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
                    <span className="detalle-value">
                      {formatearFecha(citaSeleccionada.fecha)}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Hora:</span>
                    <span className="detalle-value">
                      {formatearHora(citaSeleccionada.hora)}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Estado:</span>
                    <span
                      className={`estado-badge ${obtenerColorEstado(
                        citaSeleccionada.estado
                      )}`}
                    >
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
                  <div className="detalle-item">
                    <span className="detalle-label">EPS:</span>
                    <span className="detalle-value">
                      {citaSeleccionada.paciente?.eps || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detalle-section">
                <h3>Motivo de Consulta</h3>
                <p className="motivo-texto">
                  {citaSeleccionada.motivo || "No especificado"}
                </p>
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

      {/* MODAL APROBAR/RECHAZAR CITA PENDIENTE */}
      {showModalAprobar && citaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModalAprobar}>
          <div
            className="modal-content modal-aprobar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Aprobar o Rechazar Cita</h2>
              <button className="modal-close" onClick={cerrarModalAprobar}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="cita-info-resumen">
                <div className="resumen-icon">📋</div>
                <h3>Solicitud de Cita</h3>
                <p>
                  <strong>Paciente:</strong> {citaSeleccionada.paciente?.usuario?.nombre}{" "}
                  {citaSeleccionada.paciente?.usuario?.apellido}
                </p>
                <p>
                  <strong>Teléfono:</strong> {citaSeleccionada.paciente?.usuario?.telefono || "N/A"}
                </p>
                <p>
                  <strong>Fecha:</strong> {formatearFecha(citaSeleccionada.fecha)}
                </p>
                <p>
                  <strong>Hora:</strong> {formatearHora(citaSeleccionada.hora)}
                </p>
                <p>
                  <strong>Motivo:</strong> {citaSeleccionada.motivo}
                </p>
              </div>

              <div className="aprobar-info">
                <p className="info-text">
                  ⚠️ Al aprobar esta cita, el horario quedará bloqueado y no podrá ser utilizado por otros pacientes.
                </p>
              </div>
            </div>

            <div className="modal-actions modal-actions-aprobar">
              <button className="btn-rechazar" onClick={rechazarCita}>
                ❌ Rechazar
              </button>
              <button className="btn-aprobar-confirm" onClick={aprobarCita}>
                ✅ Aprobar Cita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR/ACTUALIZAR ESTADO */}
      {showModalConfirmar && citaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModalConfirmar}>
          <div
            className="modal-content modal-confirmar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Actualizar Estado de la Cita</h2>
              <button className="modal-close" onClick={cerrarModalConfirmar}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="cita-info-resumen">
                <p>
                  <strong>Paciente:</strong> {citaSeleccionada.paciente?.usuario?.nombre}{" "}
                  {citaSeleccionada.paciente?.usuario?.apellido}
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
                  {estados
                    .filter(e => e.nombreEstado !== "PENDIENTE")
                    .map((estado) => (
                      <option key={estado.idEstado} value={estado.idEstado.toString()}>
                        {estado.nombreEstado}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cerrarModalConfirmar}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmarCita}>
                Actualizar Estado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}