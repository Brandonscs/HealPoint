import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../components/Login/Login";
import DashboardMedico from "../components/DashboardMedico/DashboardMedico"
import DisponibilidadForm from "../components/Medico/DisponibilidadForm/DisponibilidadForm"
import HistorialMedicoForm from "../components/Medico/HistorialMedicoForm/HistorialMedicoForm";
import CitaMedicoList from "../components/Medico/CitaMedicoList/CitaMedicoList"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Dashboards según rol */}
        <Route path="/dashboard-admin" element={<h1>Dashboard Admin</h1>} />
        <Route path="/dashboard-medico" element={<DashboardMedico />} />
        <Route path="/dashboard-paciente" element={<h1>Dashboard Paciente</h1>} />

        {/* Rutas del Médico */}
        <Route path="/medico/disponibilidad" element={<DisponibilidadForm />} />
        <Route path="/medico/citas" element={<CitaMedicoList />} />
        <Route path="/medico/historial" element={<HistorialMedicoForm />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
