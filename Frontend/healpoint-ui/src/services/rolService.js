import api from "../api/apiConfig";

const rolService = {

  // Obtener todos los roles
  getRoles: () => api.get("rol/mostrarRoles"),

  // Obtener un rol por ID
  getRolById: (id) =>
    api.get(`rol/mostrarRol?id=${id}`),

  // Obtener rol por nombre
  getRolByNombre: (nombre) =>
    api.get(`rol/mostrarRolPorNombre?nombre=${nombre}`),

  // Crear un rol (requiere idUsuario)
  crearRol: (data, idUsuario) =>
    api.post(
      `rol/crearRol?idUsuario=${idUsuario}`,
      data
    ),

  // Actualizar un rol
  actualizarRol: (data, idUsuario) =>
    api.put(
      `rol/actualizarRol?idUsuario=${idUsuario}`,
      data
    ),

  // Marcar rol como inactivo
  eliminarRol: (id, idUsuario) =>
    api.delete(
      `rol/eliminarRol?id=${id}&idUsuario=${idUsuario}`
    ),

  // Activar un rol
  activarRol: (id, idUsuario) =>
    api.put(
      `rol/activarRol?id=${id}&idUsuario=${idUsuario}`
    ),
};

export default rolService;