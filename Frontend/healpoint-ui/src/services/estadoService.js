import api from "../api/apiConfig";

const estadoService = {

  // Obtener todos los estados
  getEstados: () => api.get("estado/mostrarEstados"),

  // Obtener un estado por ID
  getEstadoById: (id) =>
    api.get(`estado/mostrarEstado?id=${id}`),

  // Obtener un estado por nombre
  getEstadoByNombre: (nombre) =>
    api.get(`estado/mostrarEstadoPorNombre?nombre=${nombre}`),

  // Crear un estado
  crearEstado: (data, idUsuario) =>
    api.post(`estado/crearEstado?idUsuario=${idUsuario}`, data),

  // Actualizar un estado
  actualizarEstado: (data, idUsuario) =>
    api.put(`estado/actualizarEstado?idUsuario=${idUsuario}`, data),

  // Eliminar un estado
  eliminarEstado: (id, idUsuario) =>
    api.delete(`estado/eliminarEstado?id=${id}&idUsuario=${idUsuario}`),
};

export default estadoService;