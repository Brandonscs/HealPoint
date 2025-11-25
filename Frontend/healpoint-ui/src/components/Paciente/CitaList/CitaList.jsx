import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import citaService from "../../../services/citaService";
import estadoService from "../../../services/estadoService";

import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./CitaList.scss";
import Swal from "sweetalert2";

export default function CitaList() {
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pacienteLogueado, setPacienteLogueado] = useState(null);

  // ================================
  // Cargar estados
  // ================================
  const cargarEstados = useCallback(async () => {
    try {
      await estadoService.getEstados();
    } catch (e) {
      console.error("Error al cargar estados:", e);
    }
  }, []);

  // ================================
  // Cargar citas del paciente
  // ================================
  const cargarCitas = useCallback(async (idPaciente) => {
    try {
      const response = await citaService.getCitasPorPaciente(idPaciente);

      if (!Array.isArray(response.data)) {
        setCitas([]);
        return;
      }

      const ordenadas = response.data.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaB - fechaA;
      });

      setCitas(ordenadas);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ================================
  // Cargar paciente desde localStorage
  // ================================
  useEffect(() => {
    const pacienteLocal = JSON.parse(localStorage.getItem("pacienteLogueado"));

    if (!pacienteLocal) {
      navigate("/login");
      return;
    }

    setPacienteLogueado(pacienteLocal);
    cargarCitas(pacienteLocal.idPaciente);
    cargarEstados();
  }, [navigate, cargarCitas, cargarEstados]);

  // ================================
  // Cancelar cita
  // ================================
  const cancelarCita = async (cita) => {
    if (!cita) return;

    const confirmar = await Swal.fire({
      title: "¿Cancelar cita?",
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>¿Está seguro que desea cancelar esta cita?</strong></p>
          <hr style="margin: 15px 0;">
          <p><strong>👨‍⚕️ Médico:</strong> Dr. ${cita.medico?.usuario?.nombre || ''} ${cita.medico?.usuario?.apellido || ''}</p>
          <p><strong>🏥 Especialidad:</strong> ${cita.medico?.especialidad || 'No especificada'}</p>
          <p><strong>📅 Fecha:</strong> ${formatearFecha(cita.fecha)}</p>
          <p><strong>🕐 Hora:</strong> ${formatearHora(cita.hora)}</p>
          <hr style="margin: 15px 0;">
          <p style="font-size: 0.9em; color: #d33;">
            Esta acción no se puede deshacer
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar cita",
      cancelButtonText: "No, mantener cita",
      width: 600,
    });

    if (!confirmar.isConfirmed) return;

    try {
      // ✅ CONSTRUIR EL OBJETO CORRECTAMENTE
      const citaActualizada = {
        paciente: { 
          idPaciente: cita.paciente.idPaciente 
        },
        medico: { 
          id_medico: cita.medico.id_medico || cita.medico.idMedico 
        },
        fecha: cita.fecha,
        hora: cita.hora,
        motivo: cita.motivo,
        estado: { 
          idEstado: 4 // ✅ Estado CANCELADA (ID: 4)
        },
      };

      const idCita = cita.idCita || cita.id_cita;

      console.log("📤 Cancelando cita:", citaActualizada);

      await citaService.actualizarCita(idCita, citaActualizada);

      Swal.fire({
        icon: "success",
        title: "Cita cancelada",
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><strong>Su cita ha sido cancelada exitosamente</strong></p>
            <hr style="margin: 15px 0;">
            <p><span style="color: red; font-weight: bold;">❌ Estado:</span> CANCELADA</p>
            <p>El médico ha sido notificado de la cancelación</p>
          </div>
        `,
        timer: 2500,
        showConfirmButton: false,
        width: 600,
      });

      await cargarCitas(pacienteLogueado.idPaciente);
    } catch (error) {
      console.error("❌ Error al cancelar cita:", error);
      
      const mensajeError = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || "No se pudo cancelar la cita";

      Swal.fire({
        icon: "error",
        title: "Error al cancelar",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });
    }
  };

  // ================================
  // Helpers de formato
  // ================================
  const formatearFecha = (f) => {
    if (!f) return "N/A";
    const [año, mes, dia] = f.split("-");
    return `${dia}/${mes}/${año}`;
  };

  const formatearHora = (h) => {
    if (!h) return "N/A";
    return h.substring(0, 5);
  };

  const obtenerClaseEstado = (estado) => {
    const nombre = estado?.nombreEstado || "";
    const clases = {
      PENDIENTE: "estado-pendiente",
      ACTIVA: "estado-activa",
      COMPLETADA: "estado-completada",
      CANCELADA: "estado-cancelada",
      NO_ASISTIO: "estado-no-asistio",
    };
    return clases[nombre] || "estado-default";
  };

  const obtenerMensajeEstado = (estado) => {
    const nombre = estado?.nombreEstado || "";
    const mensajes = {
      PENDIENTE: "⏳ Esperando confirmación del médico",
      ACTIVA: "✅ Confirmada por el médico",
      COMPLETADA: "✓ Consulta realizada",
      CANCELADA: "❌ Cita cancelada",
      NO_ASISTIO: "⚠️ No asistió a la cita",
    };
    return mensajes[nombre] || "";
  };

  // ================================
  // Verificar si puede cancelar
  // ================================
  const puedeCancelar = (estado) => {
    const nombre = estado?.nombreEstado || "";
    return nombre === "PENDIENTE" || nombre === "ACTIVA";
  };

  // ================================
  // Estadísticas rápidas
  // ================================
  const estadisticas = {
    total: citas.length,
    pendientes: citas.filter(c => c.estado?.nombreEstado === "PENDIENTE").length,
    activas: citas.filter(c => c.estado?.nombreEstado === "ACTIVA").length,
    completadas: citas.filter(c => c.estado?.nombreEstado === "COMPLETADA").length,
  };

  // ================================
  // Render - Loading
  // ================================
  if (loading) {
    return (
      <div className="citas-paciente-root">
        <Sidebar usuario={pacienteLogueado?.usuario} />
        <div className="main-area">
          <Navbar paciente={pacienteLogueado} />
          <main className="content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando citas...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ================================
  // Render - Lista de citas
  // ================================
  return (
    <div className="citas-paciente-root">
      <Sidebar usuario={pacienteLogueado?.usuario} />

      <div className="main-area">
        <Navbar paciente={pacienteLogueado} />

        <main className="content">
          <div className="citas-card">
            <div className="card-header">
              <h1 className="title">Mis Citas Médicas</h1>
              <p className="subtitle">
                Gestiona tus citas y consulta su estado
              </p>
            </div>

            {/* Estadísticas */}
            {citas.length > 0 && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-info">
                    <span className="stat-value">{estadisticas.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>
                <div className="stat-card stat-warning">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <span className="stat-value">{estadisticas.pendientes}</span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                </div>
                <div className="stat-card stat-success">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <span className="stat-value">{estadisticas.activas}</span>
                    <span className="stat-label">Confirmadas</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✓</div>
                  <div className="stat-info">
                    <span className="stat-value">{estadisticas.completadas}</span>
                    <span className="stat-label">Completadas</span>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de citas */}
            <div className="citas-list">
              {citas.length > 0 ? (
                citas.map((cita) => (
                  <div key={cita.idCita || cita.id_cita} className="cita-item">
                    <div className="cita-header">
                      <div className="cita-fecha-hora">
                        <span className="fecha">
                          📅 {formatearFecha(cita.fecha)}
                        </span>
                        <span className="hora">
                          🕐 {formatearHora(cita.hora)}
                        </span>
                      </div>

                      <span
                        className={`estado-badge ${obtenerClaseEstado(
                          cita.estado
                        )}`}
                      >
                        {cita.estado?.nombreEstado}
                      </span>
                    </div>

                    <div className="cita-body">
                      <h3 className="medico-nombre">
                        👨‍⚕️ Dr. {cita.medico?.usuario?.nombre}{" "}
                        {cita.medico?.usuario?.apellido}
                      </h3>
                      <p className="especialidad">
                        <strong>🏥 Especialidad:</strong>{" "}
                        {cita.medico?.especialidad || "No especificada"}
                      </p>
                      <p className="motivo">
                        <strong>📝 Motivo:</strong> {cita.motivo || "No especificado"}
                      </p>
                      
                      {/* Mensaje explicativo del estado */}
                      <p className="estado-mensaje">
                        {obtenerMensajeEstado(cita.estado)}
                      </p>
                    </div>

                    {/* Botón de cancelar solo si es posible */}
                    {puedeCancelar(cita.estado) && (
                      <div className="cita-actions">
                        <button
                          className="btn-action btn-cancelar"
                          onClick={() => cancelarCita(cita)}
                        >
                          ❌ Cancelar Cita
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-citas">
                  <div className="no-citas-icon">📋</div>
                  <h3>No tienes citas registradas</h3>
                  <p>Comienza agendando tu primera cita médica</p>
                  <button
                    className="btn-agendar"
                    onClick={() => navigate("/paciente/agendar")}
                  >
                    ➕ Agendar Nueva Cita
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}