import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ShiftSchedule from './pages/ShiftSchedule'
import PharmaSidebar from './components/PharmaSidebar'


const App = () => {
    return (
        <div className="flex">
            <PharmaSidebar />
            <div className="flex-1 ml-64">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/shift-schedule" element={<ShiftSchedule />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;