import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../components/Login/Login";
import Register from "../components/Register/Register";
import Privacidad from "../components/Shared/Footer/privacidad/privacidad"
import Politica from "../components/Shared/Footer/politica/politica"
import Contacto from "../components/Shared/Footer/contacto/contacto";
import Footer from "../components/Shared/Footer/Footer";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards según rol */}
        <Route path="/dashboard-admin" element={<h1>Dashboard Admin</h1>} />
        <Route path="/dashboard-medico" element={<h1>Dashboard Médico</h1>} />
        <Route path="/dashboard-paciente" element={<h1>Dashboard Paciente</h1>} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Politica />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default AppRouter;

