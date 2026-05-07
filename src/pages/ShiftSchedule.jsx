import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const formatTime = (time24) => {
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${ampm}`;
};

const sunIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const sunsetIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 18a5 5 0 0 0-10 0"/>
    <line x1="12" y1="9" x2="12" y2="2"/>
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
    <line x1="1" y1="18" x2="3" y2="18"/>
    <line x1="21" y1="18" x2="23" y2="18"/>
    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
    <polyline points="16 5 12 9 8 5"/>
  </svg>
);

const moonIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const shifts = [
  {
    id: "morning",
    label: "Morning Shift",
    time: `${formatTime("08:00")} - ${formatTime("16:00")}`,
    icon: sunIcon,
  },
  {
    id: "evening",
    label: "Evening Shift",
    time: `${formatTime("16:00")} - ${formatTime("00:00")}`,
    icon: sunsetIcon,
  },
  {
    id: "night",
    label: "Night Shift",
    time: `${formatTime("00:00")} - ${formatTime("08:00")}`,
    icon: moonIcon,
  },
];

const ShiftSchedule = () => {
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem("sidebar-collapsed") === "true"
  );

  const [schedules] = useState({
    morning: [],
    evening: [],
    night: [],
  });

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);

    window.addEventListener("sidebar-collapse", syncSidebar);

    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div
        className="flex-1 p-6 flex flex-col"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <h1 className="text-[24px] font-bold mb-6">Shift Schedule</h1>

        <div className="flex flex-col gap-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white rounded-xl border border-gray-200"
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <span>{shift.icon}</span>

                <span className="text-sm font-bold text-gray-800">
                  {shift.label}
                </span>

                <span className="text-sm font-semibold text-gray-500 ml-2">
                  {shift.time}
                </span>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                {schedules[shift.id].length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6 font-medium">
                    No schedules yet.
                  </p>
                ) : (
                  schedules[shift.id].map((s, i) => (
                    <div
                      key={i}
                      className="py-3 border-b border-gray-50 last:border-0"
                    >
                      {s.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShiftSchedule;