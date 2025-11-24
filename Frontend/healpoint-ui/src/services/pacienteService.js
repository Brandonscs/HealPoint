import api from "../api/apiConfig";

const pacienteService = {

  // Obtener todos los pacientes
  getPacientes: () => api.get("paciente/mostrarPacientes"),

  // Obtener un paciente por ID
  getPacienteById: (id) =>
    api.get(`paciente/mostrarPaciente?id=${id}`),

  // Crear un paciente (requiere idUsuario y idUsuarioEditor)
  crearPaciente: (idUsuario, idUsuarioEditor, data) =>
    api.post(
      `paciente/crearPaciente?idUsuario=${idUsuario}&idUsuarioEditor=${idUsuarioEditor}`,
      data
    ),

  // Actualizar paciente (solo EPS)
  actualizarPaciente: (data, idUsuarioEditor) =>
    api.put(
      `paciente/actualizarPaciente?idUsuarioEditor=${idUsuarioEditor}`,
      data
    ),

  // Inactivar paciente
  eliminarPaciente: (id, idUsuarioEditor) =>
    api.delete(
      `paciente/eliminarPaciente?id=${id}&idUsuarioEditor=${idUsuarioEditor}`
    ),

  // Activar paciente
  activarPaciente: (id, idUsuarioEditor) =>
    api.put(
      `paciente/activarPaciente?id=${id}&idUsuarioEditor=${idUsuarioEditor}`
    ),

    getPacientePorIdUsuario: (idUsuario) =>
  api.get(`paciente/mostrarPacientePorIdUsuario?idUsuario=${idUsuario}`),
};


export default pacienteService;
