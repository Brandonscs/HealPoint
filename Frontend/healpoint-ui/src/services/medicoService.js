import api from "../api/apiConfig";

const medicoService = {

  // Obtener todos los médicos
  getMedicos: () => api.get("medico/mostrarMedicos"),

  // Obtener un médico por ID
  getMedicoById: (id) =>
    api.get(`medico/mostrarMedico?id=${id}`),

  // Obtener médico por ID de usuario
  getMedicoPorIdUsuario: (idUsuario) =>
    api.get(`medico/usuario/${idUsuario}`),

  // Crear un médico
  crearMedico: (data) =>
    api.post("medico/crearMedico", data),

  // Actualizar un médico
  actualizarMedico: (data) =>
    api.put("medico/actualizarMedico", data),

  // Eliminar un médico
  eliminarMedico: (id) =>
    api.delete(`medico/eliminarMedico?id=${id}`),
};

export default medicoService;