import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usuarioService from "../../../services/usuarioService";
import rolService from "../../../services/rolService";
import estadoService from "../../../services/estadoService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./UsuarioList.scss";

export default function UsuarioList() {
  const navigate = useNavigate();
  
  // Estado del administrador
  const [admin, setAdmin] = useState(null);
  
  // Estados principales
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados de búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados de modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    telefono: "",
    fechaNacimiento: "",
    idRol: "",
    idEstado: "1",
    contrasena: "",
    confirmarContrasena: ""
  });

  const [formErrors, setFormErrors] = useState({});

  // Estados para roles y estados
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);

  // Estados de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // ========================================
  // CARGAR DATOS INICIALES
  // ========================================
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

        // Cargar usuarios
        await cargarUsuarios();
        await cargarRoles();
        await cargarEstados();
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.getUsuarios();
      setUsuarios(response.data);
      setError("");
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("Error al cargar los usuarios. Por favor, intente nuevamente.");
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await rolService.getRoles();
      setRoles(response.data);
    } catch (err) {
      console.error("Error al cargar roles:", err);
    }
  };

  const cargarEstados = async () => {
    try {
      const response = await estadoService.getEstados();
      setEstados(response.data);
    } catch (err) {
      console.error("Error al cargar estados:", err);
    }
  };

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("adminLogueado");
    navigate("/login");
  }, [navigate]);

  // ========================================
  // FILTRADO Y BÚSQUEDA
  // ========================================
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchSearch =
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole =
        roleFilter === "Todos" ||
        usuario.rol?.nombreRol === roleFilter;

      return matchSearch && matchRole;
    });
  }, [usuarios, searchTerm, roleFilter]);

  // ========================================
  // PAGINACIÓN
  // ========================================
  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const usuariosPaginados = usuariosFiltrados.slice(startIndex, endIndex);

  const cambiarPagina = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ========================================
  // MANEJO DEL FORMULARIO
  // ========================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validarFormulario = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es requerido";
    }

    if (!formData.apellido.trim()) {
      errors.apellido = "El apellido es requerido";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      errors.correo = "El correo es requerido";
    } else if (!emailRegex.test(formData.correo)) {
      errors.correo = "El correo no es válido";
    }

    if (!formData.direccion.trim()) {
      errors.direccion = "La dirección es requerida";
    }

    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es requerido";
    }

    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = "La fecha de nacimiento es requerida";
    }

    if (!formData.idRol) {
      errors.idRol = "Debe seleccionar un rol";
    }

    if (modalMode === "create") {
      if (!formData.contrasena) {
        errors.contrasena = "La contraseña es requerida";
      } else if (formData.contrasena.length < 6) {
        errors.contrasena = "La contraseña debe tener al menos 6 caracteres";
      }

      if (formData.contrasena !== formData.confirmarContrasena) {
        errors.confirmarContrasena = "Las contraseñas no coinciden";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========================================
  // CRUD OPERATIONS
  // ========================================
  const abrirModalCrear = () => {
    setModalMode("create");
    setSelectedUsuario(null);
    setFormData({
      nombre: "",
      apellido: "",
      correo: "",
      direccion: "",
      telefono: "",
      fechaNacimiento: "",
      idRol: "",
      idEstado: "1",
      contrasena: "",
      confirmarContrasena: ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setModalMode("edit");
    setSelectedUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      direccion: usuario.direccion || "",
      telefono: usuario.telefono,
      fechaNacimiento: usuario.fechaNacimiento || "",
      idRol: usuario.rol?.idRol || "",
      idEstado: usuario.estado?.idEstado || "1",
      contrasena: "",
      confirmarContrasena: ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedUsuario(null);
    setFormData({
      nombre: "",
      apellido: "",
      correo: "",
      direccion: "",
      telefono: "",
      fechaNacimiento: "",
      idRol: "",
      idEstado: "1",
      contrasena: "",
      confirmarContrasena: ""
    });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      const idUsuarioEditor = admin.idUsuario;
      
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        direccion: formData.direccion,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        rol: {
          idRol: parseInt(formData.idRol)
        },
        estado: {
          idEstado: parseInt(formData.idEstado)
        }
      };

      if (modalMode === "create") {
        payload.contrasena = formData.contrasena;
        await usuarioService.crearUsuario(payload, idUsuarioEditor);
        setError("");
        alert("Usuario creado exitosamente");
      } else {
        payload.idUsuario = selectedUsuario.idUsuario;
        if (formData.contrasena) {
          payload.contrasena = formData.contrasena;
        }
        await usuarioService.actualizarUsuario(payload, idUsuarioEditor);
        setError("");
        alert("Usuario actualizado exitosamente");
      }

      await cargarUsuarios();
      cerrarModal();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      console.error("Respuesta del servidor:", err.response?.data);
      setError(err.response?.data || "Error al guardar el usuario. Verifique los datos.");
    }
  };

  const cambiarEstado = async (usuario) => {
    try {
      const idUsuarioEditor = admin.idUsuario;
      
      if (usuario.estado?.idEstado === 1) {
        await usuarioService.eliminarUsuario(usuario.idUsuario, idUsuarioEditor);
      } else {
        await usuarioService.activarUsuario(usuario.idUsuario, idUsuarioEditor);
      }
      await cargarUsuarios();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError("Error al cambiar el estado del usuario.");
    }
  };

  const confirmarEliminar = (usuario) => {
    setConfirmAction(() => () => eliminarUsuario(usuario.idUsuario));
    setShowConfirmModal(true);
  };

  const eliminarUsuario = async (idUsuario) => {
    try {
      const idUsuarioEditor = admin.idUsuario;
      await usuarioService.eliminarUsuario(idUsuario, idUsuarioEditor);
      await cargarUsuarios();
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError("Error al eliminar el usuario.");
    }
  };

  // ========================================
  // RENDER
  // ========================================
  if (loading) {
    return (
      <div className="dashboard-admin-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando usuarios...</p>
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
          <div className="usuario-list-container">
            <div className="usuario-list-card">
              <div className="card-header">
                <h1 className="title">Gestión de Usuarios</h1>
                <p className="subtitle">Administre todos los usuarios del sistema</p>
              </div>

              <div className="actions-bar">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>

                <div className="filter-box">
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="filter-select"
                  >
                    <option value="Todos">Todos los roles</option>
                    <option value="Paciente">Paciente</option>
                    <option value="Medico">Médico</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>

                <button className="btn-nuevo" onClick={abrirModalCrear}>
                  <span className="btn-icon">➕</span>
                  Nuevo Usuario
                </button>
              </div>

              {error && (
                <div className="alert alert-error">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <div className="table-wrapper">
                <table className="usuarios-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosPaginados.length > 0 ? (
                      usuariosPaginados.map((usuario) => (
                        <tr key={usuario.idUsuario}>
                          <td>{usuario.nombre}</td>
                          <td>{usuario.apellido}</td>
                          <td>{usuario.correo}</td>
                          <td>{usuario.telefono}</td>
                          <td>
                            <span className={`badge badge-${usuario.rol?.nombreRol?.toLowerCase()}`}>
                              {usuario.rol?.nombreRol || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                usuario.estado?.idEstado === 1
                                  ? "badge-activo"
                                  : "badge-inactivo"
                              }`}
                            >
                              {usuario.estado?.nombreEstado || "N/A"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-action btn-editar"
                                onClick={() => abrirModalEditar(usuario)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-action btn-estado"
                                onClick={() => cambiarEstado(usuario)}
                                title="Cambiar estado"
                              >
                                {usuario.estado?.idEstado === 1 ? "🔓" : "🔒"}
                              </button>
                              <button
                                className="btn-action btn-eliminar"
                                onClick={() => confirmarEliminar(usuario)}
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => cambiarPagina(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ⏪
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      className={`page-number ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                      onClick={() => cambiarPagina(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    onClick={() => cambiarPagina(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ⏩
                  </button>

                  <span className="pagination-info">
                    Mostrando {startIndex + 1}-
                    {Math.min(endIndex, usuariosFiltrados.length)} de{" "}
                    {usuariosFiltrados.length} usuarios
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL DE CREACIÓN/EDICIÓN */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "create" ? "Nuevo Usuario" : "Editar Usuario"}
              </h2>
              <button className="modal-close" onClick={cerrarModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={formErrors.nombre ? "error" : ""}
                  />
                  {formErrors.nombre && (
                    <span className="error-message">{formErrors.nombre}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className={formErrors.apellido ? "error" : ""}
                  />
                  {formErrors.apellido && (
                    <span className="error-message">{formErrors.apellido}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Correo *</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className={formErrors.correo ? "error" : ""}
                  />
                  {formErrors.correo && (
                    <span className="error-message">{formErrors.correo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={formErrors.telefono ? "error" : ""}
                  />
                  {formErrors.telefono && (
                    <span className="error-message">{formErrors.telefono}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dirección *</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className={formErrors.direccion ? "error" : ""}
                    placeholder="Ingrese la dirección"
                  />
                  {formErrors.direccion && (
                    <span className="error-message">{formErrors.direccion}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    className={formErrors.fechaNacimiento ? "error" : ""}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.fechaNacimiento && (
                    <span className="error-message">{formErrors.fechaNacimiento}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    name="idRol"
                    value={formData.idRol}
                    onChange={handleInputChange}
                    className={formErrors.idRol ? "error" : ""}
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.idRol} value={rol.idRol}>
                        {rol.nombreRol}
                      </option>
                    ))}
                  </select>
                  {formErrors.idRol && (
                    <span className="error-message">{formErrors.idRol}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="idEstado"
                    value={formData.idEstado}
                    onChange={handleInputChange}
                  >
                    {estados.map((estado) => (
                      <option key={estado.idEstado} value={estado.idEstado}>
                        {estado.nombreEstado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Contraseña {modalMode === "create" ? "*" : "(Opcional)"}
                  </label>
                  <input
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    className={formErrors.contrasena ? "error" : ""}
                    placeholder={
                      modalMode === "edit"
                        ? "Dejar vacío para mantener"
                        : ""
                    }
                  />
                  {formErrors.contrasena && (
                    <span className="error-message">
                      {formErrors.contrasena}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Confirmar Contraseña {modalMode === "create" && "*"}
                  </label>
                  <input
                    type="password"
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleInputChange}
                    className={formErrors.confirmarContrasena ? "error" : ""}
                  />
                  {formErrors.confirmarContrasena && (
                    <span className="error-message">
                      {formErrors.confirmarContrasena}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {modalMode === "create" ? "Crear Usuario" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h2>¿Está seguro?</h2>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-confirmar"
                onClick={confirmAction}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}