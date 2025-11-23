import api from "../api/apiConfig";

const monitoriaService = {

  // Obtener todas las monitorías
  getMonitorias: () => api.get("monitoria/mostrarMonitorias"),

  // Obtener una monitoría por ID
  getMonitoriaById: (id) =>
    api.get(`monitoria/mostrarMonitoria?id=${id}`),

  // Crear una monitoría
  crearMonitoria: (data) =>
    api.post("monitoria/crearMonitoria", data),
};

export default monitoriaService;