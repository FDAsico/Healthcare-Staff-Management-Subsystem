import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import StaffManagement from './pages/StaffManagement';

function App() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: collapsed ? "80px" : "256px" }}
        >
          <Routes>
            <Route path="/" element={<StaffManagement />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;