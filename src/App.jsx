import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ShiftSchedule from './pages/ShiftSchedule'
import PharmaSidebar from './components/PharmaSidebar'


const App = () => {
    return (
        <div> 
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/shift-schedule" element={<ShiftSchedule />} />
            </Routes>
        </div>
    );
}

export default App;