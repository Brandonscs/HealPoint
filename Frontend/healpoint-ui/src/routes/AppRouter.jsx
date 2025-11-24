import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import Login from "../components/Login/Login";
import Register from "../components/Register/Register";

// Footer Pages
import Privacidad from "../components/Shared/Footer/privacidad/privacidad";
import Politica from "../components/Shared/Footer/politica/politica";
import Contacto from "../components/Shared/Footer/contacto/contacto";
import Footer from "../components/Shared/Footer/Footer";

// Dashboards
import DashboardAdmin from "../components/Administrador/Administrador";
import DashboardMedico from "../components/DashboardMedico/DashboardMedico";
import DashboardPaciente from "../components/DashboardPaciente/DashboardPaciente";

// Admin Views
import UsuarioList from "../components/Administrador/UsuarioList/UsuarioList";
import RolTable from "../components/Administrador/RolTable/RolTable";
import EstadoTable from "../components/Administrador/EstadoTable/EstadoTable";
//import AgendaGlobal from "../components/Administrador/AgendaGlobal/AgendaGlobal";
import MonitoriaTable from "../components/Administrador/MonitoriaTable/MonitoriaTable";

// Medico Views
import DisponibilidadForm from "../components/Medico/DisponibilidadForm/DisponibilidadForm";
import CitaMedicoList from "../components/Medico/CitaMedicoList/CitaMedicoList";
import HistorialMedicoForm from "../components/Medico/HistorialMedicoFrom/HistorialMedicoFrom";

// Paciente Views
import CitaList from "../components/Paciente/CitaList/CitaList";
import HistorialPaciente from "../components/Paciente/HistorialPaciente/HistorialPaciente";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================
            AUTENTICACIÓN
            ============================================ */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ============================================
            DASHBOARDS
            ============================================ */}
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/dashboard-medico" element={<DashboardMedico />} />
        <Route path="/dashboard-paciente" element={<DashboardPaciente />} />

        {/* ============================================
            RUTAS ADMINISTRADOR
            ============================================ */}
        <Route path="/admin/usuarios" element={<UsuarioList />} />
        <Route path="/admin/roles" element={<RolTable />} />   
        <Route path="/admin/estados" element={<EstadoTable />} />
{/*         <Route path="/admin/agenda" element={<AgendaGlobal />} />
 */}        <Route path="/admin/monitoreo" element={<MonitoriaTable />} />

        {/* ============================================
            RUTAS MÉDICO
            ============================================ */}
        <Route path="/medico/disponibilidad" element={<DisponibilidadForm />} />
        <Route path="/medico/citas" element={<CitaMedicoList />} />
        <Route path="/medico/historial" element={<HistorialMedicoForm />} />

        {/* ============================================
            RUTAS PACIENTE (descomentar cuando crees los componentes)
            ============================================ */}
        <Route path="/paciente/citas" element={<CitaList />} />
        <Route path="/paciente/historial" element={<HistorialPaciente />} />

        {/* ============================================
            PÁGINAS DEL FOOTER
            ============================================ */}
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Politica />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>

      {/* Footer fijo para todas las vistas */}
      <Footer />
    </BrowserRouter>
  );
}

export default AppRouter;