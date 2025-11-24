import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import disponibilidadService from "../../../services/disponibilidadService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./DisponibilidadForm.scss";
import Swal from "sweetalert2";

export default function DisponibilidadForm() {
  const navigate = useNavigate();
  
  // Estados principales
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Datos del médico logueado
  const [medicoLogueado, setMedicoLogueado] = useState(null);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    id_medico: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: ""
  });

  const [formErrors, setFormErrors] = useState({});

  // Confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [disponibilidadAEliminar, setDisponibilidadAEliminar] = useState(null);

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  const cargarDisponibilidades = useCallback(async (idMedico) => {
    if (!idMedico) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await disponibilidadService.getDisponibilidadByMedico(idMedico);

      if (Array.isArray(response.data)) {
        const ordenadas = response.data.sort((a, b) => 
          new Date(b.fecha) - new Date(a.fecha)
        );
        setDisponibilidades(ordenadas);
      } else if (typeof response.data === 'string') {
        setDisponibilidades([]);
      } else {
        setDisponibilidades([]);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.data?.includes("No se encontr")) {
        setDisponibilidades([]);
      } else {
        setError("Error al cargar las disponibilidades.");
        Swal.fire({
          icon: "error",
          title: "Error al cargar disponibilidades",
          text: "No se pudieron cargar las disponibilidades. Por favor, intente nuevamente.",
          confirmButtonColor: "#d33",
        });
      }
      setDisponibilidades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarMedicoLogueado = useCallback(async () => {
    try {
      const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

      if (!usuarioLocal || !usuarioLocal.idUsuario) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/medico/usuario/${usuarioLocal.idUsuario}`
      );

      const idMedicoReal = response.data.idMedico || response.data.id_medico || response.data.Id_medico;

      if (!idMedicoReal) {
        setError("No se pudo identificar el ID del médico.");
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error de identificación",
          text: "No se pudo identificar el ID del médico.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      setMedicoLogueado(response.data);
      
      setFormData(prev => ({ 
        ...prev, 
        id_medico: idMedicoReal 
      }));
      
      localStorage.setItem("medicoLogueado", JSON.stringify({
        ...response.data,
        idMedico: idMedicoReal
      }));

      if (idMedicoReal) {
        await cargarDisponibilidades(idMedicoReal);
      } else {
        setError("No se pudo identificar el ID del médico.");
        setLoading(false);
      }
    } catch {
      setError("Error al cargar los datos del médico. Por favor, intente nuevamente.");
      setLoading(false);
      
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "Error al cargar los datos del médico. Redirigiendo al login...",
        confirmButtonColor: "#d33",
        timer: 2000,
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [navigate, cargarDisponibilidades]);

  useEffect(() => {
    cargarMedicoLogueado();
  }, [cargarMedicoLogueado]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("medicoLogueado");
    navigate("/");
  }, [navigate]);

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

    if (!formData.fecha) {
      errors.fecha = "Debe seleccionar una fecha";
    }

    if (!formData.hora_inicio) {
      errors.hora_inicio = "Debe seleccionar una hora de inicio";
    }

    if (!formData.hora_fin) {
      errors.hora_fin = "Debe seleccionar una hora de fin";
    }

    if (formData.hora_inicio && formData.hora_fin) {
      if (formData.hora_inicio >= formData.hora_fin) {
        errors.hora_fin = "La hora de fin debe ser posterior a la hora de inicio";
      }
    }

    // Verificar solapamiento
    const solapamiento = disponibilidades.find(disp => {
      if (selectedDisponibilidad && disp.id_disponibilidad === selectedDisponibilidad.id_disponibilidad) {
        return false;
      }
      
      if (disp.fecha !== formData.fecha) {
        return false;
      }

      const inicioExistente = disp.hora_inicio;
      const finExistente = disp.hora_fin;
      const nuevoInicio = formData.hora_inicio;
      const nuevoFin = formData.hora_fin;

      return (
        (nuevoInicio >= inicioExistente && nuevoInicio < finExistente) ||
        (nuevoFin > inicioExistente && nuevoFin <= finExistente) ||
        (nuevoInicio <= inicioExistente && nuevoFin >= finExistente)
      );
    });

    if (solapamiento) {
      errors.hora_inicio = "Ya existe una disponibilidad en este horario";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========================================
  // CRUD OPERATIONS
  // ========================================
  const abrirModalCrear = () => {
    const idMedico = medicoLogueado?.idMedico || medicoLogueado?.id_medico;
    
    if (!idMedico) {
      setError("No se pudo identificar el ID del médico. Por favor, recargue la página.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo identificar el ID del médico. Por favor, recargue la página.",
        confirmButtonColor: "#d33",
      });
      return;
    }
    
    setModalMode("create");
    setSelectedDisponibilidad(null);
    setFormData({
      id_medico: idMedico,
      fecha: "",
      hora_inicio: "",
      hora_fin: ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const abrirModalEditar = (disponibilidad) => {
    setModalMode("edit");
    setSelectedDisponibilidad(disponibilidad);
    
    // ✅ Formatear las horas para el input type="time" (solo HH:mm)
    const formatearParaInput = (hora) => {
      if (!hora) return "";
      // Si ya tiene formato HH:mm:ss, extraer solo HH:mm
      return hora.substring(0, 5);
    };
    
    setFormData({
      id_medico: disponibilidad.id_medico || medicoLogueado?.idMedico || medicoLogueado?.id_medico,
      fecha: disponibilidad.fecha,
      hora_inicio: formatearParaInput(disponibilidad.hora_inicio),
      hora_fin: formatearParaInput(disponibilidad.hora_fin)
    });
    setFormErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedDisponibilidad(null);
    setFormData({
      id_medico: medicoLogueado?.idMedico || medicoLogueado?.id_medico || "",
      fecha: "",
      hora_inicio: "",
      hora_fin: ""
    });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    const idUsuarioEditor = usuarioLocal?.idUsuario;

    if (!idUsuarioEditor) {
      setError("No se pudo identificar el usuario.");
      Swal.fire({
        icon: "error",
        title: "Usuario no identificado",
        text: "No se pudo identificar el usuario.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const idMedicoParaEnviar =
      formData.id_medico ||
      medicoLogueado?.idMedico ||
      medicoLogueado?.id_medico;

    if (!idMedicoParaEnviar) {
      setError("No se encontró el ID del médico.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el ID del médico.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // ✅ CONSTRUIR EL PAYLOAD CORRECTAMENTE
    // Función para asegurar formato HH:mm:ss
    const formatearHoraParaBackend = (hora) => {
      if (!hora) return "";
      // Si ya tiene formato HH:mm:ss, retornarlo tal cual
      if (hora.length === 8 && hora.split(':').length === 3) {
        return hora;
      }
      // Si tiene formato HH:mm, agregar :00
      if (hora.length === 5 && hora.split(':').length === 2) {
        return hora + ":00";
      }
      // Por defecto, agregar :00
      return hora + ":00";
    };

    const payload = {
      medico: {
        id_medico: idMedicoParaEnviar,
      },
      fecha: formData.fecha,
      hora_inicio: formatearHoraParaBackend(formData.hora_inicio),
      hora_fin: formatearHoraParaBackend(formData.hora_fin),
    };

    // ✅ SI ES EDICIÓN, AGREGAR EL ID DESDE EL INICIO
    if (modalMode === "edit") {
      payload.id_disponibilidad = selectedDisponibilidad.id_disponibilidad;
    }

    try {
      if (modalMode === "create") {
        await disponibilidadService.crearDisponibilidad(payload, idUsuarioEditor);
        setSuccess("Disponibilidad creada exitosamente");
        
        Swal.fire({
          icon: "success",
          title: "Disponibilidad creada",
          text: "La disponibilidad fue creada exitosamente.",
          confirmButtonColor: "#3085d6",
          timer: 2000,
        });
      } else {
        await disponibilidadService.actualizarDisponibilidad(payload, idUsuarioEditor);
        setSuccess("Disponibilidad actualizada exitosamente");
        
        Swal.fire({
          icon: "success",
          title: "Disponibilidad actualizada",
          text: "La disponibilidad fue actualizada correctamente.",
          confirmButtonColor: "#3085d6",
          timer: 2000,
        });
      }

      await cargarDisponibilidades(idMedicoParaEnviar);
      cerrarModal();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error completo:", err.response?.data || err);
      setError("Error al guardar la disponibilidad");
      
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: err.response?.data || "Error al guardar la disponibilidad. Por favor, intente nuevamente.",
        confirmButtonColor: "#d33",
      });
      
      setTimeout(() => setError(""), 5000);
    }
  };

  const confirmarEliminar = (disponibilidad) => {
    setDisponibilidadAEliminar(disponibilidad);
    setShowConfirmModal(true);
  };

  const eliminarDisponibilidad = async () => {
    if (!disponibilidadAEliminar) return;

    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    const idUsuarioEditor = usuarioLocal?.idUsuario;

    if (!idUsuarioEditor) {
      setError("No se pudo identificar el usuario.");
      Swal.fire({
        icon: "error",
        title: "Usuario no identificado",
        text: "No se pudo identificar el usuario.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      await disponibilidadService.eliminarDisponibilidad(
        disponibilidadAEliminar.id_disponibilidad,
        idUsuarioEditor
      );
      setSuccess("Disponibilidad eliminada exitosamente");
      
      const idMedico = medicoLogueado.idMedico || medicoLogueado.id_medico;
      await cargarDisponibilidades(idMedico);
      setShowConfirmModal(false);
      setDisponibilidadAEliminar(null);
      
      Swal.fire({
        icon: "success",
        title: "Disponibilidad eliminada",
        text: "La disponibilidad fue eliminada exitosamente.",
        confirmButtonColor: "#3085d6",
        timer: 2000,
      });
      
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Error al eliminar la disponibilidad.");
      
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: "Error al eliminar la disponibilidad. Por favor, intente nuevamente.",
        confirmButtonColor: "#d33",
      });
      
      setTimeout(() => setError(""), 5000);
    }
  };

  // ========================================
  // UTILIDADES
  // ========================================
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "N/A";
    try {
      const fecha = new Date(fechaString + 'T00:00:00');
      return fecha.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
      });
    } catch {
      return fechaString;
    }
  };

  const formatearHora = (horaString) => {
    if (!horaString) return "N/A";
    return horaString.substring(0, 5);
  };

  // Agrupar disponibilidades por fecha
  const disponibilidadesAgrupadas = disponibilidades.reduce((acc, disp) => {
    const fecha = disp.fecha;
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(disp);
    return acc;
  }, {});

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <div className="disponibilidad-root">
        <Sidebar usuario={medicoLogueado?.usuario} onLogout={handleLogout} />
        <div className="main-area">
          <Navbar medico={medicoLogueado} onLogout={handleLogout} />
          <main className="content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando disponibilidades...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !medicoLogueado) {
    return (
      <div className="disponibilidad-root">
        <div className="error-container-full">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => navigate("/login")} 
            className="btn-retry"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="disponibilidad-root">
      <img src="/icons/stetho.svg" className="bg-icon i1" alt="" />
      <img src="/icons/microscope.svg" className="bg-icon i2" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={medicoLogueado?.usuario} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar medico={medicoLogueado} onLogout={handleLogout} />

        <main className="content">
          <div className="disponibilidad-card">
            <div className="card-header">
              <div className="header-content">
                <h1 className="title">Gestión de Disponibilidad</h1>
                <p className="subtitle">
                  Configure sus horarios de atención por fecha
                </p>
                {medicoLogueado && (
                  <p className="medico-info">
                    <strong>Médico:</strong> Dr. {medicoLogueado.usuario?.nombre}{" "}
                    {medicoLogueado.usuario?.apellido} -{" "}
                    <span className="especialidad">{medicoLogueado.especialidad}</span>
                  </p>
                )}
              </div>
              <button className="btn-nuevo" onClick={abrirModalCrear}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nueva Disponibilidad
              </button>
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

            <div className="disponibilidad-calendar">
              {Object.keys(disponibilidadesAgrupadas).length > 0 ? (
                Object.keys(disponibilidadesAgrupadas).sort().map((fecha) => (
                  <div key={fecha} className="dia-card">
                    <div className="dia-header">
                      <h3>{formatearFecha(fecha)}</h3>
                      <span className="count-badge">
                        {disponibilidadesAgrupadas[fecha].length}
                      </span>
                    </div>

                    <div className="horarios-list">
                      {disponibilidadesAgrupadas[fecha].map((disp) => (
                        <div key={disp.id_disponibilidad} className="horario-item">
                          <div className="horario-info">
                            <span className="hora-inicio">{formatearHora(disp.hora_inicio)}</span>
                            <span className="separador">→</span>
                            <span className="hora-fin">{formatearHora(disp.hora_fin)}</span>
                          </div>
                          <div className="horario-actions">
                            <button
                              className="btn-action btn-editar"
                              onClick={() => abrirModalEditar(disp)}
                              title="Editar disponibilidad"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-eliminar"
                              onClick={() => confirmarEliminar(disp)}
                              title="Eliminar disponibilidad"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-horarios-global">
                  <span className="icon">📅</span>
                  <h3>No hay disponibilidades registradas</h3>
                  <p>Agregue horarios de atención para sus pacientes</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "create"
                  ? "Nueva Disponibilidad"
                  : "Editar Disponibilidad"}
              </h2>
              <button className="modal-close" onClick={cerrarModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className={formErrors.fecha ? "error" : ""}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.fecha && (
                  <span className="error-message">{formErrors.fecha}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora de Inicio *</label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleInputChange}
                    className={formErrors.hora_inicio ? "error" : ""}
                  />
                  {formErrors.hora_inicio && (
                    <span className="error-message">{formErrors.hora_inicio}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Hora de Fin *</label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleInputChange}
                    className={formErrors.hora_fin ? "error" : ""}
                  />
                  {formErrors.hora_fin && (
                    <span className="error-message">{formErrors.hora_fin}</span>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {modalMode === "create" ? "Crear" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div
            className="modal-content modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">⚠️</div>
            <h2>¿Eliminar disponibilidad?</h2>
            <p>
              Se eliminará el horario del{" "}
              <strong>{formatearFecha(disponibilidadAEliminar?.fecha)}</strong> de{" "}
              <strong>{formatearHora(disponibilidadAEliminar?.hora_inicio)}</strong> a{" "}
              <strong>{formatearHora(disponibilidadAEliminar?.hora_fin)}</strong>
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={eliminarDisponibilidad}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}