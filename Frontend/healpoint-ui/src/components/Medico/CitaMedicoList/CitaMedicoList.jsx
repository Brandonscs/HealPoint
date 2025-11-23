import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import citaService from "../../../services/citaService";
import estadoService from "../../../services/estadoService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./CitaMedicoList.scss";

export default function CitaMedicoList() {
  const navigate = useNavigate();

  // Estados principales
  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Datos del médico logueado
  const [medicoLogueado, setMedicoLogueado] = useState(null);

  // Estados disponibles desde la BD
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [busquedaPaciente, setBusquedaPaciente] = useState("");

  // Modal de detalles
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Modal de actualizar estado
  const [showModalEstado, setShowModalEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");

  // ========================================
  // CARGAR ESTADOS DESDE LA BD
  // ========================================
  const cargarEstados = useCallback(async () => {
    try {
      const response = await estadoService.getEstados();
      if (Array.isArray(response.data)) {
        setEstadosDisponibles(response.data);
      } else {
        setEstadosDisponibles([]);
      }
    } catch (err) {
      console.error("Error al cargar estados:", err);
      setEstadosDisponibles([]);
    }
  }, []);

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  const cargarCitas = useCallback(async (idMedico) => {
    if (!idMedico) {
      console.log("No hay idMedico, cancelando carga de citas");
      return;
    }

    console.log("Cargando citas para médico ID:", idMedico);

    try {
      setLoading(true);
      setError("");
      
      const response = await citaService.getCitasPorMedico(idMedico);
      console.log("Respuesta del servidor:", response);
      console.log("Datos recibidos:", response.data);

      if (typeof response.data === 'string') {
        console.log("No hay citas para este médico (mensaje del servidor):", response.data);
        setCitas([]);
        setCitasFiltradas([]);
      } else if (Array.isArray(response.data)) {
        console.log("Citas procesadas:", response.data);

        if (response.data.length > 0) {
          const ordenadas = response.data.sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora}`);
            const fechaB = new Date(`${b.fecha}T${b.hora}`);
            return fechaB - fechaA;
          });
          setCitas(ordenadas);
          setCitasFiltradas(ordenadas);
          console.log("Citas cargadas exitosamente:", ordenadas.length);
        } else {
          console.log("Array vacío de citas");
          setCitas([]);
          setCitasFiltradas([]);
        }
      } else {
        console.log("Formato de respuesta inesperado:", typeof response.data);
        setCitas([]);
        setCitasFiltradas([]);
      }
    } catch (err) {
      console.error("Error completo al cargar citas:", err);
      console.error("Respuesta de error:", err.response);
      setError("Error al cargar las citas médicas. Por favor, intente nuevamente.");
      setCitas([]);
      setCitasFiltradas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarMedicoLogueado = useCallback(async () => {
    try {
      const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
      console.log("Usuario en localStorage:", usuarioLocal);

      if (!usuarioLocal || !usuarioLocal.idUsuario) {
        console.log("No hay usuario logueado, redirigiendo a login");
        navigate("/login");
        return;
      }

      console.log("Obteniendo datos del médico para usuario ID:", usuarioLocal.idUsuario);

      const response = await axios.get(
        `http://localhost:8080/medico/usuario/${usuarioLocal.idUsuario}`
      );

      console.log("Datos del médico recibidos:", response.data);

      const idMedicoReal = response.data.idMedico || response.data.id_medico || response.data.Id_medico;
      console.log("ID del médico extraído:", idMedicoReal);

      setMedicoLogueado(response.data);
      localStorage.setItem("medicoLogueado", JSON.stringify(response.data));

      if (idMedicoReal) {
        console.log("Iniciando carga de citas para médico ID:", idMedicoReal);
        await cargarCitas(idMedicoReal);
      } else {
        console.error("No se pudo obtener el ID del médico del objeto:", response.data);
        setError("No se pudo identificar el ID del médico.");
      }
    } catch (err) {
      console.error("Error al cargar médico:", err);
      console.error("Detalles del error:", err.response);
      setError("Error al cargar los datos del médico. Por favor, intente nuevamente.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [navigate, cargarCitas]);

  useEffect(() => {
    cargarMedicoLogueado();
    cargarEstados();
  }, [cargarMedicoLogueado, cargarEstados]);

  // ========================================
  // FILTROS
  // ========================================
  const aplicarFiltros = useCallback(() => {
    let resultado = [...citas];

    // Filtrar por estado
    if (filtroEstado !== "TODAS") {
      resultado = resultado.filter(cita => {
        const idEstadoCita = cita.estado?.idEstado?.toString() || "";
        return idEstadoCita === filtroEstado;
      });
    }

    // Filtrar por fecha
    if (filtroFecha) {
      resultado = resultado.filter(cita => cita.fecha === filtroFecha);
    }

    // Filtrar por nombre de paciente
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
  // MANEJO DE MODALES
  // ========================================
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

  // ========================================
  // ACTUALIZAR ESTADO
  // ========================================
  const actualizarEstadoCita = async () => {
    if (!citaSeleccionada || !nuevoEstado) return;

    try {
      const idCita = citaSeleccionada.idCita || citaSeleccionada.id_cita;
      
      const citaActualizada = {
        paciente: { 
          idPaciente: citaSeleccionada.paciente?.idPaciente 
        },
        medico: { 
          id_medico: citaSeleccionada.medico?.id_medico || citaSeleccionada.medico?.idMedico 
        },
        fecha: citaSeleccionada.fecha,
        hora: citaSeleccionada.hora,
        motivo: citaSeleccionada.motivo,
        estado: { 
          idEstado: parseInt(nuevoEstado) 
        }
      };
      
      console.log("Enviando actualización de cita ID:", idCita);
      console.log("Datos a enviar:", citaActualizada);
      
      await citaService.actualizarCita(idCita, citaActualizada);
      
      setSuccess("Estado de la cita actualizado exitosamente");
      
      const idMedico = medicoLogueado.idMedico || medicoLogueado.id_medico;
      await cargarCitas(idMedico);
      
      cerrarModalEstado();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      console.error("Respuesta del servidor:", err.response?.data);
      
      const mensajeError = typeof err.response?.data === 'string' 
        ? err.response.data 
        : err.response?.data?.message || "Error al actualizar el estado de la cita.";
        
      setError(mensajeError);
      setTimeout(() => setError(""), 5000);
    }
  };

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("medicoLogueado");
    navigate("/");
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
      "PROGRAMADA": "estado-programada",
      "CONFIRMADA": "estado-confirmada",
      "EN_CURSO": "estado-en-curso",
      "COMPLETADA": "estado-completada",
      "CANCELADA": "estado-cancelada",
      "NO_ASISTIO": "estado-no-asistio"
    };
    return colores[nombreEstado] || "estado-default";
  };

  const obtenerTextoEstado = (estado) => {
    if (typeof estado === 'object' && estado !== null) {
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
    const citasHoy = citas.filter(c => c.fecha === hoy).length;
    const programadas = citas.filter(c => {
      const nombreEstado = c.estado?.nombreEstado || "";
      return nombreEstado === "PROGRAMADA" || nombreEstado === "CONFIRMADA";
    }).length;
    const completadas = citas.filter(c => c.estado?.nombreEstado === "COMPLETADA").length;

    return { total, citasHoy, programadas, completadas };
  };

  const stats = calcularEstadisticas();

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <div className="citas-medico-root">
        <Sidebar usuario={medicoLogueado?.usuario} onLogout={handleLogout} />
        <div className="main-area">
          <Navbar medico={medicoLogueado} onLogout={handleLogout} />
          <main className="content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando citas médicas...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !medicoLogueado) {
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

  return (
    <div className="citas-medico-root">
      {/* Íconos translúcidos de fondo */}
      <img src="/icons/stetho.svg" className="bg-icon i1" alt="" />
      <img src="/icons/microscope.svg" className="bg-icon i2" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i3" alt="" />

      {/* Sidebar */}
      <Sidebar usuario={medicoLogueado?.usuario} onLogout={handleLogout} />

      {/* Área principal */}
      <div className="main-area">
        {/* Navbar */}
        <Navbar medico={medicoLogueado} onLogout={handleLogout} />

        {/* Contenido */}
        <main className="content">
          <div className="citas-card">
            {/* Encabezado */}
            <div className="card-header">
              <div className="header-content">
                <h1 className="title">Citas Médicas</h1>
                <p className="subtitle">
                  Gestione y consulte todas sus citas programadas
                </p>
                {medicoLogueado && (
                  <p className="medico-info">
                    <strong>Médico:</strong> Dr. {medicoLogueado.usuario?.nombre}{" "}
                    {medicoLogueado.usuario?.apellido} -{" "}
                    <span className="especialidad">{medicoLogueado.especialidad}</span>
                  </p>
                )}
              </div>
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

            {/* Estadísticas */}
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

            {/* Filtros */}
            <div className="filtros-section">
              <div className="filtros-grid">
                <div className="filtro-group">
                  <label>Estado</label>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="TODAS">Todas</option>
                    {estadosDisponibles.map(estado => (
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

            {/* Lista de Citas */}
            <div className="citas-list">
              {citasFiltradas.length > 0 ? (
                citasFiltradas.map((cita) => (
                  <div key={cita.idCita || cita.id_cita} className="cita-item">
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
                      {(cita.estado?.nombreEstado !== "COMPLETADA" && 
                        cita.estado?.nombreEstado !== "CANCELADA") && (
                        <button
                          className="btn-action btn-estado"
                          onClick={() => abrirModalEstado(cita)}
                        >
                          🔄 Cambiar Estado
                        </button>
                      )}
                    </div>
                  </div>
                ))
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

      {/* Modal de Detalles */}
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
                      {citaSeleccionada.paciente?.usuario?.nombre} {citaSeleccionada.paciente?.usuario?.apellido}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Documento:</span>
                    <span className="detalle-value">{citaSeleccionada.paciente?.usuario?.numeroDocumento || "N/A"}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Teléfono:</span>
                    <span className="detalle-value">{citaSeleccionada.paciente?.usuario?.telefono || "N/A"}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Correo:</span>
                    <span className="detalle-value">{citaSeleccionada.paciente?.usuario?.correo || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-section">
                <h3>Motivo de Consulta</h3>
                <p className="motivo-texto">{citaSeleccionada.motivo || "No especificado"}</p>
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

      {/* Modal de Cambiar Estado */}
      {showModalEstado && citaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModalEstado}>
          <div className="modal-content modal-estado" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar Estado de la Cita</h2>
              <button className="modal-close" onClick={cerrarModalEstado}>✕</button>
            </div>

            <div className="modal-body">
              <div className="cita-info-resumen">
                <p><strong>Paciente:</strong> {citaSeleccionada.paciente?.usuario?.nombre} {citaSeleccionada.paciente?.usuario?.apellido}</p>
                <p><strong>Fecha:</strong> {formatearFecha(citaSeleccionada.fecha)} - {formatearHora(citaSeleccionada.hora)}</p>
                <p><strong>Estado Actual:</strong> <span className={`estado-badge ${obtenerColorEstado(citaSeleccionada.estado)}`}>{obtenerTextoEstado(citaSeleccionada.estado)}</span></p>
              </div>

              <div className="form-group">
                <label>Nuevo Estado</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="estado-select"
                >
                  <option value="">Seleccione un estado</option>
                  {estadosDisponibles.map(estado => (
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