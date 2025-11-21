import api from "../api/apiConfig";

const usuarioService = {

  // Obtener todos los usuarios
  getUsuarios: () => api.get("usuario/mostrarUsuarios"),

  // Obtener un usuario por ID
  getUsuarioById: (id) =>
    api.get(`usuario/mostrarUsuario?id=${id}`),

  // Crear un usuario
  crearUsuario: (data, idUsuarioEditor) =>
    api.post(`usuario/crearUsuario?idUsuarioEditor=${idUsuarioEditor}`, data),

  // Actualizar un usuario
  actualizarUsuario: (data, idUsuarioEditor) =>
    api.put(`usuario/actualizarUsuario?idUsuarioEditor=${idUsuarioEditor}`, data),

  // Inactivar usuario
  eliminarUsuario: (id, idUsuarioEditor) =>
    api.delete(`usuario/eliminarUsuario?id=${id}&idUsuarioEditor=${idUsuarioEditor}`),

  // Activar usuario
  activarUsuario: (id, idUsuarioEditor) =>
    api.put(`usuario/activarUsuario?id=${id}&idUsuarioEditor=${idUsuarioEditor}`),

  // Login de usuario
  login: (correo, contrasena) =>
  api.post("usuario/login", { correo, contrasena }),
};

export default usuarioService;
