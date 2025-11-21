import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../components/Login/Login";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Dashboards según rol */}
        <Route path="/dashboard-admin" element={<h1>Dashboard Admin</h1>} />
        <Route path="/dashboard-medico" element={<h1>Dashboard Médico</h1>} />
        <Route path="/dashboard-paciente" element={<h1>Dashboard Paciente</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
