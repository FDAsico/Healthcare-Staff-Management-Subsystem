import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Plus,
  Building2,
  Users,
  Stethoscope,
  ChevronRight,
} from "lucide-react";

const getStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

function Departments() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [departments, setDepartments] = useState(() => getStorage("departments", []));
  const [staffMembers] = useState(() => getStorage("staff", []));
  const [patients] = useState(() => getStorage("patients", []));

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    const syncData = () => setDepartments(getStorage("departments", []));
    window.addEventListener("storage", syncData);
    window.addEventListener("departments-updated", syncData);
    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("departments-updated", syncData);
    };
  }, []);

  const totalStaff = staffMembers.length;
  const totalPatients = patients.length;
  const totalDepartments = departments.length;

  const handleAddDepartment = () => {
    // TODO: Open add department modal/form
  };

  return (
    <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-black">Welcome Admin!</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage hospital departments and resources</p>
          </div>
          <button
            onClick={handleAddDepartment}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            <Plus size={18} strokeWidth={1.5} />
            Add Department
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={18} className="text-blue-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Total Departments</span>
            </div>
            <p className="text-2xl font-bold text-black">{totalDepartments}</p>
            <p className="text-xs text-gray-400 mt-1">Active Departments</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-green-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Total Staff</span>
            </div>
            <p className="text-2xl font-bold text-black">{totalStaff}</p>
            <p className="text-xs text-gray-400 mt-1">Medical personnel</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={18} className="text-orange-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Active Patients</span>
            </div>
            <p className="text-2xl font-bold text-black">{totalPatients}</p>
            <p className="text-xs text-gray-400 mt-1">Across all departments</p>
          </div>
        </div>

        {/* Departments Header */}
        <div className="mb-4">
          <h2 className="text-[15px] font-semibold text-black">Departments</h2>
          <p className="text-sm text-gray-500">Smart Health Care Predictive Care System</p>
        </div>

        {/* Departments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {departments.length === 0 ? (
            <div className="p-16 text-center">
              <Building2 size={48} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-lg font-semibold text-gray-600">No departments found</p>
              <p className="text-sm text-gray-400 mt-2">Add a department to get started</p>
            </div>
          ) : (
            departments.map((dept, index) => (
              <div
                key={dept.id || index}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-gray-50 transition cursor-pointer ${
                  index !== departments.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-black">{dept.name}</h3>
                    {dept.active && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{dept.description}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-black">{dept.head}</p>
                    <p className="text-xs text-gray-500">Department Head</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Departments;