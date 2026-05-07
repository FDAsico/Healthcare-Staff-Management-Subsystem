import { React, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import NurseAppointment from './pages/NurseAppointment'
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
        <Route path="/nurse-appointment" element={<NurseAppointment />} />
        <Route path="/nurse-calendar" element={<NurseCalendar />} />
        <Route path="/nurse-medical-record" element={<NurseMedicalRecord />} />
        <Route path="/nurse-shift-schedule" element={<NurseShiftSchedule />} />

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