import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Si usas React Router
import usuarioService from "../../services/usuarioService";
import Swal from "sweetalert2";
import "./Login.scss";

function Login() {
  const navigate = useNavigate(); // Mejor que window.location.href
  
  const [form, setForm] = useState({
    correo: "",
    contrasena: ""
  });

  const [iconPositions, setIconPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generar posiciones aleatorias de íconos
  useEffect(() => {
    const iconTypes = [
      { path: "/icons/dna.svg", count: 6 },
      { path: "/icons/pills.svg", count: 6 },
      { path: "/icons/stetho.svg", count: 6 }
    ];

    const icons = [];
    let id = 0;

    iconTypes.forEach(({ path, count }) => {
      for (let i = 0; i < count; i++) {
        const sizeClasses = ["floating-icon", "floating-icon icon-small", "floating-icon icon-tiny"];
        
        icons.push({
          id: id++,
          src: path,
          className: sizeClasses[i % 3],
          style: {
            top: `${Math.random() * 80 + 5}%`,
            left: `${Math.random() * 80 + 5}%`,
            animationDelay: `${(Math.random() * 2).toFixed(1)}s`,
          }
        });
      }
    });

    setIconPositions(icons);
  }, []);

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validación de campos
  const validateForm = () => {
    if (!form.correo.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Correo requerido",
        text: "Por favor ingrese su correo electrónico.",
      });
      return false;
    }

    if (!form.contrasena.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña requerida",
        text: "Por favor ingrese su contraseña.",
      });
      return false;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.correo)) {
      Swal.fire({
        icon: "warning",
        title: "Correo inválido",
        text: "Por favor ingrese un correo electrónico válido.",
      });
      return false;
    }

    return true;
  };

  // Redirección según rol
  const redirectByRole = (rol) => {
    const routes = {
      PACIENTE: "/dashboard-paciente",
      MEDICO: "/dashboard-medico",
      ADMINISTRADOR: "/dashboard-admin"
    };

    const route = routes[rol];
    
    if (route) {
      navigate(route); // O usar: window.location.href = route;
    } else {
      throw new Error("Rol desconocido");
    }
  };

  // Manejo de login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await usuarioService.login(form.correo, form.contrasena);
      const usuario = res.data;

      // Guardar en localStorage
      localStorage.setItem("usuario", JSON.stringify(usuario));

      const rol = usuario.rol?.nombreRol?.toUpperCase();

      // Redirección según rol
      redirectByRole(rol);

    } catch (err) {
      console.error("Error en login:", err);
      
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: err.response?.data?.message || "Credenciales incorrectas. Inténtelo nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      {/* Íconos flotantes */}
      {iconPositions.map(icon => (
        <img
          key={icon.id}
          src={icon.src}
          className={icon.className}
          style={icon.style}
          alt=""
          loading="lazy"
        />
      ))}

      <div className="login-card">
        <header className="login-header">
          <img
            src="/logo.png"
            alt="HealPoint"
            className="login-logo"
          />
          <h2>Bienvenido de nuevo</h2>
          <p className="subtext">Ingrese sus credenciales para continuar</p>
        </header>

        <form onSubmit={handleLogin} noValidate>
          
          <div className="form-group">
            <label htmlFor="correo" className="sr-only">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              name="correo"
              placeholder="Ingrese su correo electrónico"
              value={form.correo}
              onChange={handleChange}
              className="form-control"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena" className="sr-only">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              name="contrasena"
              placeholder="Ingrese su contraseña"
              value={form.contrasena}
              onChange={handleChange}
              className="form-control"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            className="btn btn-primary login-btn" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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