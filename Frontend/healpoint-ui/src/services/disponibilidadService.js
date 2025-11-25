import api from "../api/apiConfig";

const disponibilidadService = {

  // Obtener todas las disponibilidades
  getDisponibilidades: () => api.get("disponibilidad/mostrarDisponibilidades"),

  // Obtener disponibilidades por médico
  getDisponibilidadByMedico: (id_medico) =>
    api.get(`disponibilidad/mostrarDisponibilidad?id_medico=${id_medico}`),

  // Obtener disponibilidades disponibles (sin citas asignadas) de un médico en una fecha
  getDisponibilidadesDisponibles: (id_medico, fecha) =>
    api.get(`disponibilidad/mostrarDisponibilidadesDisponibles?id_medico=${id_medico}&fecha=${fecha}`),

  // Verificar si un horario específico está disponible
  verificarDisponibilidad: (id_medico, fecha, hora) =>
    api.get(`disponibilidad/verificarDisponibilidad?id_medico=${id_medico}&fecha=${fecha}&hora=${hora}`),

  // Crear una disponibilidad
  crearDisponibilidad: (data, idUsuarioEditor) => {
      console.log("DATA:", data);
      console.log("ID USUARIO EDITOR:", idUsuarioEditor);

      return api.post(
          `disponibilidad/crearDisponibilidad?idUsuarioEditor=${idUsuarioEditor}`,
          data
      );
  },

  // Actualizar una disponibilidad
  actualizarDisponibilidad: (data, idUsuarioEditor) =>
    api.put(`disponibilidad/actualizarDisponibilidad?idUsuarioEditor=${idUsuarioEditor}`, data),

  // Eliminar una disponibilidad
  eliminarDisponibilidad: (id, idUsuarioEditor) =>
    api.delete(`disponibilidad/eliminarDisponibilidad?id=${id}&idUsuarioEditor=${idUsuarioEditor}`),
};

export default disponibilidadService;