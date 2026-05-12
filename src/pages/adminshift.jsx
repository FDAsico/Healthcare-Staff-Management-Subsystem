import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Sun,
  Sunset,
  Moon,
  Clock,
  Users,
  Calendar,
} from "lucide-react";

const shifts = [
  { id: "morning", label: "Morning Shift", time: "08:00 - 16:00", icon: Sun, iconColor: "text-amber-500", bg: "bg-amber-50" },
  { id: "evening", label: "Evening Shift", time: "16:00 - 00:00", icon: Sunset, iconColor: "text-orange-500", bg: "bg-orange-50" },
  { id: "night",   label: "Night Shift",   time: "00:00 - 08:00", icon: Moon, iconColor: "text-indigo-500", bg: "bg-indigo-50" },
];

const getStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

function ShiftManagement({ role = "admin" }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [schedules, setSchedules] = useState({ morning: [], evening: [], night: [] });
  const [staffMembers] = useState(() => getStorage("staff", []));

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    const syncData = () => {
      const saved = getStorage("schedules", { morning: [], evening: [], night: [] });
      setSchedules(saved);
    };
    syncData();
    window.addEventListener("storage", syncData);
    window.addEventListener("schedules-updated", syncData);
    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("schedules-updated", syncData);
    };
  }, []);

  const handleAddShift = () => {
    // TODO: Open add shift modal/form
  };

  const totalStaff = staffMembers.length;
  const totalScheduled = Object.values(schedules).flat().length;

  return (
    <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-black">Welcome Admin!</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage staff shifts and schedules</p>
          </div>
          {role === "admin" && (
            <button
              onClick={handleAddShift}
              className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
            >
              <Plus size={18} strokeWidth={1.5} />
              Add Shift
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-blue-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Total Staff</span>
            </div>
            <p className="text-2xl font-bold text-black">{totalStaff}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-green-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Scheduled Today</span>
            </div>
            <p className="text-2xl font-bold text-black">{totalScheduled}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-orange-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Shifts</span>
            </div>
            <p className="text-2xl font-bold text-black">{shifts.length}</p>
          </div>
        </div>

        {/* Shift Sections */}
        <div className="flex flex-col gap-4">
          {shifts.map((shift) => {
            const ShiftIcon = shift.icon;
            const shiftData = schedules[shift.id] || [];

            return (
              <div key={shift.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className={`p-2 rounded-lg ${shift.bg}`}>
                    <ShiftIcon size={18} className={shift.iconColor} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-black">{shift.label}</span>
                    <span className="text-xs text-gray-500 ml-2">{shift.time}</span>
                  </div>
                  <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {shiftData.length} staff
                  </span>
                </div>

                {/* Section Body */}
                <div className="px-5 py-4">
                  {shiftData.length === 0 ? (
                    <div className="text-center py-6">
                      <Users size={32} className="text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                      <p className="text-sm text-gray-500">No staff scheduled</p>
                      <p className="text-xs text-gray-400 mt-1">Add staff to this shift</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shiftData.map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                              {s.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-black">{s.name}</span>
                              {s.role && <span className="text-xs text-gray-500 ml-2">{s.role}</span>}
                            </div>
                          </div>
                          {s.status && (
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              s.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              {s.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ShiftManagement;