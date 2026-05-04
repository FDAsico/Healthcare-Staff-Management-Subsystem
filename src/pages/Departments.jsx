import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Activity, Plus } from "lucide-react";

function Departments() {
  const [collapsed, setCollapsed] = useState(false);

  // TODO: Fetch from backend
  const stats = [];
  const departments = [];

  const handleAddDepartment = () => {
    // TODO: Open add department modal/form
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="p-4 sm:p-8">

          {/* Page Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Departments</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Total Departments */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-700">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.length > 0 ? stats[0].value : "-"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Active Departments</p>
            </div>

            {/* Total Staff */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-700">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.length > 0 ? stats[1]?.value : "-"}
              </p>
              <p className="text-xs text-gray-400 mt-1">of 200 capacity</p>
            </div>

            {/* Active Patients */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.length > 0 ? stats[2]?.value : "-"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Across all departments</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Activity size={20} className="text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Departments Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xl font-bold text-gray-900">Departments</p>
              <p className="text-sm text-gray-400">
                Smart Health Care Predictive Care System
              </p>
            </div>
            <button
              onClick={handleAddDepartment}
              className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              <Plus size={16} />
              Add Department
            </button>
          </div>

          {/* Departments List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {departments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No departments found.
              </p>
            ) : (
              departments.map((dept, index) => (
                <div
                  key={dept.id || index}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 ${
                    index !== departments.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  {/* Left: Name + Description + Status */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-gray-900">
                        {dept.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-black text-white">
                        {dept.status || "Active"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {dept.description}
                    </p>
                  </div>

                  {/* Middle: Department Head */}
                  <div className="sm:px-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {dept.head}
                    </p>
                    <p className="text-xs text-gray-400">
                      {dept.headRole || "Department Head"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Departments;