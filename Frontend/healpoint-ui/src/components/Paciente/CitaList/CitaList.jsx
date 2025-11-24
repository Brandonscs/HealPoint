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
    } catch (e) {}
  }, []);

  // ================================
  // Cargar citas (usa idPaciente real)
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
  // Cargar el paciente desde localStorage
  // ================================
  useEffect(() => {
    const pacienteLocal = JSON.parse(localStorage.getItem("pacienteLogueado"));

    if (!pacienteLocal) {
      navigate("/login");
      return;
    }

    setPacienteLogueado(pacienteLocal);

    // cargamos citas con idPaciente REAL
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
      text: `¿Seguro que desea cancelar la cita con el Dr. ${cita.medico?.usuario?.nombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (!confirmar.isConfirmed) return;

    try {
      const data = {
        id_cita: cita.id_cita,
        paciente: { idPaciente: cita.paciente.idPaciente },
        medico: { id_medico: cita.medico.id_medico },
        fecha: cita.fecha,
        hora: cita.hora,
        motivo: cita.motivo,
        estado: { idEstado: 5 }, // cancelada
      };

      await citaService.actualizarCita(cita.id_cita, data);

      Swal.fire({
        icon: "success",
        title: "Cita cancelada",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarCitas(pacienteLogueado.idPaciente);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cancelar la cita",
      });
    }
  };

  // ================================
  // Helpers
  // ================================
  const formatearFecha = (f) => f.split("-").reverse().join("/");
  const formatearHora = (h) => h.substring(0, 5);

  const obtenerClaseEstado = (estado) => {
    const nombre = estado?.nombreEstado || "";
    return (
      {
        PROGRAMADA: "estado-programada",
        CONFIRMADA: "estado-confirmada",
        Pendiente: "estado-pendiente",
        CANCELADA: "estado-cancelada",
        COMPLETADA: "estado-completada",
      }[nombre] || "estado-default"
    );
  };

  // ================================
  // Render
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

  return (
    <div className="citas-paciente-root">
      <Sidebar usuario={pacienteLogueado?.usuario} />

      <div className="main-area">
        <Navbar paciente={pacienteLogueado} />

        <main className="content">
          <div className="citas-card">
            <h1 className="title">Mis Citas</h1>

            <div className="citas-list">
              {citas.length > 0 ? (
                citas.map((cita) => (
                  <div key={cita.id_cita} className="cita-item">
                    <div className="cita-header">
                      <div>
                        <span className="fecha">
                          {formatearFecha(cita.fecha)}
                        </span>{" "}
                        <span className="hora">{formatearHora(cita.hora)}</span>
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
                        Dr. {cita.medico?.usuario?.nombre}{" "}
                        {cita.medico?.usuario?.apellido}
                      </h3>
                      <p>
                        <strong>Especialidad:</strong>{" "}
                        {cita.medico?.especialidad || "No especificada"}
                      </p>
                    </div>

                    {(cita.estado?.nombreEstado === "PROGRAMADA" ||
                      cita.estado?.nombreEstado === "CONFIRMADA" ||
                      cita.estado?.nombreEstado === "Pendiente") && (
                      <div className="cita-actions">
                        <button
                          className="btn-action btn-cancelar"
                          onClick={() => cancelarCita(cita)}
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-citas">
                  <div className="no-citas-icon">📋</div>
                  <h3>No tienes citas registradas</h3>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}