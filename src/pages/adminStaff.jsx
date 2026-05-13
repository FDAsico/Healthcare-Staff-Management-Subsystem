import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/adminSidebar";
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
  X,
  Loader2,
  Check,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  return localStorage.getItem("accessToken") || "";
};

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

const VALID_ROLES = ["DOCTOR", "NURSE", "PHARMACIST", "ADMIN", "SUPPORT"];

function StaffManagement({ role = "admin" }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const [departments, setDepartments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Admin User Search State
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);
  const [isSearchingAdmin, setIsSearchingAdmin] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [showAdminResults, setShowAdminResults] = useState(false);

  // Staff Form State
  const [staffForm, setStaffForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department_id: "",
    role: "",
    gender: "",
    employeeId: "",
    status: "ACTIVE",
    address: "",
    dateOfBirth: "",
    middleName: "",
  });

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const token = getAuthToken();
      if (!token) {
        setFetchError("No authentication token found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/staff`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setFetchError("Session expired. Please log in again.");
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        setIsLoading(false);
        return;
      }

      const result = await res.json();
      const data = result.data || result.staff || result || [];
      const normalized = Array.isArray(data) ? data : [data];

      setStaffMembers(normalized);
      localStorage.setItem("staff", JSON.stringify(normalized));
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setFetchError(error.message || "Failed to load staff");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/departments`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) return;
      const result = await res.json();
      const data = result.data || result.departments || result || [];
      const normalized = Array.isArray(data) ? data : [];
      setDepartments(normalized);
      localStorage.setItem("departments", JSON.stringify(normalized));
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  // Search admin users via admin-proxy
  const searchAdminUsers = async () => {
    if (!adminSearchQuery.trim()) {
      setFormError("Please enter a name to search");
      return;
    }

    setIsSearchingAdmin(true);
    setFormError("");
    setAdminUsers([]);
    setSelectedAdminUser(null);
    setShowAdminResults(true);

    try {
      const token = getAuthToken();
      const queryParams = new URLSearchParams();
      
      // Split query into first/last name if space exists
      const parts = adminSearchQuery.trim().split(" ");
      if (parts.length > 1) {
        queryParams.append("firstName", parts[0]);
        queryParams.append("lastName", parts.slice(1).join(" "));
      } else {
        queryParams.append("firstName", adminSearchQuery.trim());
      }

      const res = await fetch(`${API_BASE}/admin-proxy/users?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Admin search failed: ${res.status}`);
      }

      const result = await res.json();
      const users = result.users || result.data || result || [];
      setAdminUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Admin search error:", error);
      setFormError(error.message || "Failed to search admin users");
    } finally {
      setIsSearchingAdmin(false);
    }
  };

  const selectAdminUser = (user) => {
    setSelectedAdminUser(user);
    setStaffForm({
      ...staffForm,
      firstName: user.first_name || user.firstName || "",
      lastName: user.last_name || user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      middleName: user.middle_name || user.middleName || "",
    });
    setShowAdminResults(false);
    setAdminSearchQuery(`${user.first_name || user.firstName} ${user.last_name || user.lastName}`);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const token = getAuthToken();
      if (!token) {
        setFormError("No authentication token. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      if (!selectedAdminUser) {
        setFormError("Please search and select an admin user.");
        setIsSubmitting(false);
        return;
      }

      if (!staffForm.role || !VALID_ROLES.includes(staffForm.role)) {
        setFormError(`Role must be one of: ${VALID_ROLES.join(", ")}`);
        setIsSubmitting(false);
        return;
      }

      // Department is required only for non-ADMIN roles
      if (staffForm.role !== "ADMIN" && !staffForm.department_id) {
        setFormError("Department is required for this role.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        user_id: selectedAdminUser.user_id,
        firstName: staffForm.firstName.trim(),
        lastName: staffForm.lastName.trim(),
        role: staffForm.role,
        department_id: staffForm.department_id || undefined,
        gender: staffForm.gender || undefined,
        employeeId: staffForm.employeeId || undefined,
        status: staffForm.status,
        email: staffForm.email?.trim() || undefined,
        phone: staffForm.phone?.trim() || undefined,
        address: staffForm.address?.trim() || undefined,
        dateOfBirth: staffForm.dateOfBirth || undefined,
        middleName: staffForm.middleName?.trim() || undefined,
      };

      console.log("Sending staff payload:", payload);

      const res = await fetch(`${API_BASE}/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Create staff response:", res.status, result);

      if (!res.ok) {
        throw new Error(result.message || `Failed to create staff (${res.status})`);
      }

      const createdStaff = result.data || result.staff || result;
      const updated = [createdStaff, ...staffMembers];
      setStaffMembers(updated);
      localStorage.setItem("staff", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("staff-updated"));

      resetModal();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Submit error:", error);
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setAdminSearchQuery("");
    setAdminUsers([]);
    setSelectedAdminUser(null);
    setShowAdminResults(false);
    setStaffForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department_id: "",
      role: "",
      gender: "",
      employeeId: "",
      status: "ACTIVE",
      address: "",
      dateOfBirth: "",
      middleName: "",
    });
    setFormError("");
  };

  const filtered = staffMembers.filter((s) => {
    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.trim();
    const searchName = s.name || fullName;
    const matchSearch =
      searchName.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? (s.status === statusFilter || s.status === statusFilter.toUpperCase()) : true;
    const matchDept = deptFilter ? ((s.department?.name || s.department) === deptFilter) : true;
    return matchSearch && matchStatus && matchDept;
  });

  // Check if department should be required
  const isDepartmentRequired = staffForm.role && staffForm.role !== "ADMIN";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar /> 
      <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 pb-24">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-black">Welcome Admin!</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage hospital staff and medical personnel</p>
            </div>
            {role === "admin" && (
              <button 
                onClick={() => {
                  setIsAddModalOpen(true);
                  resetModal();
                }}
                className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
              >
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
                const count = staffMembers.filter((s) => 
                  (s.department?.name || s.department) === dept.name
                ).length;
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
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TERMINATED">Terminated</option>
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

          {/* Loading */}
          {isLoading && (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <Loader2 size={48} className="text-gray-300 mx-auto mb-4 animate-spin" strokeWidth={1.5} />
              <p className="text-lg font-semibold text-gray-600">Loading staff...</p>
            </div>
          )}

          {/* Error */}
          {fetchError && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-6">
              <p className="text-red-600 font-medium mb-2">{fetchError}</p>
              <button
                onClick={fetchStaff}
                className="text-sm text-red-700 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Staff Table */}
          {!isLoading && !fetchError && (
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
                        <tr key={staff.staff_id || i} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                                {`${staff.firstName?.charAt(0) || ""}${staff.lastName?.charAt(0) || ""}` || "S"}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-black">
                                  {staff.firstName} {staff.lastName}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Stethoscope size={11} className="text-gray-400" />
                                  {staff.role}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {staff.department?.name || staff.department || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                <Mail size={12} className="text-gray-400" />
                                {staff.email || staff.user?.email || "N/A"}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                <Phone size={12} className="text-gray-400" />
                                {staff.phone || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                              <Clock size={12} className="text-gray-400" />
                              {staff.schedule || "Day Shift"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              staff.status === "ACTIVE"    ? "bg-green-100 text-green-700" :
                              staff.status === "ON_LEAVE" ? "bg-yellow-100 text-yellow-700" :
                              staff.status === "TERMINATED" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {staff.status || "ACTIVE"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                              <Users size={12} className="text-gray-400" />
                              {staff.load || 0} patients
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
          )}
        </div>
      </div>

      {/* Add Staff Modal - Single Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Staff</h2>
              <button onClick={() => { resetModal(); setIsAddModalOpen(false); }} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            <form onSubmit={handleAddStaff} className="p-6 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-lg px-4 py-3 mb-4">
                  {formError}
                </div>
              )}

              {/* Admin User Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Admin User <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type name and press Enter..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchAdminUsers())}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                  <button
                    type="button"
                    onClick={searchAdminUsers}
                    disabled={isSearchingAdmin}
                    className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {isSearchingAdmin ? "..." : "Search"}
                  </button>
                </div>

                {/* Search Results Dropdown */}
                {showAdminResults && adminUsers.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {adminUsers.map((user) => (
                      <div 
                        key={user.user_id}
                        onClick={() => selectAdminUser(user)}
                        className={`px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-0 flex items-center justify-between ${
                          selectedAdminUser?.user_id === user.user_id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.first_name || user.firstName} {user.last_name || user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.username} • {user.email || "No email"}
                          </p>
                        </div>
                        {selectedAdminUser?.user_id === user.user_id && (
                          <Check size={16} className="text-blue-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showAdminResults && !isSearchingAdmin && adminUsers.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2">No users found. Try a different name.</p>
                )}

                {/* Selected User Badge */}
                {selectedAdminUser && (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <Check size={14} className="text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Selected: {selectedAdminUser.first_name || selectedAdminUser.firstName} {selectedAdminUser.last_name || selectedAdminUser.lastName}
                    </span>
                    <button 
                      type="button"
                      onClick={() => { setSelectedAdminUser(null); setAdminSearchQuery(""); }}
                      className="ml-auto text-blue-400 hover:text-blue-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={staffForm.firstName} 
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={staffForm.lastName} 
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={staffForm.email} 
                    onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={staffForm.phone} 
                    onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="09XXXXXXXXX"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select 
                    required
                    value={staffForm.role} 
                    onChange={(e) => setStaffForm({...staffForm, role: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="">Select Role</option>
                    {VALID_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Department {isDepartmentRequired && <span className="text-red-400">*</span>}
                  </label>
                  <select 
                    required={isDepartmentRequired}
                    value={staffForm.department_id} 
                    onChange={(e) => setStaffForm({...staffForm, department_id: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                    disabled={!isDepartmentRequired && staffForm.role === "ADMIN"}
                  >
                    <option value="">
                      {staffForm.role === "ADMIN" ? "Not Required" : "Select Department"}
                    </option>
                    {departments.map((d) => (
                      <option key={d.department_id || d.name} value={d.department_id || d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                  <select 
                    value={staffForm.gender} 
                    onChange={(e) => setStaffForm({...staffForm, gender: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Employee ID</label>
                  <input 
                    type="text" 
                    value={staffForm.employeeId} 
                    onChange={(e) => setStaffForm({...staffForm, employeeId: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="EMP-001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select 
                    value={staffForm.status} 
                    onChange={(e) => setStaffForm({...staffForm, status: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={staffForm.dateOfBirth} 
                    onChange={(e) => setStaffForm({...staffForm, dateOfBirth: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <textarea 
                  value={staffForm.address} 
                  onChange={(e) => setStaffForm({...staffForm, address: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10"
                  rows={2}
                  placeholder="Full address..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { resetModal(); setIsAddModalOpen(false); }}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !selectedAdminUser}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-xl transition disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div> 
  );
}

export default StaffManagement;