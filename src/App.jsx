import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./pages/adminDashboard";
import AdminPatients from "./pages/adminPatient";
import AdminAppointment from "./pages/adminAppointment";
import AdminCalendarView from "./pages/adminCalendarView";
import AdminScheduleAppointment from "./components/adminScheduleAppointment";
import AdminMedicalRecords from "./pages/adminMedicalRecords";
import AdminDepartments from "./pages/adminDepartments";
import AdminStaff from "./pages/adminStaff";
import AdminShift from "./pages/adminshift";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/patients" element={<AdminPatients />} />
            <Route path="/appointments" element={<AdminAppointment />} />
            <Route path="/appointments/all" element={<AdminAppointment />} />
            <Route path="/appointments/calendar" element={<AdminCalendarView />} />
            <Route path="/schedule-appointment" element={<AdminScheduleAppointment />} />
            <Route path="/record" element={<AdminMedicalRecords />} />
            <Route path="/staff/all" element={<AdminStaff />} />
            <Route path="/staff/departments" element={<AdminDepartments />} />
            <Route path="/staff/shifts" element={<AdminShift />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;