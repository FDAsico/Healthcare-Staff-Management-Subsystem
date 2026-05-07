import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { User, Search, X } from "lucide-react";

const MedicalRecords = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const syncData = () => {
      const savedPatients = JSON.parse(localStorage.getItem("patients")) || [];
      const savedAppointments = JSON.parse(localStorage.getItem("appointments")) || [];

      setRecords(savedPatients);
      setAppointments(savedAppointments);
    };

    syncData();

    // Listen for storage changes and custom events dispatched from Appointment.jsx
    window.addEventListener("storage", syncData);
    window.addEventListener("patients-updated", syncData);
    window.addEventListener("appointments-updated", syncData);

    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("patients-updated", syncData);
      window.removeEventListener("appointments-updated", syncData);
    };
  }, []);

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  const openModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setIsViewModalOpen(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Logic to combine Patient data with specific Appointment fields
  const enrichedRecords = records.map((patient) => {
    const appt = appointments.find((a) => a.id === patient.id);
    return {
      ...patient,
      appointmentStatus: appt?.status || "Pending",
      appointmentDate: appt?.date || "-",
      appointmentTime: appt?.time || "",
      doctor: appt?.doctor || "Not Assigned",
    };
  });

  // Filter based on search term and only show Confirmed appointments
  const confirmedRecords = enrichedRecords.filter((r) => {
    const matchesSearch = 
      r.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.condition?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch && r.appointmentStatus === "Confirmed";
  });

  const formatLabel = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div
        className="flex-1 p-6 flex flex-col transition-all duration-300"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <h1 className="text-[24px] font-bold mb-6">Medical Records</h1>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search records by name or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm flex-1 overflow-auto">
          <table className="w-full min-w-[750px]">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">Condition</th>
                <th className="px-6 py-3 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">Last Visit</th>
                <th className="px-6 py-3 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">Appointment</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {confirmedRecords.length > 0 ? (
                confirmedRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openModal(r)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {r.firstName} {r.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{r.age}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">{r.condition}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(r.lastVisit)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-700">{formatDate(r.appointmentDate)}</span>
                        <span className="text-xs text-gray-500">{r.appointmentTime}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-20 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <User size={48} className="opacity-20" />
                      <p className="text-lg font-medium">No confirmed records available</p>
                      <p className="text-sm">Confirmed appointments will automatically appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isViewModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-200 max-h-[90vh] overflow-auto shadow-2xl">
            <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={20} />
                <h2 className="text-xl font-semibold">Patient Medical Profile</h2>
              </div>
              <button onClick={closeModal} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-2 gap-6">
              {[
                { label: "Full Name", value: `${selectedRecord.firstName} ${selectedRecord.lastName}` },
                { label: "Age", value: selectedRecord.age },
                { label: "Medical Condition", value: selectedRecord.condition },
                { label: "Last Visit Date", value: formatDate(selectedRecord.lastVisit) },
                { label: "Scheduled Appointment", value: `${formatDate(selectedRecord.appointmentDate)} at ${selectedRecord.appointmentTime}` },
                { label: "Attending Doctor", value: selectedRecord.doctor },
              ].map((item, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-3">
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">{item.label}</label>
                  <p className="text-gray-900 font-medium text-lg mt-1">{item.value || "N/A"}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 px-8 py-4 flex justify-end">
              <button onClick={closeModal} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors">
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;