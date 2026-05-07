import React, { useEffect, useState } from "react";
import NurseSidebar from "../components/NurseSidebar";
import { User, Search, X } from "lucide-react";

const NurseMedicalRecord = () => {
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
      const savedPatients =
        JSON.parse(localStorage.getItem("patients")) || [];

      const savedAppointments =
        JSON.parse(localStorage.getItem("appointments")) || [];

      setRecords(savedPatients);
      setAppointments(savedAppointments);
    };

    syncData();

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

    return () =>
      window.removeEventListener("sidebar-collapse", syncSidebar);
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

  // Combine patient + appointment data
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

  // Only confirmed appointments
  const confirmedRecords = enrichedRecords.filter((r) => {
    const matchesSearch =
      r.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.condition?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && r.appointmentStatus === "Confirmed";
  });

  return (
    <div className="bg-blue-500/30 min-h-screen flex">
      <NurseSidebar />

      <div
        className="flex-1 p-6 flex flex-col transition-all duration-300"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-800">
            Nurse Medical Records
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Access confirmed patient medical records and appointment details.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex items-center gap-4 border border-gray-100">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search patient name or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm flex-1 overflow-auto border border-gray-100">
          <table className="w-full min-w-[750px]">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">
                  Patient Name
                </th>

                <th className="px-6 py-4 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">
                  Age
                </th>

                <th className="px-6 py-4 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">
                  Condition
                </th>

                <th className="px-6 py-4 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">
                  Last Visit
                </th>

                <th className="px-6 py-4 text-left text-blue-600 font-bold uppercase text-xs tracking-wider">
                  Appointment
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {confirmedRecords.length > 0 ? (
                confirmedRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => openModal(record)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {record.firstName} {record.lastName}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {record.age}
                    </td>

                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-700 font-medium">
                        {record.condition}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(record.lastVisit)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-700">
                          {formatDate(record.appointmentDate)}
                        </span>

                        <span className="text-xs text-gray-500">
                          {record.appointmentTime}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-20 text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <User size={50} className="opacity-20" />

                      <p className="text-lg font-semibold">
                        No confirmed records available
                      </p>

                      <p className="text-sm">
                        Confirmed patient appointments will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isViewModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-[800px] max-h-[90vh] overflow-auto shadow-2xl">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-5 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <User size={22} />

                <div>
                  <h2 className="text-xl font-bold">
                    Nurse Patient Record
                  </h2>

                  <p className="text-sm text-blue-100">
                    Patient medical information overview
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 grid grid-cols-2 gap-6">
              {[
                {
                  label: "Full Name",
                  value: `${selectedRecord.firstName} ${selectedRecord.lastName}`,
                },
                {
                  label: "Age",
                  value: selectedRecord.age,
                },
                {
                  label: "Medical Condition",
                  value: selectedRecord.condition,
                },
                {
                  label: "Last Visit Date",
                  value: formatDate(selectedRecord.lastVisit),
                },
                {
                  label: "Appointment Schedule",
                  value: `${formatDate(
                    selectedRecord.appointmentDate
                  )} at ${selectedRecord.appointmentTime}`,
                },
                {
                  label: "Assigned Doctor",
                  value: selectedRecord.doctor,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-100"
                >
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                    {item.label}
                  </label>

                  <p className="text-gray-800 font-semibold text-lg mt-2">
                    {item.value || "N/A"}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-5 flex justify-end rounded-b-3xl">
              <button
                onClick={closeModal}
                className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseMedicalRecord;