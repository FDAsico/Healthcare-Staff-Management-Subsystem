import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Appointment from './pages/Appointment'
import CalendarView from './pages/CalendarView'
import MedicalRecord from './pages/MedicalRecord'



const App = () => {
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

export default App
