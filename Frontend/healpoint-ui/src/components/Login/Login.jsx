import { useState } from "react";
import usuarioService from "../../services/usuarioService";
import Swal from "sweetalert2";
import "./Login.scss";

function Login() {
  const [form, setForm] = useState({
    correo: "",
    contrasena: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.correo || !form.contrasena) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor ingrese su correo y contraseña.",
      });
      return;
    }

    try {
      const res = await usuarioService.login(form.correo, form.contrasena);

      const usuario = res.data;
      localStorage.setItem("usuario", JSON.stringify(usuario));

      const rol = usuario.rol.nombreRol?.toUpperCase();

      if (rol === "PACIENTE") {
        window.location.href = "/dashboard-paciente";
      } else if (rol === "MEDICO") {
        window.location.href = "/dashboard-medico";
      } else if (rol === "ADMINISTRADOR") {
        window.location.href = "/dashboard-admin";
      } else {
        Swal.fire({
          icon: "error",
          title: "Rol desconocido",
          text: "No se pudo identificar el tipo de usuario.",
        });
      }

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: err.response?.data || "Credenciales incorrectas",
      });
    }
  };

  return (
    <div className="login-page">
        {/* Íconos flotantes */}
    <img src="/icons/dna.svg" className="floating-icon i1" />
    <img src="/icons/dna.svg" className="floating-icon icon-small i2" />
    <img src="/icons/dna.svg" className="floating-icon icon-tiny i3" />

    <img src="/icons/pills.svg" className="floating-icon i4" />
    <img src="/icons/pills.svg" className="floating-icon icon-small i5" />
    <img src="/icons/pills.svg" className="floating-icon icon-tiny i6" />

    <img src="/icons/stetho.svg" className="floating-icon i7" />
    <img src="/icons/stetho.svg" className="floating-icon icon-small i8" />
    <img src="/icons/stetho.svg" className="floating-icon icon-tiny i9" />
      <div className="login-card">
        <div className="login-header">
          <img
            src="/logo.png"
            alt="HealPoint Logo"
            className="login-logo"
          />
          <h2>Bienvenido de nuevo</h2>
          <p className="subtext">Ingrese sus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <input
              type="email"
              name="correo"
              placeholder="Ingrese su correo electrónico"
              value={form.correo}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="contrasena"
              placeholder="Ingrese su contraseña"
              value={form.contrasena}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <button className="btn btn-primary login-btn" type="submit">
            Iniciar Sesión
          </button>

          <p className="register-text">
            ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Login;
