import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import AddPatientButton from "../components/AddPatient";
import { User, Phone, Mail, Calendar, Users, X, Search } from "lucide-react";

const Patients = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem("patients");
    return savedPatients ? JSON.parse(savedPatients) : [];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPatientData, setEditPatientData] = useState(null);

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    const syncPatients = (event) => {
      if (event?.detail?.source === "patients") return;
      const savedPatients = localStorage.getItem("patients");
      setPatients(savedPatients ? JSON.parse(savedPatients) : []);
    };

    window.addEventListener("patients-updated", syncPatients);
    window.addEventListener("storage", syncPatients);

    return () => {
      window.removeEventListener("patients-updated", syncPatients);
      window.removeEventListener("storage", syncPatients);
    };
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem("patients", JSON.stringify(patients));
    } else {
      localStorage.removeItem("patients");
    }

    window.dispatchEvent(
      new CustomEvent("patients-updated", { detail: { source: "patients" } })
    );
  }, [patients]);

  const addPatient = (patient) => {
    const id = Date.now();
    const newPatient = {
      id,
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      age: patient.age || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      condition: patient.condition || "-",
      lastVisit: patient.lastVisit || new Date().toISOString().split("T")[0],
    };
    setPatients((prevPatients) => [newPatient, ...prevPatients]);
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
      prev.map((p) =>
        p.id === editPatientData.id ? editPatientData : p
      )
    );
    closeEditModal();
  };

  // ✅ FORMAT DATE INTO WORD FORMAT
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div
        className="flex-1 p-6 transition-all duration-300 flex flex-col"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <h1 className="text-[24px] font-bold mb-6">Patients</h1>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={18} />

            <input
              type="text"
              placeholder="Search patients by name or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black"
            />
          </div>

          <AddPatientButton onAddPatient={addPatient} />
        </div>

        {patients.length === 0 || filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <p className="text-xl font-semibold">No patients found.</p>
            <p className="text-sm text-gray-400 mt-4">
              It seems you haven't added any patients yet. Use the button above to add one.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm flex-1 overflow-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{p.firstName} {p.lastName}</td>
                    <td className="px-6 py-4">{p.age}</td>
                    <td className="px-6 py-4">{p.gender}</td>
                    <td className="px-6 py-4">{p.condition}</td>

                    {/* ✅ FORMATTED DATE */}
                    <td className="px-6 py-4">
                      {formatDate(p.lastVisit)}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL (UNCHANGED) */}
      {isEditModalOpen && editPatientData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[900px] overflow-auto max-h-[90vh]">
            <div className="bg-black text-white px-6 py-6 flex items-center gap-2">
              <User size={24} />
              <h2 className="text-xl font-semibold">Edit Patient</h2>
              <button className="ml-auto" onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>

            <div className="p-7 grid grid-cols-2 gap-6">
              {[{ label: "First Name", name: "firstName" }, { label: "Last Name", name: "lastName" }, { label: "Age", name: "age" }, { label: "Gender", name: "gender" }, { label: "Phone", name: "phone" }, { label: "Email", name: "email" }, { label: "Condition", name: "condition" }, { label: "Last Visit", name: "lastVisit" }].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label className="text-sm font-medium">{field.label}</label>

                  {field.name === "gender" ? (
                    <select
                      name={field.name}
                      value={editPatientData[field.name]}
                      onChange={handleEditChange}
                      className="border rounded-lg px-4 py-2 mt-1 text-black-600"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      value={editPatientData[field.name]}
                      onChange={handleEditChange}
                      className="border rounded-lg px-4 py-2 mt-1 text-black-600"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center px-6 py-4">
              <button
                onClick={() => {
                  setPatients((prev) =>
                    prev.filter((p) => p.id !== editPatientData.id)
                  );
                  closeEditModal();
                }}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Delete
              </button>

              <div className="flex gap-3">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-1.5 border rounded-lg text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEditChanges}
                  className="px-5 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;