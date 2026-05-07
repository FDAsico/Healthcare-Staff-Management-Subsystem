import React, { useEffect, useState } from "react";
import NurseSidebar from "../components/NurseSidebar";
import { User, X } from "lucide-react";

const NursePatient = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem("patients");
    return savedPatients ? JSON.parse(savedPatients) : [];
  });

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-blue-500/30 min-h-screen flex">
      <NurseSidebar />

      <div
        className="flex-1 p-6 transition-all duration-300 flex flex-col"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <h1 className="text-[24px] font-bold mb-6 text-black-900">
          Patients
        </h1>

        {patients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-90 text-center text-gray-500">
            <p className="text-xl font-semibold">No patients found.</p>
            <p className="text-sm text-gray-400 mt-4">
              No patient records available yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm flex-1 overflow-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-blue-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50">
                    <td className="px-6 py-4">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-6 py-4">{p.age}</td>
                    <td className="px-6 py-4">{p.gender}</td>
                    <td className="px-6 py-4">{p.condition}</td>
                    <td className="px-6 py-4">{formatDate(p.lastVisit)}</td>
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

      {isEditModalOpen && editPatientData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[900px] overflow-auto max-h-[90vh]">
            <div className="bg-blue-900 text-white px-6 py-6 flex items-center gap-2">
              <User size={24} />
              <h2 className="text-xl font-semibold">Edit Patient</h2>
              <button className="ml-auto" onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>

            <div className="p-7 grid grid-cols-2 gap-6">
              {[
                { label: "First Name", name: "firstName" },
                { label: "Last Name", name: "lastName" },
                { label: "Age", name: "age" },
                { label: "Gender", name: "gender" },
                { label: "Phone", name: "phone" },
                { label: "Email", name: "email" },
                { label: "Condition", name: "condition" },
                { label: "Last Visit", name: "lastVisit" },
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label className="text-sm font-medium">
                    {field.label}
                  </label>

                  {field.name === "gender" ? (
                    <select
                      name={field.name}
                      value={editPatientData[field.name]}
                      onChange={handleEditChange}
                      className="border rounded-lg px-4 py-2 mt-1"
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
                      className="border rounded-lg px-4 py-2 mt-1"
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

export default NursePatient;