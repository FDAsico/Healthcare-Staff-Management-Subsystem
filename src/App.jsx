import { React, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Appointment from './pages/Appointment'
import CalendarView from './pages/CalendarView'
import MedicalRecord from './pages/MedicalRecord'

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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/appointments" element={<Appointment />} />
        <Route path="/appointments/all" element={<Appointment />} />
        <Route path="/appointments/calendar" element={<CalendarView />} />
        <Route path="/record" element={<MedicalRecord />} />

      </Routes>
    </div>
  )
}

export default App;