import api from "../api/apiConfig";

const citaService = {
  // Obtener todas las citas
  getCitas: () => api.get("cita/mostrarCitas"),

  // Obtener citas por paciente
  getCitasPorPaciente: (idPaciente) =>
    api.get(`cita/mostrarCitasPorPaciente?idPaciente=${idPaciente}`),

  // Obtener citas por médico
  getCitasPorMedico: (id_medico) =>
    api.get(`cita/mostrarCitasPorMedico?idMedico=${id_medico}`),

  // Crear una cita
  crearCita: (data) =>
    api.post("cita/crearCita", data),

  // Actualizar una cita - idCita como query param y objeto en body
  actualizarCita: (idCita, citaCompleta) =>
    api.put(`cita/actualizarCita?idCita=${idCita}`, citaCompleta),

  // Eliminar/Cancelar una cita
  eliminarCita: (id_cita) =>
    api.delete(`cita/eliminarCita?idCita=${id_cita}`),
};

export default citaService;