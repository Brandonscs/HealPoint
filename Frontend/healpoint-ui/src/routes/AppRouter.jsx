import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../components/Login/Login";
import Register from "../components/Register/Register";

import Privacidad from "../components/Shared/Footer/privacidad/privacidad";
import Politica from "../components/Shared/Footer/politica/politica";
import Contacto from "../components/Shared/Footer/contacto/contacto";

import Footer from "../components/Shared/Footer/Footer";

import DashboardAdmin from "../components/Administrador/Administrador";
import DashboardMedico from "../components/DashboardMedico/DashboardMedico";
import DashboardPaciente from "../components/DashboardPaciente/DashboardPaciente";

import DisponibilidadForm from "../components/Medico/DisponibilidadForm/DisponibilidadForm";
import CitaMedicoList from "../components/Medico/CitaMedicoList/CitaMedicoList";
import HistorialMedicoForm from "../components/Medico/HistorialMedicoFrom/HistorialMedicoFrom";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Autenticación */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/dashboard-medico" element={<DashboardMedico />} />
        <Route path="/dashboard-paciente" element={<DashboardPaciente/>} />

        {/* Páginas del footer */}
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Politica />} />
        <Route path="/contacto" element={<Contacto />} />

        {/* Rutas del médico */}
        <Route path="/medico/disponibilidad" element={<DisponibilidadForm />} />
        <Route path="/medico/citas" element={<CitaMedicoList />} />
        <Route path="/medico/historial" element={<HistorialMedicoForm />} />

      </Routes>

      {/* Footer fijo para todas las vistas */}
      <Footer />
    </BrowserRouter>
  );
}

export default AppRouter;
