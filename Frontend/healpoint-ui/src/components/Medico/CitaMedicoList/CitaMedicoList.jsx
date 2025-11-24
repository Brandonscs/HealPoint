import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import citaService from "../../../services/citaService";
import estadoService from "../../../services/estadoService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./CitaMedicoList.scss";
import Swal from "sweetalert2";

export default function CitaList() {
  const navigate = useNavigate();

  // Estados principales
  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Datos del paciente logueado
  const [pacienteLogueado, setPacienteLogueado] = useState(null);

  // Estados disponibles desde la BD
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [busquedaMedico, setBusquedaMedico] = useState("");

  // Modal de detalles
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

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
    } catch {
      setEstadosDisponibles([]);
      Swal.fire({
        icon: "error",
        title: "Error al cargar estados",
        text: "No se pudieron cargar los estados de las citas.",
        confirmButtonColor: "#d33",
      });
    }
  }, []);

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  const cargarCitas = useCallback(async (idPaciente) => {
    if (!idPaciente) {
      setError("No se pudo identificar el ID del paciente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      console.log("Cargando citas para paciente ID:", idPaciente);
      const response = await citaService.getCitasPorPaciente(idPaciente);

      console.log("Respuesta del servicio:", response);

      if (typeof response.data === 'string') {
        // Si es un string, significa que no hay citas
        console.log("No hay citas:", response.data);
        setCitas([]);
        setCitasFiltradas([]);
      } else if (Array.isArray(response.data)) {
        if (response.data.length > 0) {
          console.log("Citas encontradas:", response.data.length);
          const ordenadas = response.data.sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora}`);
            const fechaB = new Date(`${b.fecha}T${b.hora}`);
            return fechaB - fechaA;
          });
          setCitas(ordenadas);
          setCitasFiltradas(ordenadas);
        } else {
          console.log("Array de citas vacío");
          setCitas([]);
          setCitasFiltradas([]);
        }
      } else {
        console.log("Respuesta no esperada:", response.data);
        setCitas([]);
        setCitasFiltradas([]);
      }
    } catch (error) {
      console.error("Error al cargar citas:", error);
      setError("Error al cargar las citas. Por favor, intente nuevamente.");
      setCitas([]);
      setCitasFiltradas([]);
      
      Swal.fire({
        icon: "error",
        title: "Error al cargar citas",
        text: "No se pudieron cargar las citas. Por favor, intente nuevamente.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDatosIniciales = useCallback(async () => {
    try {
      const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

      if (!usuarioLocal || !usuarioLocal.idUsuario) {
        navigate("/login");
        return;
      }

      console.log("Usuario logueado:", usuarioLocal);

      // Si el usuario tiene información de paciente en localStorage, la usamos
      const pacienteLocal = JSON.parse(localStorage.getItem("pacienteLogueado"));
      
      if (pacienteLocal) {
        setPacienteLogueado(pacienteLocal);
        const idPaciente = pacienteLocal.idPaciente || pacienteLocal.id_paciente;
        if (idPaciente) {
          await cargarCitas(idPaciente);
        } else {
          setError("No se pudo identificar el ID del paciente.");
        }
      } else {
        // Si no hay paciente en localStorage, asumimos que el usuario ES el paciente
        // y usamos el ID de usuario como referencia (esto depende de tu lógica de negocio)
        setPacienteLogueado({
          idPaciente: usuarioLocal.idUsuario, // O el campo correcto según tu BD
          usuario: usuarioLocal
        });
        await cargarCitas(usuarioLocal.idUsuario);
      }

    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      setError("Error al cargar los datos. Por favor, intente nuevamente.");

      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "Error al cargar los datos. Redirigiendo al login...",
        confirmButtonColor: "#d33",
        timer: 2000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [navigate, cargarCitas]);

  useEffect(() => {
    cargarDatosIniciales();
    cargarEstados();
  }, [cargarDatosIniciales, cargarEstados]);

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

    if (busquedaMedico.trim()) {
      const busqueda = busquedaMedico.toLowerCase();
      resultado = resultado.filter(cita => {
        const nombreCompleto = `${cita.medico?.usuario?.nombre || ""} ${cita.medico?.usuario?.apellido || ""}`.toLowerCase();
        return nombreCompleto.includes(busqueda);
      });
    }

    setCitasFiltradas(resultado);
  }, [filtroEstado, filtroFecha, busquedaMedico, citas]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const limpiarFiltros = () => {
    setFiltroEstado("TODAS");
    setFiltroFecha("");
    setBusquedaMedico("");
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

  // ========================================
  // CANCELAR CITA
  // ========================================
  const cancelarCita = async (cita) => {
    if (!cita) return;

    const confirmacion = await Swal.fire({
      title: '¿Cancelar cita?',
      text: `¿Está seguro de cancelar la cita con el Dr. ${cita.medico?.usuario?.nombre} ${cita.medico?.usuario?.apellido}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const idCita = cita.idCita || cita.id_cita;
      
      console.log("Cancelando cita ID:", idCita);
      
      // Actualizar estado a Cancelada (ID 5)
      const citaActualizada = {
        paciente: { 
          idPaciente: cita.paciente?.idPaciente 
        },
        medico: { 
          id_medico: cita.medico?.id_medico || cita.medico?.idMedico 
        },
        fecha: cita.fecha,
        hora: cita.hora,
        motivo: cita.motivo,
        estado: { 
          idEstado: 5 // ID para estado "Cancelada"
        }
      };
      
      console.log("Datos para actualizar:", citaActualizada);
      
      await citaService.actualizarCita(idCita, citaActualizada);
      
      setSuccess("Cita cancelada exitosamente");
      
      // Recargar citas
      const idPaciente = pacienteLogueado?.idPaciente || pacienteLogueado?.id_paciente;
      if (idPaciente) {
        await cargarCitas(idPaciente);
      }

      Swal.fire({
        icon: "success",
        title: "Cita cancelada",
        text: "La cita fue cancelada correctamente.",
        confirmButtonColor: "#3085d6",
        timer: 2000,
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al cancelar cita:", err);
      const mensajeError = typeof err.response?.data === 'string' 
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

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("pacienteLogueado");
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
      "NO_ASISTIO": "estado-no-asistio",
      "Pendiente": "estado-pendiente"
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
    const pendientes = citas.filter(c => {
      const nombreEstado = c.estado?.nombreEstado || "";
      return nombreEstado === "PROGRAMADA" || nombreEstado === "CONFIRMADA" || nombreEstado === "Pendiente";
    }).length;
    const canceladas = citas.filter(c => c.estado?.nombreEstado === "CANCELADA").length;
    const completadas = citas.filter(c => c.estado?.nombreEstado === "COMPLETADA").length;

    return { total, pendientes, canceladas, completadas };
  };

  const stats = calcularEstadisticas();

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <div className="citas-paciente-root">
        <Sidebar usuario={pacienteLogueado?.usuario} onLogout={handleLogout} />
        <div className="main-area">
          <Navbar paciente={pacienteLogueado} onLogout={handleLogout} />
          <main className="content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando mis citas...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !pacienteLogueado) {
    return (
      <div className="citas-paciente-root">
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
    <div className="citas-paciente-root">
      <img src="/icons/stetho.svg" className="bg-icon i1" alt="" />
      <img src="/icons/microscope.svg" className="bg-icon i2" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={pacienteLogueado?.usuario} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar paciente={pacienteLogueado} onLogout={handleLogout} />

        <main className="content">
          <div className="citas-card">
            <div className="card-header">
              <div className="header-content">
                <h1 className="title">Mis Citas</h1>
                <p className="subtitle">
                  Consulte y gestione todas sus citas médicas
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
                <div className="stat-icon">🕐</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.pendientes}</span>
                  <span className="stat-label">Pendientes</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.canceladas}</span>
                  <span className="stat-label">Canceladas</span>
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
                  <label>Buscar Médico</label>
                  <input
                    type="text"
                    placeholder="Nombre del médico..."
                    value={busquedaMedico}
                    onChange={(e) => setBusquedaMedico(e.target.value)}
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
                      <div className="medico-info">
                        <h3 className="medico-nombre">
                          Dr. {cita.medico?.usuario?.nombre} {cita.medico?.usuario?.apellido}
                        </h3>
                        <p className="medico-especialidad">
                          <strong>Especialidad:</strong> {cita.medico?.especialidad || "No especificada"}
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
                      {(cita.estado?.nombreEstado === "PROGRAMADA" || 
                        cita.estado?.nombreEstado === "CONFIRMADA" ||
                        cita.estado?.nombreEstado === "Pendiente") && (
                        <button
                          className="btn-action btn-cancelar"
                          onClick={() => cancelarCita(cita)}
                        >
                          ❌ Cancelar
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
                <h3>Información del Médico</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Nombre:</span>
                    <span className="detalle-value">
                      Dr. {citaSeleccionada.medico?.usuario?.nombre} {citaSeleccionada.medico?.usuario?.apellido}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Especialidad:</span>
                    <span className="detalle-value">{citaSeleccionada.medico?.especialidad || "N/A"}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Teléfono:</span>
                    <span className="detalle-value">{citaSeleccionada.medico?.usuario?.telefono || "N/A"}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Correo:</span>
                    <span className="detalle-value">{citaSeleccionada.medico?.usuario?.correo || "N/A"}</span>
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
    </div>
  );
}