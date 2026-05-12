import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/adminSidebar"; // ✅ ADDED
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Mail,
  Phone,
  Clock,
  Users,
  Building2,
  Stethoscope,
} from "lucide-react";

const columns = ["Staff Member", "Department", "Contact", "Schedule", "Status", "Today's Load", "Actions"];

const departmentStyles = [
  { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100"    },
  { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100"   },
  { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100"  },
  { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  { color: "text-pink-600",   bg: "bg-pink-50",   border: "border-pink-100"   },
  { color: "text-teal-600",   bg: "bg-teal-50",   border: "border-teal-100"   },
];

const getStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function StaffManagement({ role = "admin" }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const [departments, setDepartments] = useState(() => getStorage("departments", []));
  const [staffMembers, setStaffMembers] = useState(() => getStorage("staff", []));

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    const syncData = () => {
      setDepartments(getStorage("departments", []));
      setStaffMembers(getStorage("staff", []));
    };
    window.addEventListener("storage", syncData);
    window.addEventListener("staff-updated", syncData);
    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("staff-updated", syncData);
    };
  }, []);

  const filtered = staffMembers.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? s.status === statusFilter : true;
    const matchDept = deptFilter ? s.department === deptFilter : true;
    return matchSearch && matchStatus && matchDept;
  });

  return (
    <div className="flex min-h-screen bg-gray-100"> {/* ✅ ADDED: flex wrapper */}
      <Sidebar /> {/* ✅ ADDED: Sidebar component */}
      <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 pb-24">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-black">Welcome Admin!</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage hospital staff and medical personnel</p>
            </div>
            {role === "admin" && (
              <button className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition">
                <Plus size={18} strokeWidth={2} />
                Add Staff
              </button>
            )}
          </div>

          {/* Department Cards */}
          {departments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6 text-center">
              <Building2 size={32} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-gray-400">No departments added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 mb-6">
              {departments.map((dept, i) => {
                const style = departmentStyles[i % departmentStyles.length];
                const count = staffMembers.filter((s) => s.department === dept.name).length;
                return (
                  <div key={dept.name} className={`bg-white rounded-xl border ${style.border} p-4 shadow-sm`}>
                    <p className="text-sm text-gray-600 mb-2">{dept.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-black">{count}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.color}`}>
                        Staff
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search staff by name, role, department, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-gray-400 transition"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-600 outline-none focus:border-gray-400 transition"
              >
                <option value="">Filter by status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-600 outline-none focus:border-gray-400 transition"
              >
                <option value="">Filter by department</option>
                {departments.map((d) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-black">Staff Members ({filtered.length})</p>
              <p className="text-xs text-gray-500 mt-0.5">All medical and administrative personnel</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {columns.map((col) => (
                      <th key={col} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3.5">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-16">
                        <Users size={40} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-sm text-gray-500 font-medium">No staff members found.</p>
                        <p className="text-xs text-gray-400 mt-1">Add staff to get started</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((staff, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                              {staff.initials || staff.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-black">{staff.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Stethoscope size={11} className="text-gray-400" />
                                {staff.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{staff.department}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                              <Mail size={12} className="text-gray-400" />
                              {staff.email}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                              <Phone size={12} className="text-gray-400" />
                              {staff.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-400" />
                            {staff.schedule}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            staff.status === "Active"   ? "bg-green-100 text-green-700" :
                            staff.status === "On Leave" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {staff.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <Users size={12} className="text-gray-400" />
                            {staff.load} patients
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700">
                              <Eye size={16} strokeWidth={1.5} />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700">
                              <Pencil size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div> // ✅ ADDED: closes the outer flex wrapper
  );
}

export default StaffManagement;