import { useState } from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
<<<<<<< Updated upstream
import ShiftManagement from './pages/ShiftManagement';
=======
import StaffManagement from './pages/StaffManagement';
import ShiftManagement from './pages/ShiftManagement';
// import Login from './pages/Login'; // Uncomment when groupmate's Login is ready
>>>>>>> Stashed changes

function App() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  // TODO: Switch to this once groupmate's Login is ready:
  // const [user, setUser] = useState(null);

  // Temporary: hardcoded for testing — change role to "doctor", "nurse", or "pharmacist" to test
  const [user] = useState({ name: "Admin", role: "admin" });

  return (
    <BrowserRouter>
      {/* TODO: Uncomment when groupmate's Login is ready */}
      {/* <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/*" element={
          user ? ( */}

      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          role={user.role}
        />
        <div
          className="flex-1 overflow-auto transition-all duration-300"
          style={{ marginLeft: collapsed ? "80px" : "256px" }}
        >
          <Routes>
<<<<<<< Updated upstream
            <Route path="/" element={<ShiftManagement />} />
=======
            <Route path="/" element={<ShiftManagement role={user.role} />} />
            <Route path="/shiftmanagement" element={<ShiftManagement role={user.role} />} />
            <Route path="/staffmanagement" element={<StaffManagement role={user.role} />} />
>>>>>>> Stashed changes
          </Routes>
        </div>
      </div>

      {/* TODO: Uncomment when groupmate's Login is ready */}
      {/* ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes> */}

    </BrowserRouter>
  );
}

export default App;