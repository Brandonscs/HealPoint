import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import usuarioService from "../../../services/usuarioService";
import estadoService from "../../../services/estadoService";
import Navbar from "../../Shared/Navbar/Navbar";
import Sidebar from "../../Shared/Sidebar/Sidebar";
import "./EstadoTable.scss";

export default function EstadoTable() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal y formulario
  const [showModal, setShowModal] = useState(false);
  const [editingEstado, setEditingEstado] = useState(null);
  const [formData, setFormData] = useState({
    nombreEstado: "",
    descripcion: "",
  });

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");

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

        // Cargar estados
        const estadosResponse = await estadoService.getEstados();
        setEstados(estadosResponse.data);

      } catch (error) {
        console.error("Error al cargar estados:", error);
        setErrorMsg("Error al cargar la lista de estados.");
        
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la lista de estados",
          confirmButtonColor: "#00b4c6",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

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
    setEditingEstado(null);
    setFormData({ nombreEstado: "", descripcion: "" });
    setShowModal(true);
  };

  const handleEdit = (estado) => {
    setEditingEstado(estado);
    setFormData({
      nombreEstado: estado.nombreEstado,
      descripcion: estado.descripcion,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombreEstado.trim() || !formData.descripcion.trim()) {
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

      if (editingEstado) {
        const data = {
          idEstado: editingEstado.idEstado,
          nombreEstado: formData.nombreEstado,
          descripcion: formData.descripcion,
        };
        await estadoService.actualizarEstado(data, idUsuario);

      } else {
        await estadoService.crearEstado(formData, idUsuario);
      }

      // Recargar lista
      const estadosResponse = await estadoService.getEstados();
      setEstados(estadosResponse.data);

      setShowModal(false);

      // Éxito
      Swal.fire({
        icon: "success",
        title: editingEstado ? "¡Estado actualizado!" : "¡Estado creado!",
        text: `El estado "${formData.nombreEstado}" ha sido ${editingEstado ? "actualizado" : "creado"} exitosamente`,
        confirmButtonColor: "#00b4c6",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Error al guardar estado:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.response?.data?.message || "Error al guardar el estado. Verifique que el nombre no esté duplicado.",
        confirmButtonColor: "#00b4c6",
      });
    }
  };

  const handleDelete = async (estado) => {
    const result = await Swal.fire({
      title: "¿Eliminar estado?",
      html: `¿Está seguro de eliminar el estado <strong>"${estado.nombreEstado}"</strong>?<br><br><small>Esta acción no se puede deshacer.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const idUsuario = admin.idUsuario;

      // Mostrar loading
      Swal.fire({
        title: "Eliminando...",
        text: "Por favor espere",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await estadoService.eliminarEstado(estado.idEstado, idUsuario);

      const estadosResponse = await estadoService.getEstados();
      setEstados(estadosResponse.data);

      // Éxito
      Swal.fire({
        icon: "success",
        title: "¡Estado eliminado!",
        text: `El estado "${estado.nombreEstado}" ha sido eliminado exitosamente`,
        confirmButtonColor: "#00b4c6",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Error al eliminar estado:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.response?.data?.message || "No se pudo eliminar el estado. Puede estar siendo usado en otros registros.",
        confirmButtonColor: "#00b4c6",
      });
    }
  };

  // Filtro por búsqueda
  const estadosFiltrados = estados.filter(
    (e) =>
      e.nombreEstado.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard-admin-root">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando estados...</p>
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
          <div className="estado-container">
            <div className="estado-header">
              <h1>Gestión de Estados</h1>
            </div>

            <div className="estado-actions">
              <input
                type="text"
                placeholder="Buscar estado..."
                className="search-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <button className="btn-nuevo" onClick={handleCreate}>
                ➕ Nuevo Estado
              </button>
            </div>

            <div className="table-wrapper">
              <table className="estado-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {estadosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No se encontraron estados
                      </td>
                    </tr>
                  ) : (
                    estadosFiltrados.map((estado) => (
                      <tr key={estado.idEstado}>
                        <td>{estado.idEstado}</td>
                        <td><strong>{estado.nombreEstado}</strong></td>
                        <td>{estado.descripcion}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEdit(estado)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(estado)}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEstado ? "Editar Estado" : "Nuevo Estado"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombreEstado}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreEstado: e.target.value })
                  }
                  placeholder="Ej: PENDIENTE"
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
                  placeholder="Descripción del estado..."
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