import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import usuarioService from "../../services/usuarioService";
import pacienteService from "../../services/pacienteService"; 
import "./Register.scss";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    telefono: "",
    fechaNacimiento: "",
    eps: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación: campos vacíos
    for (let key in formData) {
      if (formData[key].trim() === "") {
        Swal.fire("Campo incompleto", "Todos los campos son obligatorios.", "warning");
        return;
      }
    }

    // Validación: contraseñas
    if (formData.contrasena !== formData.confirmarContrasena) {
      Swal.fire("Error", "Las contraseñas no coinciden.", "error");
      return;
    }

    // Objeto para crear usuario
    const nuevoUsuario = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.correo,
      direccion: formData.direccion,
      telefono: formData.telefono,
      fechaNacimiento: formData.fechaNacimiento,
      contrasena: formData.contrasena,
      rol: { idRol: 3 },      // Paciente
      estado: { idEstado: 1 } // Activo
    };

    try {
      // 1️⃣ Crear usuario
      const response = await usuarioService.crearUsuario(nuevoUsuario, 0);

      const usuarioCreado = response.data;
      const idUsuario = usuarioCreado.idUsuario;

      if (!idUsuario) {
        Swal.fire("Error", "No se pudo obtener el ID del usuario creado.", "error");
        return;
      }

      // 2️⃣ Crear paciente con EPS
      const dataPaciente = { eps: formData.eps };

      await pacienteService.crearPaciente(idUsuario, 0, dataPaciente);

      // 3️⃣ Mensaje de éxito
      Swal.fire({
        title: "Registro exitoso",
        text: "Tu cuenta ha sido creada correctamente.",
        icon: "success",
        confirmButtonColor: "#14c4c7",
      }).then(() => navigate("/"));

    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data || "Error inesperado al registrar.",
        "error"
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">

        <h2>Regístrate como paciente</h2>
        <p className="subtitle">Completa los siguientes datos para acceder al sistema.</p>

        <form onSubmit={handleSubmit}>

          <div className="row-group">
            <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} />
            <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} />
          </div>

          <input type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} />

          <input type="text" name="direccion" placeholder="Dirección" onChange={handleChange} />

          <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} />

          <label>Fecha de nacimiento</label>
          <input type="date" name="fechaNacimiento" onChange={handleChange} />

          <input type="text" name="eps" placeholder="EPS" onChange={handleChange} />

          <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} />

          <input type="password" name="confirmarContrasena" placeholder="Confirmar contraseña" onChange={handleChange} />

          <button type="submit" className="btn-register">Registrarse</button>
        </form>

        <p className="login-text">
          ¿Ya tienes una cuenta? <span onClick={() => navigate("/")}>Inicia sesión</span>
        </p>

      </div>
    </div>
  );
}

export default Register;
