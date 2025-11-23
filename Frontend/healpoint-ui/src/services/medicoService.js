import api from "../api/apiConfig";

const medicoService = {

  // Obtener todos los médicos
  getMedicos: () => api.get("medico/mostrarMedicos"),

  // Obtener un médico por ID
  getMedicoById: (id) =>
    api.get(`medico/mostrarMedico?id=${id}`),

  // Crear un médico
  crearMedico: (data, idUsuarioEditor) =>
    api.post(`medico/crearMedico?idUsuarioEditor=${idUsuarioEditor}`, data),

  // Actualizar un médico
  actualizarMedico: (data, idUsuarioEditor) =>
    api.put(`medico/actualizarMedico?idUsuarioEditor=${idUsuarioEditor}`, data),

  // Desactivar un médico
  desactivarMedico: (id, idUsuarioEditor) =>
    api.delete(`medico/desactivarMedico?id=${id}&idUsuarioEditor=${idUsuarioEditor}`),

  // Activar un médico
  activarMedico: (id, idUsuarioEditor) =>
    api.put(`medico/activarMedico?id=${id}&idUsuarioEditor=${idUsuarioEditor}`),
};

export default medicoService;