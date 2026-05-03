import { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Users,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  FileText,
  Pill,
  X,
  AlertTriangle,
} from "lucide-react";

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
    <line x1="23" y1="22" x2="1" y2="22"/>
    <polyline points="16 5 12 9 8 5"/>
  </svg>
);

const moonIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const shifts = [
  { id: "morning", label: "Morning Shift", time: "08:00 - 4:00",  icon: sunIcon    },
  { id: "evening", label: "Evening Shift", time: "16:00 - 00:00", icon: sunsetIcon },
  { id: "night",   label: "Night Shift",   time: "00:00 - 08:00", icon: moonIcon   },
];

function ShiftManagement() {
  const [schedules] = useState({ morning: [], evening: [], night: [] });

  const handleAddShift = () => {
    // placeholder — modal/page not yet created
  };
  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-4 sm:p-8">

      {/* Page Title */}
      <h1 className="text-xl font-bold text-gray-900 mb-6">Shift</h1>

      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Shift Schedule</p>
          <p className="text-xs text-gray-400 mt-0.5">Manage staff shifts and schedules</p>
        </div>
        
      </div>

      {/* Shift Sections */}
      <div className="flex flex-col gap-4">
        {shifts.map((shift) => (
          <div key={shift.id} className="bg-white rounded-xl border border-gray-200">

            {/* Section Header */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-4 border-b border-gray-100">
              <span className="flex items-center">{shift.icon}</span>
              <span className="text-sm font-bold text-gray-800">{shift.label}</span>
              <span className="text-xs text-gray-400 ml-1">{shift.time}</span>
            </div>

            {/* Section Body */}
            <div className="px-4 sm:px-5 py-4">
              {schedules[shift.id].length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-3">No schedules yet.</p>
              ) : (
                schedules[shift.id].map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-1 sm:gap-0">
                <span className="text-sm font-medium text-gray-800">{s.name}</span>
                {s.role && (
                <span className="text-xs text-gray-400">{s.role}</span>
            )}
                {s.status && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                    s.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                {s.status}
                </span>
                    )}
                </div>
                ))
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ShiftManagement;