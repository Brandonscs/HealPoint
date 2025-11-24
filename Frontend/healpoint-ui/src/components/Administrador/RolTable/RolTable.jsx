import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usuarioService from "../../../services/usuarioService";
import rolService from "../../../services/rolService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./RolTable.scss";

export default function RolTable() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolesOriginales, setRolesOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Modal y formulario
  const [showModal, setShowModal] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [formData, setFormData] = useState({
    nombreRol: "",
    descripcion: "",
  });

  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const rolesPorPagina = 10;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

        if (!usuarioLocal || !usuarioLocal.idUsuario) {
          navigate("/login");
          return;
        }

        // Cargar admin
        const adminResponse = await usuarioService.getUsuarioById(
          usuarioLocal.idUsuario
        );
        setAdmin(adminResponse.data);

        // Cargar roles
        const rolesResponse = await rolService.getRoles();
        setRoles(rolesResponse.data);
        setRolesOriginales(rolesResponse.data);
      } catch (error) {
        console.error("Error al cargar roles:", error);
        setErrorMsg("Error al cargar la lista de roles.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  // Aplicar filtros
  useEffect(() => {
    let rolesFiltrados = [...rolesOriginales];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      rolesFiltrados = rolesFiltrados.filter(
        (rol) =>
          rol.nombreRol?.toLowerCase().includes(busqueda.toLowerCase()) ||
          rol.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== "todos") {
      const estadoBuscado = filtroEstado === "activo" ? "Activo" : "Inactivo";
      rolesFiltrados = rolesFiltrados.filter(
        (rol) => rol.estado?.nombreEstado === estadoBuscado
      );
    }

    setRoles(rolesFiltrados);
    setPaginaActual(1);
  }, [busqueda, filtroEstado, rolesOriginales]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("adminLogueado");
    navigate("/login");
  }, [navigate]);

  const handleCreate = () => {
    setEditingRol(null);
    setFormData({ nombreRol: "", descripcion: "" });
    setShowModal(true);
  };

  const handleEdit = (rol) => {
    setEditingRol(rol);
    setFormData({
      nombreRol: rol.nombreRol,
      descripcion: rol.descripcion,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombreRol.trim() || !formData.descripcion.trim()) {
      alert("Por favor complete todos los campos");
      return;
    }

    try {
      const idUsuario = admin.idUsuario;

      if (editingRol) {
        // Actualizar
        const dataActualizar = {
          idRol: editingRol.idRol,
          nombreRol: formData.nombreRol,
          descripcion: formData.descripcion,
          idEstado: editingRol.estado?.idEstado,
        };
        await rolService.actualizarRol(dataActualizar, idUsuario);
      } else {
        // Crear
        await rolService.crearRol(formData, idUsuario);
      }
      
      // Recargar roles
      const rolesResponse = await rolService.getRoles();
      setRoles(rolesResponse.data);
      setRolesOriginales(rolesResponse.data);
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar rol:", error);
      alert("Error al guardar el rol. Verifique que el nombre no esté duplicado.");
    }
  };

  const handleToggleEstado = async (rol) => {
    const accion = rol.estado?.nombreEstado === "Activo" ? "desactivar" : "activar";
    
    if (!window.confirm(`¿Está seguro de ${accion} el rol "${rol.nombreRol}"?`)) {
      return;
    }

    try {
      const idUsuario = admin.idUsuario;

      if (rol.estado?.nombreEstado === "Activo") {
        await rolService.eliminarRol(rol.idRol, idUsuario);
      } else {
        await rolService.activarRol(rol.idRol, idUsuario);
      }

      // Recargar roles
      const rolesResponse = await rolService.getRoles();
      setRoles(rolesResponse.data);
      setRolesOriginales(rolesResponse.data);
    } catch (error) {
      console.error("Error al cambiar estado del rol:", error);
      alert("Error al cambiar el estado del rol");
    }
  };

  // Paginación
  const indiceUltimo = paginaActual * rolesPorPagina;
  const indicePrimero = indiceUltimo - rolesPorPagina;
  const rolesActuales = roles.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(roles.length / rolesPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  if (loading) {
    return (
      <div className="dashboard-admin-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando roles...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="dashboard-admin-root">
        <div className="error-container">
          <div className="error-icon">⚠</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="dashboard-admin-root">
      <Sidebar usuario={admin} onLogout={handleLogout} />

      <div className="main-area">
        <Navbar admin={admin} onLogout={handleLogout} />

        <main className="content">
          <div className="rol-container">
            {/* Encabezado */}
            <div className="rol-header">
              <h1>Gestión de Roles</h1>
            </div>

            {/* Barra de acciones */}
            <div className="rol-actions">
              <input
                type="text"
                placeholder="Buscar rol..."
                className="search-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              
              <select
                className="estado-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>

              <button className="btn-nuevo" onClick={handleCreate}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nuevo Rol
              </button>
            </div>

            {/* Tabla de roles */}
            <div className="table-wrapper">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre Rol</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesActuales.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        No se encontraron roles
                      </td>
                    </tr>
                  ) : (
                    rolesActuales.map((rol) => (
                      <tr key={rol.idRol}>
                        <td>{rol.idRol}</td>
                        <td><strong>{rol.nombreRol}</strong></td>
                        <td>{rol.descripcion}</td>
                        <td>
                          <span
                            className={`estado-badge ${
                              rol.estado?.nombreEstado === "Activo"
                                ? "activo"
                                : "inactivo"
                            }`}
                          >
                            {rol.estado?.nombreEstado || "N/A"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEdit(rol)}
                              title="Editar rol"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-toggle"
                              onClick={() => handleToggleEstado(rol)}
                              title={
                                rol.estado?.nombreEstado === "Activo"
                                  ? "Desactivar rol"
                                  : "Activar rol"
                              }
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {rol.estado?.nombreEstado === "Activo" ? (
                                  // Icono de candado cerrado
                                  <>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                  </>
                                ) : (
                                  // Icono de candado abierto
                                  <>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                                  </>
                                )}
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  ←
                </button>

                {[...Array(totalPaginas)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`page-btn ${
                      paginaActual === index + 1 ? "active" : ""
                    }`}
                    onClick={() => cambiarPagina(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="page-btn"
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  →
                </button>

                <span className="page-info">
                  Total: {roles.length} roles
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRol ? "Editar Rol" : "Nuevo Rol"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Rol *</label>
                <input
                  type="text"
                  value={formData.nombreRol}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreRol: e.target.value })
                  }
                  placeholder="Ej: Administrador"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Descripción del rol..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {editingRol ? "Guardar Cambios" : "Crear Rol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}