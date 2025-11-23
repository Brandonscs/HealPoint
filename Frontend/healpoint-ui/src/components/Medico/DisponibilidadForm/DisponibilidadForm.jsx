import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import disponibilidadService from "../../../services/disponibilidadService";
import "./DisponibilidadForm.scss";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";

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
  const [modalMode, setModalMode] = useState("create"); // 'create' o 'edit'
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    idMedico: "",
    diaSemana: "",
    horaInicio: "",
    horaFin: "",
    estado: "DISPONIBLE"
  });

  const [formErrors, setFormErrors] = useState({});

  // Confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [disponibilidadAEliminar, setDisponibilidadAEliminar] = useState(null);

  // Días de la semana
  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo"
  ];

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
  const cargarDisponibilidades = useCallback(async (idMedico) => {
    if (!idMedico) return;

    try {
      setLoading(true);
      setError("");
      const response = await disponibilidadService.getDisponibilidadByMedico(idMedico);

      if (Array.isArray(response.data)) {
        // Ordenar por día de semana
        const ordenDias = {
          Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4,
          Viernes: 5, Sábado: 6, Domingo: 7
        };
        const ordenadas = response.data.sort((a, b) => 
          (ordenDias[a.diaSemana] || 99) - (ordenDias[b.diaSemana] || 99)
        );
        setDisponibilidades(ordenadas);
      } else {
        setDisponibilidades([]);
      }
    } catch (err) {
      console.error("Error al cargar disponibilidades:", err);
      setError("Error al cargar las disponibilidades.");
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

      // Obtener el médico usando el idUsuario
      const response = await axios.get(
        `http://localhost:8080/medico/usuario/${usuarioLocal.idUsuario}`
      );

      setMedicoLogueado(response.data);
      setFormData(prev => ({ ...prev, idMedico: response.data.idMedico }));
      
      // Guardar en localStorage para uso futuro
      localStorage.setItem("medicoLogueado", JSON.stringify(response.data));

      // Cargar disponibilidades después de obtener el médico
      cargarDisponibilidades(response.data.idMedico);
    } catch (err) {
      console.error("Error al cargar médico:", err);
      setError("Error al cargar los datos del médico. Por favor, intente nuevamente.");
      
      // Si falla, redirigir al login después de un momento
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

    if (!formData.diaSemana) {
      errors.diaSemana = "Debe seleccionar un día de la semana";
    }

    if (!formData.horaInicio) {
      errors.horaInicio = "Debe seleccionar una hora de inicio";
    }

    if (!formData.horaFin) {
      errors.horaFin = "Debe seleccionar una hora de fin";
    }

    if (formData.horaInicio && formData.horaFin) {
      if (formData.horaInicio >= formData.horaFin) {
        errors.horaFin = "La hora de fin debe ser posterior a la hora de inicio";
      }
    }

    // Verificar solapamiento con otras disponibilidades
    const solapamiento = disponibilidades.find(disp => {
      if (selectedDisponibilidad && disp.idDisponibilidad === selectedDisponibilidad.idDisponibilidad) {
        return false; // Ignorar la misma disponibilidad al editar
      }
      
      if (disp.diaSemana !== formData.diaSemana) {
        return false;
      }

      const inicioExistente = disp.horaInicio;
      const finExistente = disp.horaFin;
      const nuevoInicio = formData.horaInicio;
      const nuevoFin = formData.horaFin;

      return (
        (nuevoInicio >= inicioExistente && nuevoInicio < finExistente) ||
        (nuevoFin > inicioExistente && nuevoFin <= finExistente) ||
        (nuevoInicio <= inicioExistente && nuevoFin >= finExistente)
      );
    });

    if (solapamiento) {
      errors.horaInicio = "Ya existe una disponibilidad en este horario";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========================================
  // CRUD OPERATIONS
  // ========================================
  const abrirModalCrear = () => {
    setModalMode("create");
    setSelectedDisponibilidad(null);
    setFormData({
      idMedico: medicoLogueado.idMedico,
      diaSemana: "",
      horaInicio: "",
      horaFin: "",
      estado: "DISPONIBLE"
    });
    setFormErrors({});
    setShowModal(true);
  };

  const abrirModalEditar = (disponibilidad) => {
    setModalMode("edit");
    setSelectedDisponibilidad(disponibilidad);
    setFormData({
      idMedico: disponibilidad.medico?.idMedico || medicoLogueado.idMedico,
      diaSemana: disponibilidad.diaSemana,
      horaInicio: disponibilidad.horaInicio,
      horaFin: disponibilidad.horaFin,
      estado: disponibilidad.estado || "DISPONIBLE"
    });
    setFormErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedDisponibilidad(null);
    setFormData({
      idMedico: medicoLogueado?.idMedico || "",
      diaSemana: "",
      horaInicio: "",
      horaFin: "",
      estado: "DISPONIBLE"
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
        medico: { idMedico: formData.idMedico },
        diaSemana: formData.diaSemana,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        estado: formData.estado
      };

      if (modalMode === "create") {
        await disponibilidadService.crearDisponibilidad(payload, idUsuarioEditor);
        setSuccess("Disponibilidad creada exitosamente");
      } else {
        payload.idDisponibilidad = selectedDisponibilidad.idDisponibilidad;
        await disponibilidadService.actualizarDisponibilidad(payload, idUsuarioEditor);
        setSuccess("Disponibilidad actualizada exitosamente");
      }

      await cargarDisponibilidades(medicoLogueado.idMedico);
      cerrarModal();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al guardar disponibilidad:", err);
      setError("Error al guardar la disponibilidad. Por favor, intente nuevamente.");
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
      return;
    }

    try {
      await disponibilidadService.eliminarDisponibilidad(
        disponibilidadAEliminar.idDisponibilidad,
        idUsuarioEditor
      );
      setSuccess("Disponibilidad eliminada exitosamente");
      await cargarDisponibilidades(medicoLogueado.idMedico);
      setShowConfirmModal(false);
      setDisponibilidadAEliminar(null);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al eliminar disponibilidad:", err);
      setError("Error al eliminar la disponibilidad.");
      setTimeout(() => setError(""), 5000);
    }
  };

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <div className="disponibilidad-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando disponibilidades...</p>
        </div>
      </div>
    );
  }

  if (error && !medicoLogueado) {
    return (
      <div className="disponibilidad-container">
        <div className="error-container">
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
    <div className="disponibilidad-container">
      <div className="disponibilidad-card">
        {/* Sidebar */}
              <Sidebar usuario={medicoLogueado?.usuario} onLogout={handleLogout} />
        {/* Encabezado */}
        {/* Navbar global */}
                <Navbar medico={medicoLogueado} onLogout={handleLogout} />
        <div className="card-header">
          <div className="header-content">
            <h1 className="title">Gestión de Disponibilidad</h1>
            <p className="subtitle">
              Configure sus horarios de atención para cada día de la semana
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
            <span className="btn-icon">➕</span>
            Nueva Disponibilidad
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

        {/* Calendario de Disponibilidad */}
        <div className="disponibilidad-calendar">
          {diasSemana.map((dia) => {
            const disponibilidadesDia = disponibilidades.filter(
              (d) => d.diaSemana === dia
            );

            return (
              <div key={dia} className="dia-card">
                <div className="dia-header">
                  <h3>{dia}</h3>
                  <span className="count-badge">
                    {disponibilidadesDia.length}
                  </span>
                </div>

                <div className="horarios-list">
                  {disponibilidadesDia.length > 0 ? (
                    disponibilidadesDia.map((disp) => (
                      <div key={disp.idDisponibilidad} className="horario-item">
                        <div className="horario-info">
                          <span className="hora-inicio">{disp.horaInicio}</span>
                          <span className="separador">→</span>
                          <span className="hora-fin">{disp.horaFin}</span>
                        </div>
                        <div className="horario-actions">
                          <button
                            className="btn-action btn-editar"
                            onClick={() => abrirModalEditar(disp)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action btn-eliminar"
                            onClick={() => confirmarEliminar(disp)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-horarios">
                      <span className="icon">📅</span>
                      <p>Sin disponibilidad</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Crear/Editar */}
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
                <label>Día de la Semana *</label>
                <select
                  name="diaSemana"
                  value={formData.diaSemana}
                  onChange={handleInputChange}
                  className={formErrors.diaSemana ? "error" : ""}
                >
                  <option value="">Seleccione un día</option>
                  {diasSemana.map((dia) => (
                    <option key={dia} value={dia}>
                      {dia}
                    </option>
                  ))}
                </select>
                {formErrors.diaSemana && (
                  <span className="error-message">{formErrors.diaSemana}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora de Inicio *</label>
                  <input
                    type="time"
                    name="horaInicio"
                    value={formData.horaInicio}
                    onChange={handleInputChange}
                    className={formErrors.horaInicio ? "error" : ""}
                  />
                  {formErrors.horaInicio && (
                    <span className="error-message">{formErrors.horaInicio}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Hora de Fin *</label>
                  <input
                    type="time"
                    name="horaFin"
                    value={formData.horaFin}
                    onChange={handleInputChange}
                    className={formErrors.horaFin ? "error" : ""}
                  />
                  {formErrors.horaFin && (
                    <span className="error-message">{formErrors.horaFin}</span>
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

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div
            className="modal-content modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">⚠️</div>
            <h2>¿Eliminar disponibilidad?</h2>
            <p>
              Se eliminará el horario de{" "}
              <strong>{disponibilidadAEliminar?.diaSemana}</strong> de{" "}
              <strong>{disponibilidadAEliminar?.horaInicio}</strong> a{" "}
              <strong>{disponibilidadAEliminar?.horaFin}</strong>
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