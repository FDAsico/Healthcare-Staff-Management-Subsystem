import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      {!isSidebarCollapsed && (
        <div className="brand-section">
          <h2 className="brand-name">Smart Health Care</h2>
          <p className="brand-slogan">Predictive Care System</p>
        </div>
      )}

      <nav className="nav-menu">
        <div className="nav-item active">
          <span className="icon">📊</span>
          {!isSidebarCollapsed && "Dashboard"}
        </div>

        <div className="nav-item">
          <span className="icon">📄</span>
          {!isSidebarCollapsed && "Medical Records"}
        </div>

        <div className="nav-item">
          <span className="icon">⏰</span>
          {!isSidebarCollapsed && "Shift Schedule"}
        </div>
      </nav>

      <div className="sidebar-footer" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
        <div className="nav-item">
          <span className="icon">⬅️</span>
          {!isSidebarCollapsed && "Collapse"}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;