import React, { useEffect, useState } from "react";
import Sidebar from "../components/adminSidebar";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Plus,
  Building2,
  Users,
  ChevronRight,
  X,
  MapPin,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

const API_BASE = "https://healthcare-staff-management-api-648283514768.asia-southeast1.run.app/api/v1";

const getStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const getAuthToken = () => {
  return localStorage.getItem("token")
    || localStorage.getItem("authToken")
    || localStorage.getItem("accessToken")
    || "";
};

function Departments() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [departments, setDepartments] = useState(() => getStorage("departments", []));
  const [staffMembers] = useState(() => getStorage("staff", []));
  const [patients] = useState(() => getStorage("patients", []));

  // ✅ ADDED: Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contactEmail: "",
    contactPhone: "",
    isActive: true,
  });

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

  // ✅ FIXED: Better fetch with loading/error handling
  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    console.log("Available tokens:", {
      token: localStorage.getItem("token"),
      authToken: localStorage.getItem("authToken"),
      accessToken: localStorage.getItem("accessToken"),
    });
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const token = getAuthToken();
      if (!token) {
        setFetchError("No authentication token found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/departments`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setFetchError("Session expired. Please log in again.");
          // Optional: navigate("/login");
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        setIsLoading(false);
        return;
      }

      const result = await res.json();
      console.log("Fetch departments result:", result);

      // ✅ FIXED: Handle different API response shapes
      const data = result.data || result.departments || result || [];
      const normalized = Array.isArray(data) ? data : [data];

      setDepartments(normalized);
      localStorage.setItem("departments", JSON.stringify(normalized));
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setFetchError(error.message || "Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  };

  const totalStaff = staffMembers.length;
  const totalPatients = patients.length;
  const totalDepartments = departments.length;

  const handleAddDepartment = () => {
    setIsModalOpen(true);
    setFormError("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError("");
    setFormData({
      name: "",
      description: "",
      location: "",
      contactEmail: "",
      contactPhone: "",
      isActive: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
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

      const payload = {
        ...formData,
        isActive: Boolean(formData.isActive),
      };

      console.log("Sending payload:", payload);

      const res = await fetch(`${API_BASE}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Response status:", res.status);
      console.log("Response body:", result);

      if (!res.ok) {
        throw new Error(result.message || `Failed to create department (${res.status})`);
      }

      // ✅ FIXED: Extract actual department data from response
      const newDept = result.data || result.department || result;
      
      const updated = [newDept, ...departments];
      setDepartments(updated);
      localStorage.setItem("departments", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("departments-updated"));

      handleCloseModal();
    } catch (error) {
      console.error("Submit error:", error);
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
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

          {/* ✅ ADDED: Loading state */}
          {isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
              <Loader2 size={48} className="text-gray-300 mx-auto mb-4 animate-spin" strokeWidth={1.5} />
              <p className="text-lg font-semibold text-gray-600">Loading departments...</p>
            </div>
          )}

          {/* ✅ ADDED: Error state */}
          {fetchError && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-6">
              <p className="text-red-600 font-medium mb-2">{fetchError}</p>
              <button
                onClick={fetchDepartments}
                className="text-sm text-red-700 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Departments List */}
          {!isLoading && !fetchError && (
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
                    key={dept.department_id || dept.id || index}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-gray-50 transition cursor-pointer ${
                      index !== departments.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-black">{dept.name}</h3>
                        {(dept.isActive || dept.active) && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{dept.description}</p>
                      
                      <div className="flex flex-wrap gap-3 mt-2">
                        {(dept.location || dept.address) && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={12} />
                            {dept.location || dept.address}
                          </span>
                        )}
                        {(dept.contactEmail || dept.email) && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Mail size={12} />
                            {dept.contactEmail || dept.email}
                          </span>
                        )}
                        {(dept.contactPhone || dept.phone) && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Phone size={12} />
                            {dept.contactPhone || dept.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">
                          {dept.staff?.length || dept.staffCount || 0} Staff
                        </p>
                        <p className="text-xs text-gray-500">Department Members</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Department Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-black">Add New Department</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="e.g., Cardiology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    placeholder="Brief description of the department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="e.g., Building A, Floor 3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="dept@hospital.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active Department
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating..." : "Create Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Departments;