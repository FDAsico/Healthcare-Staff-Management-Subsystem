import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPatient from "../components/adminAddPatient";
import {
  User,
  X,
  Search,
  ChevronRight,
  Users,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

const getStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const AdminPatient = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [patients, setPatients] = useState(() => getStorage("patients", []));
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPatientData, setEditPatientData] = useState(null);

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    const syncPatients = () => {
      const savedPatients = getStorage("patients", []);
      setPatients(savedPatients);
    };

    window.addEventListener("patients-updated", syncPatients);
    window.addEventListener("storage", syncPatients);

    return () => {
      window.removeEventListener("patients-updated", syncPatients);
      window.removeEventListener("storage", syncPatients);
    };
  }, []);

  const handleAddPatient = (formData) => {
    const newPatient = {
      ...formData,
      id: Date.now(),
      status: "normal",
      createdAt: Date.now(),
    };
    const updated = [...patients, newPatient];
    setPatients(updated);
    setStorage("patients", updated);
    window.dispatchEvent(new Event("patients-updated"));
  };

  const openEditModal = (patient) => {
    setEditPatientData({ ...patient });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditPatientData(null);
    setIsEditModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditPatientData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditChanges = () => {
    setPatients((prev) =>
      prev.map((p) => (p.id === editPatientData.id ? editPatientData : p))
    );
    closeEditModal();
  };

  const handleDeletePatient = (id) => {
    const updated = patients.filter((p) => p.id !== id);
    setPatients(updated);
    setStorage("patients", updated);
    window.dispatchEvent(new Event("patients-updated"));
    closeEditModal();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           (p.condition || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPatients = patients.length;
  const criticalPatients = patients.filter((p) => p.status === "critical").length;
  const todayVisits = patients.filter((p) => {
    if (!p.lastVisit) return false;
    return new Date(p.lastVisit).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-black">Welcome Admin!</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage patient records and information</p>
          </div>
          <AddPatient onAddPatient={handleAddPatient} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-blue-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Total Patients</span>
            </div>
            <p className="text-2xl font-bold text-black">{totalPatients}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-red-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold text-black">{criticalPatients}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-green-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Today's Visits</span>
            </div>
            <p className="text-2xl font-bold text-black">{todayVisits}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope size={18} className="text-orange-500" strokeWidth={1.5} />
              <span className="text-sm text-gray-600 font-medium">Conditions</span>
            </div>
            <p className="text-2xl font-bold text-black">{new Set(patients.map(p => p.condition).filter(Boolean)).size}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-gray-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search patients by name or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredPatients.length === 0 ? (
            <div className="p-16 text-center">
              <Users size={48} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-lg font-semibold text-gray-600">No patients found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm ? "Try adjusting your search" : "Add a new patient to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Age / Gender
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                            {p.firstName?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black">{p.firstName} {p.lastName}</p>
                            <p className="text-xs text-gray-500">ID: {String(p.id).padStart(3, "0")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {p.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Phone size={12} className="text-gray-400" />
                              {p.phone}
                            </div>
                          )}
                          {p.email && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Mail size={12} className="text-gray-400" />
                              {p.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-black">{p.age} years</p>
                        <p className="text-xs text-gray-500">{p.gender}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-black">{p.condition || "General Checkup"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(p.lastVisit)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          p.status === "critical" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {p.status === "critical" ? "Critical" : "Stable"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-sm font-medium text-black hover:text-gray-600 transition flex items-center gap-1"
                        >
                          Edit
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editPatientData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[800px] overflow-hidden">
            <div className="bg-black text-white px-6 py-5 flex items-center gap-3">
              <User size={22} strokeWidth={1.5} />
              <h2 className="text-lg font-semibold">Edit Patient</h2>
              <button className="ml-auto hover:bg-white/10 p-1 rounded transition" onClick={closeEditModal}>
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-5">
              {[
                { label: "First Name", name: "firstName", required: true },
                { label: "Last Name", name: "lastName", required: true },
                { label: "Age", name: "age", type: "number", required: true },
                { label: "Gender", name: "gender", isSelect: true, required: true },
                { label: "Phone", name: "phone", required: true },
                { label: "Email", name: "email" },
                { label: "Condition", name: "condition" },
                { label: "Last Visit", name: "lastVisit", type: "date" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-black">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.isSelect ? (
                    <select
                      name={field.name}
                      value={editPatientData[field.name] || ""}
                      onChange={handleEditChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mt-1 text-sm outline-none focus:border-gray-400 transition"
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={editPatientData[field.name] || ""}
                      onChange={handleEditChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mt-1 text-sm outline-none focus:border-gray-400 transition"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center px-6 py-5 border-t border-gray-100">
              <button
                onClick={() => handleDeletePatient(editPatientData.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
              >
                Delete Patient
              </button>

              <div className="flex gap-3">
                <button
                  onClick={closeEditModal}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEditChanges}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatient;