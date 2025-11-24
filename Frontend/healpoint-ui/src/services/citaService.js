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

  // Actualizar una cita (reprogramar o cambiar estado)
  // ⚠️ CORREGIDO: Ahora envía el objeto completo en el body, no en la URL
  actualizarCita: (idCita, citaData) =>
    api.put(`cita/actualizarCita?idCita=${idCita}`, citaData),

  // Eliminar/Cancelar una cita
  eliminarCita: (id_cita) =>
    api.delete(`cita/eliminarCita?idCita=${id_cita}`),
};

export default citaService;