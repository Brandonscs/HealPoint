import api from "../api/apiConfig";

const historialService = {

  // Obtener todos los historiales médicos
  getHistoriales: () => api.get("historial/mostrarHistoriales"),

  // Obtener historial por ID de cita
  getHistorialPorCita: (idCita) =>
    api.get(`historial/mostrarHistorialPorCita?idCita=${idCita}`),

  // Crear un historial médico
  crearHistorial: (data, idUsuarioEditor) =>
    api.post(`historial/crearHistorial?idUsuarioEditor=${idUsuarioEditor}`, data),

  // Actualizar un historial médico
  actualizarHistorial: (idHistorial, data, idUsuarioEditor) =>
    api.put(`historial/actualizarHistorial?idHistorial=${idHistorial}&idUsuarioEditor=${idUsuarioEditor}`, data),

  // Eliminar un historial médico
  eliminarHistorial: (idHistorial, idUsuarioEditor) =>
    api.delete(`historial/eliminarHistorial?idHistorial=${idHistorial}&idUsuarioEditor=${idUsuarioEditor}`),
};

export default historialService;