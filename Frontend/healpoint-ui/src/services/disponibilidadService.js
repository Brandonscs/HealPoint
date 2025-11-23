import api from "../api/apiConfig";

const disponibilidadService = {

  // Obtener todas las disponibilidades
  getDisponibilidades: () => api.get("disponibilidad/mostrarDisponibilidades"),

  // Obtener disponibilidades por médico
  getDisponibilidadByMedico: (id_medico) =>
    api.get(`disponibilidad/mostrarDisponibilidad?id_medico=${id_medico}`),

  // Crear una disponibilidad
  crearDisponibilidad: (data, idUsuarioEditor) =>
    api.post(`disponibilidad/crearDisponibilidad?idUsuarioEditor=${idUsuarioEditor}`, data),

  // Actualizar una disponibilidad
  actualizarDisponibilidad: (data, idUsuarioEditor) =>
    api.put(`disponibilidad/actualizarDisponibilidad?idUsuarioEditor=${idUsuarioEditor}`, data),

  // Eliminar una disponibilidad
  eliminarDisponibilidad: (id, idUsuarioEditor) =>
    api.delete(`disponibilidad/eliminarDisponibilidad?id=${id}&idUsuarioEditor=${idUsuarioEditor}`),
};

export default disponibilidadService;