import { React, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/adminSidebar";
import AdminDashboard from "./pages/adminDashboard";
import AdminPatients from "./pages/adminPatient";
import AdminAppointment from "./pages/adminAppointment";
import AdminCalendarView from "./pages/adminCalendarView";
import AdminScheduleAppointment from "./components/adminScheduleAppointment";
import AdminMedicalRecords from "./pages/adminMedicalRecords";
import AdminDepartments from "./pages/adminDepartments";
import AdminStaff from "./pages/adminStaff";
import AdminShift from "./pages/adminshift";
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Appointment from './pages/Appointment'
import CalendarView from './pages/CalendarView'
import MedicalRecord from './pages/MedicalRecord'
import login from './pages/login'
import ShiftSchedule from './pages/ShiftSchedule' 
import NurseDashboard from './pages/NurseDashboard'
import NursePatient from './pages/NursePatient'
import NurseSidebar from './components/NurseSidebar'
import NurseCalendar from './pages/NurseCalendar'
import NurseMedicalRecord from './pages/NurseMedicalRecord'
import NurseShiftSchedule from './pages/NurseShiftSchedule'


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUserRole(localStorage.getItem('userRole') || 'Doctor');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole('');
  };

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        <Route path="/nurse-patient" element={<NursePatient />} />
        <Route path="/nurse-calendar" element={<NurseCalendar />} />
        <Route path="/nurse-medical-record" element={<NurseMedicalRecord />} />
        <Route path="/nurse-shift-schedule" element={<NurseShiftSchedule />} />
          
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

        {isAuthenticated ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/appointments" element={<Appointment />} />
            <Route path="/appointments/all" element={<Appointment />} />
            <Route path="/appointments/calendar" element={<CalendarView />} />
            <Route path="/record" element={<MedicalRecord />} />
            <Route path="/shift-schedule" element={<ShiftSchedule />} />
          </>
        ) : (
          <Route path="/" element={<Login onLogin={handleLogin} />} />
        )}
      </Routes>
    </div>
  )
}

export default App;