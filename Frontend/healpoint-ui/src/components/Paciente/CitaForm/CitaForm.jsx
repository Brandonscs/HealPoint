import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import citaService from "../../../services/citaService";
import medicoService from "../../../services/medicoService";
import disponibilidadService from "../../../services/disponibilidadService";
import "./CitaForm.scss";

export default function CitaForm() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [verificandoDisponibilidad, setVerificandoDisponibilidad] = useState(false);
  
  const [formData, setFormData] = useState({
    idMedico: "",
    especialidad: "",
    fechaCita: "",
    horaCita: "",
    motivoConsulta: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ================================
  // CARGAR DATOS INICIALES
  // ================================
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        const pacienteLocal = JSON.parse(localStorage.getItem("pacienteLogueado"));

        if (!usuarioLocal || !pacienteLocal) {
          navigate("/login");
          return;
        }

        setUsuario(usuarioLocal);
        setPaciente(pacienteLocal);

        const respMedicos = await medicoService.getMedicos();
        
        if (!respMedicos.data || respMedicos.data.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Sin médicos disponibles",
            text: "No hay médicos registrados en el sistema actualmente.",
          });
          setLoading(false);
          return;
        }

        const medicosActivos = respMedicos.data.filter((med) => {
          if (med.estado && typeof med.estado === 'object') {
            return med.estado.idEstado === 2 || med.estado.id_estado === 2;
          }
          if (med.id_estado !== undefined) {
            return med.id_estado === 2;
          }
          if (med.idEstado !== undefined) {
            return med.idEstado === 2;
          }
          return true;
        });
        
        setMedicos(medicosActivos);

        const especialidadesUnicas = [
          ...new Set(
            medicosActivos
              .map((med) => med.especialidad)
              .filter(esp => esp && esp.trim() !== "")
          ),
        ];
        
        setEspecialidades(especialidadesUnicas.sort());
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data || "No se pudieron cargar los datos necesarios",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  // ================================
  // CARGAR HORARIOS DISPONIBLES
  // ================================
  useEffect(() => {
    const cargarHorariosDisponibles = async () => {
      if (!formData.idMedico || !formData.fechaCita) {
        setHorariosDisponibles([]);
        return;
      }

      try {
        setVerificandoDisponibilidad(true);
        
        const respDisponibilidad = await disponibilidadService.getDisponibilidadByMedico(formData.idMedico);
        
        if (!respDisponibilidad.data || typeof respDisponibilidad.data === 'string') {
          setHorariosDisponibles([]);
          Swal.fire({
            icon: "info",
            title: "Sin disponibilidad",
            text: "El médico no tiene horarios disponibles para la fecha seleccionada.",
          });
          return;
        }

        const disponibilidadesFecha = Array.isArray(respDisponibilidad.data)
          ? respDisponibilidad.data.filter(disp => disp.fecha === formData.fechaCita)
          : [];

        if (disponibilidadesFecha.length === 0) {
          setHorariosDisponibles([]);
          Swal.fire({
            icon: "info",
            title: "Sin disponibilidad",
            text: "El médico no tiene horarios disponibles para esta fecha.",
          });
          return;
        }

        const respCitas = await citaService.getCitasPorMedico(formData.idMedico);
        const citasOcupadas = Array.isArray(respCitas.data)
          ? respCitas.data
              .filter(cita => 
                cita.fecha === formData.fechaCita && 
                (cita.estado?.nombreEstado === "PENDIENTE" ||
                 cita.estado?.nombreEstado === "ACTIVA")
              )
              .map(cita => cita.hora.substring(0, 5))
          : [];

        const horariosGenerados = [];
        
        disponibilidadesFecha.forEach(disp => {
          const horaInicio = disp.hora_inicio.substring(0, 5);
          const horaFin = disp.hora_fin.substring(0, 5);
          
          const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
          const [finHora, finMin] = horaFin.split(':').map(Number);
          
          let actual = new Date(2000, 0, 1, inicioHora, inicioMin);
          const fin = new Date(2000, 0, 1, finHora, finMin);
          
          while (actual < fin) {
            const horaSlot = actual.toTimeString().substring(0, 5);
            const disponible = !citasOcupadas.includes(horaSlot);
            
            horariosGenerados.push({
              hora: horaSlot,
              disponible: disponible,
              id_disponibilidad: disp.id_disponibilidad
            });
            
            actual = new Date(actual.getTime() + 30 * 60000);
          }
        });

        setHorariosDisponibles(horariosGenerados);

        if (horariosGenerados.every(h => !h.disponible)) {
          Swal.fire({
            icon: "warning",
            title: "Todos los horarios ocupados",
            text: "Todos los horarios para esta fecha ya están ocupados. Por favor, seleccione otra fecha.",
          });
        }

      } catch (error) {
        console.error("Error al cargar horarios:", error);
        setHorariosDisponibles([]);
      } finally {
        setVerificandoDisponibilidad(false);
      }
    };

    cargarHorariosDisponibles();
  }, [formData.idMedico, formData.fechaCita]);

  // ================================
  // MANEJO DE CAMBIOS
  // ================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "especialidad") {
      setFormData((prev) => ({
        ...prev,
        especialidad: value,
        idMedico: "",
        fechaCita: "",
        horaCita: "",
      }));
      setHorariosDisponibles([]);
    }

    if (name === "idMedico") {
      setFormData((prev) => ({
        ...prev,
        idMedico: value,
        fechaCita: "",
        horaCita: "",
      }));
      setHorariosDisponibles([]);
    }

    if (name === "fechaCita") {
      setFormData((prev) => ({
        ...prev,
        fechaCita: value,
        horaCita: "",
      }));
    }
  };

  // ================================
  // VALIDACIÓN
  // ================================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.especialidad) {
      newErrors.especialidad = "Seleccione una especialidad";
    }

    if (!formData.idMedico) {
      newErrors.idMedico = "Seleccione un médico";
    }

    if (!formData.fechaCita) {
      newErrors.fechaCita = "Seleccione una fecha";
    } else {
      const fechaSeleccionada = new Date(formData.fechaCita + "T00:00:00");
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaSeleccionada < hoy) {
        newErrors.fechaCita = "La fecha no puede ser anterior a hoy";
      }
    }

    if (!formData.horaCita) {
      newErrors.horaCita = "Seleccione una hora";
    } else {
      const horarioSeleccionado = horariosDisponibles.find(h => h.hora === formData.horaCita);
      if (!horarioSeleccionado || !horarioSeleccionado.disponible) {
        newErrors.horaCita = "El horario seleccionado no está disponible";
      }
    }

    if (!formData.motivoConsulta.trim()) {
      newErrors.motivoConsulta = "Ingrese el motivo de la consulta";
    } else if (formData.motivoConsulta.length < 10) {
      newErrors.motivoConsulta = "El motivo debe tener al menos 10 caracteres";
    } else if (formData.motivoConsulta.length > 500) {
      newErrors.motivoConsulta = "El motivo no puede exceder 500 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================================
  // ENVÍO DEL FORMULARIO
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Formulario incompleto",
        text: "Por favor complete todos los campos correctamente",
      });
      return;
    }

    setSubmitting(true);

    try {
      const medicoSeleccionado = medicos.find(
        m => (m.id_medico || m.idMedico).toString() === formData.idMedico
      );

      // ✅ CREAR CITA CON ESTADO PENDIENTE (ID: 1)
      const citaData = {
        paciente: {
          idPaciente: paciente.idPaciente
        },
        medico: {
          id_medico: parseInt(formData.idMedico)
        },
        fecha: formData.fechaCita,
        hora: formData.horaCita + ":00",
        motivo: formData.motivoConsulta.trim(),
        estado: {
          idEstado: 1 // ✅ ESTADO PENDIENTE - Esperando confirmación del médico
        }
      };

      console.log("📤 Enviando cita:", citaData);

      const response = await citaService.crearCita(citaData);
      
      console.log("✅ Respuesta del servidor:", response);

      await Swal.fire({
        icon: "success",
        title: "¡Solicitud enviada!",
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><strong>Su solicitud de cita ha sido enviada exitosamente</strong></p>
            <hr style="margin: 15px 0;">
            <p><span style="color: orange; font-weight: bold;">⏳ Estado:</span> PENDIENTE (Esperando confirmación del médico)</p>
            <p><strong>👨‍⚕️ Médico:</strong> Dr(a). ${medicoSeleccionado?.usuario?.nombre || ''} ${medicoSeleccionado?.usuario?.apellido || ''}</p>
            <p><strong>🏥 Especialidad:</strong> ${formData.especialidad}</p>
            <p><strong>📅 Fecha:</strong> ${new Date(formData.fechaCita + 'T00:00:00').toLocaleDateString('es-CO', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>🕐 Hora:</strong> ${formData.horaCita}</p>
            <hr style="margin: 15px 0;">
            <p style="font-size: 0.9em; color: #666;">
              📌 El médico debe confirmar su cita para que quede <strong>ACTIVA</strong>
            </p>
            <p style="font-size: 0.9em; color: #666;">
              📱 Recibirá una notificación cuando el médico confirme la cita
            </p>
          </div>
        `,
        confirmButtonColor: "#0891b2",
        confirmButtonText: "Entendido",
        width: 600,
      });

      navigate("/paciente/citas");
    } catch (error) {
      console.error("❌ Error al agendar cita:", error);
      
      let mensajeError = "No se pudo agendar la cita. Intente nuevamente.";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          mensajeError = error.response.data;
        } else if (error.response.data.message) {
          mensajeError = error.response.data.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Error al agendar",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("pacienteLogueado");
    navigate("/login");
  };

  const medicosFiltrados = formData.especialidad
    ? medicos.filter((med) => med.especialidad === formData.especialidad)
    : [];

  const getFechaMinima = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
      <div className="cita-form-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (medicos.length === 0) {
    return (
      <div className="cita-form-root">
        <Sidebar usuario={usuario} onLogout={handleLogout} />
        <div className="main-area">
          <Navbar paciente={paciente} onLogout={handleLogout} />
          <main className="content">
            <div className="no-medicos-container">
              <div className="no-medicos-icon">⚕️</div>
              <h2>No hay médicos disponibles</h2>
              <p>Actualmente no hay médicos registrados en el sistema.</p>
              <button
                className="btn-back-home"
                onClick={() => navigate("/dashboard-paciente")}
              >
                Volver al inicio
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="cita-form-root">
      <img src="/icons/heart-pulse.svg" className="bg-icon i1" alt="" />
      <img src="/icons/calendar.svg" className="bg-icon i2" alt="" />
      <img src="/icons/stethoscope.svg" className="bg-icon i3" alt="" />

      <Sidebar usuario={usuario} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar paciente={paciente} onLogout={handleLogout} />

        <main className="content">
          <div className="form-container">
            <div className="form-header">
              <button
                className="btn-back"
                onClick={() => navigate("/dashboard-paciente")}
                type="button"
              >
                ← Volver
              </button>
              <h1>Solicitar Nueva Cita Médica</h1>
              <p className="subtitle">
                Complete el formulario para solicitar una cita (sujeta a confirmación del médico)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="cita-form" noValidate>
              <div className="form-group">
                <label htmlFor="especialidad">
                  Especialidad <span className="required">*</span>
                </label>
                <select
                  id="especialidad"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  className={errors.especialidad ? "error" : ""}
                  required
                >
                  <option value="">Seleccione una especialidad</option>
                  {especialidades.map((esp, index) => (
                    <option key={index} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
                {errors.especialidad && (
                  <span className="error-message">{errors.especialidad}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="idMedico">
                  Médico <span className="required">*</span>
                </label>
                <select
                  id="idMedico"
                  name="idMedico"
                  value={formData.idMedico}
                  onChange={handleChange}
                  disabled={!formData.especialidad}
                  className={errors.idMedico ? "error" : ""}
                  required
                >
                  <option value="">
                    {formData.especialidad
                      ? medicosFiltrados.length > 0
                        ? "Seleccione un médico"
                        : "No hay médicos disponibles para esta especialidad"
                      : "Primero seleccione una especialidad"}
                  </option>
                  {medicosFiltrados.map((med) => {
                    const idMedico = med.id_medico || med.idMedico;
                    const nombreMedico = med.usuario?.nombre || 'Sin nombre';
                    const apellidoMedico = med.usuario?.apellido || '';
                    
                    return (
                      <option key={idMedico} value={idMedico}>
                        Dr(a). {nombreMedico} {apellidoMedico}
                      </option>
                    );
                  })}
                </select>
                {errors.idMedico && (
                  <span className="error-message">{errors.idMedico}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fechaCita">
                  Fecha de la Cita <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="fechaCita"
                  name="fechaCita"
                  value={formData.fechaCita}
                  onChange={handleChange}
                  min={getFechaMinima()}
                  disabled={!formData.idMedico}
                  className={errors.fechaCita ? "error" : ""}
                  required
                />
                {errors.fechaCita && (
                  <span className="error-message">{errors.fechaCita}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="horaCita">
                  Hora de la Cita <span className="required">*</span>
                </label>
                
                {verificandoDisponibilidad ? (
                  <div className="loading-horarios">
                    <span className="spinner-small"></span>
                    Cargando horarios disponibles...
                  </div>
                ) : horariosDisponibles.length > 0 ? (
                  <select
                    id="horaCita"
                    name="horaCita"
                    value={formData.horaCita}
                    onChange={handleChange}
                    disabled={!formData.fechaCita}
                    className={errors.horaCita ? "error" : ""}
                    required
                  >
                    <option value="">Seleccione un horario</option>
                    {horariosDisponibles.map((horario, index) => (
                      <option 
                        key={index} 
                        value={horario.hora}
                        disabled={!horario.disponible}
                        style={{
                          color: horario.disponible ? 'inherit' : '#999',
                          fontStyle: horario.disponible ? 'normal' : 'italic'
                        }}
                      >
                        {horario.hora} {!horario.disponible ? '(Ocupado)' : ''}
                      </option>
                    ))}
                  </select>
                ) : formData.fechaCita ? (
                  <div className="info-message">
                    No hay horarios disponibles para esta fecha
                  </div>
                ) : (
                  <select disabled>
                    <option>Primero seleccione un médico y fecha</option>
                  </select>
                )}
                
                {errors.horaCita && (
                  <span className="error-message">{errors.horaCita}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="motivoConsulta">
                  Motivo de Consulta <span className="required">*</span>
                </label>
                <textarea
                  id="motivoConsulta"
                  name="motivoConsulta"
                  value={formData.motivoConsulta}
                  onChange={handleChange}
                  placeholder="Describa el motivo de su consulta (mínimo 10 caracteres)..."
                  rows="4"
                  maxLength="500"
                  className={errors.motivoConsulta ? "error" : ""}
                  required
                ></textarea>
                <div className="textarea-footer">
                  {errors.motivoConsulta && (
                    <span className="error-message">{errors.motivoConsulta}</span>
                  )}
                  <span className="char-count">
                    {formData.motivoConsulta.length}/500
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate("/dashboard-paciente")}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting || verificandoDisponibilidad}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-small"></span>
                      Enviando solicitud...
                    </>
                  ) : (
                    "Solicitar Cita"
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

      </div>
    </div>
  );
}