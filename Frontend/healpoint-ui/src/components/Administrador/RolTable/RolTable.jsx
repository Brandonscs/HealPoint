import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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
        
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la lista de roles",
          confirmButtonColor: "#00b4c6",
        });
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
      const estadoBuscado = filtroEstado === "activo" ? "ACTIVA" : "Inactivo";
      rolesFiltrados = rolesFiltrados.filter(
        (rol) => rol.estado?.nombreEstado === estadoBuscado
      );
    }

    setRoles(rolesFiltrados);
    setPaginaActual(1);
  }, [busqueda, filtroEstado, rolesOriginales]);

  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Está seguro de que desea salir?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00b4c6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("usuario");
        localStorage.removeItem("adminLogueado");
        navigate("/login");
      }
    });
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
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor complete todos los campos",
        confirmButtonColor: "#00b4c6",
      });
      return;
    }

    try {
      const idUsuario = admin.idUsuario;

      // Mostrar loading
      Swal.fire({
        title: "Guardando...",
        text: "Por favor espere",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

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
        // Crear - estado ACTIVA (id 2)
        await rolService.crearRol(
          {
            nombreRol: formData.nombreRol,
            descripcion: formData.descripcion,
            estado: { idEstado: 2 }
          },
          idUsuario
        );
      }
      
      // Recargar roles
      const rolesResponse = await rolService.getRoles();
      setRoles(rolesResponse.data);
      setRolesOriginales(rolesResponse.data);
      setShowModal(false);

      // Éxito
      Swal.fire({
        icon: "success",
        title: editingRol ? "¡Rol actualizado!" : "¡Rol creado!",
        text: `El rol "${formData.nombreRol}" ha sido ${editingRol ? "actualizado" : "creado"} exitosamente`,
        confirmButtonColor: "#00b4c6",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Error al guardar rol:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.response?.data?.message || "Error al guardar el rol. Verifique que el nombre no esté duplicado.",
        confirmButtonColor: "#00b4c6",
      });
    }
  };

  const handleToggleEstado = async (rol) => {
    const esActivo = rol.estado?.nombreEstado === "ACTIVA";
    const accion = esActivo ? "desactivar" : "activar";
    
    const result = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} rol?`,
      html: `¿Está seguro de ${accion} el rol <strong>"${rol.nombreRol}"</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: esActivo ? "#d33" : "#00b4c6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const idUsuario = admin.idUsuario;

      // Mostrar loading
      Swal.fire({
        title: "Procesando...",
        text: "Por favor espere",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      if (esActivo) {
        // Desactivar (cambia a estado Inactivo - id 7)
        await rolService.eliminarRol(rol.idRol, idUsuario);
      } else {
        // Activar (cambia a estado ACTIVA - id 2)
        await rolService.activarRol(rol.idRol, idUsuario);
      }

      // Recargar roles
      const rolesResponse = await rolService.getRoles();
      setRoles(rolesResponse.data);
      setRolesOriginales(rolesResponse.data);

      // Éxito
      Swal.fire({
        icon: "success",
        title: `¡Rol ${esActivo ? "desactivado" : "activado"}!`,
        text: `El rol "${rol.nombreRol}" ha sido ${esActivo ? "desactivado" : "activado"} exitosamente`,
        confirmButtonColor: "#00b4c6",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Error al cambiar estado del rol:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al cambiar el estado del rol",
        confirmButtonColor: "#00b4c6",
      });
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
          <div className="error-icon">⚠️</div>
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
                ➕ Nuevo Rol
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
                    rolesActuales.map((rol) => {
                      const esActivo = rol.estado?.nombreEstado === "ACTIVA";
                      
                      return (
                        <tr key={rol.idRol}>
                          <td>{rol.idRol}</td>
                          <td><strong>{rol.nombreRol}</strong></td>
                          <td>{rol.descripcion}</td>
                          <td>
                            <span
                              className={`estado-badge ${
                                esActivo ? "activo" : "inactivo"
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
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-action btn-toggle"
                                onClick={() => handleToggleEstado(rol)}
                                title={esActivo ? "Desactivar" : "Activar"}
                              >
                                {esActivo ? "🔓" : "🔒"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
            <h2>{editingRol ? "Editar Rol" : "Nuevo Rol"}</h2>
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}