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
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredRecords = records.filter(
    (r) =>
      r.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.condition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enrichedRecords = filteredRecords.map((r) => {
    const appt = appointments.find((a) => a.id === r.id);
    return {
      ...r,
      appointmentStatus: appt?.status || "No Appointment",
      doctor: appt?.doctor || "Not Assigned",
    };
  });

  const confirmedRecords = enrichedRecords.filter(
    (r) => r.appointmentStatus === "Confirmed"
  );

  const formatLabel = (text) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div
        className="flex-1 p-6 flex flex-col"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <h1 className="text-3xl font-bold mb-6">Medical Records</h1>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm flex-1 overflow-auto">
          <table className="w-full min-w-[750px]">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-blue-600">Name</th>
                <th className="px-6 py-3 text-left text-blue-600">Age</th>
                <th className="px-6 py-3 text-left text-blue-600">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-blue-600">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-blue-600">
                  Appointment
                </th>
              </tr>
            </thead>

            <tbody>
              {confirmedRecords.length > 0 ? (
                confirmedRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openModal(r)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium">
                      {r.firstName} {r.lastName}
                    </td>

                    <td className="px-6 py-4">{r.age}</td>

                    <td className="px-6 py-4">{r.condition}</td>

                    <td className="px-6 py-4">
                      {formatDate(r.lastVisit)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-2 text-sm rounded-full font-medium bg-green-100 text-green-700">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-16 text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <User size={40} />
                      <p className="text-lg font-medium">
                        No records available
                      </p>
                      <p className="text-sm">
                        Confirmed patient records will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isViewModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[900px] max-h-[90vh] overflow-auto">
            <div className="bg-black text-white px-6 py-5 flex items-center">
              <User className="mr-2" />
              <h2 className="text-xl font-semibold">
                Patient Details
              </h2>
              <button className="ml-auto" onClick={closeModal}>
                <X />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-5">
              {Object.entries(selectedRecord)
                .filter(
                  ([key]) =>
                    key !== "email" &&
                    key !== "phone" &&
                    key !== "id"
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium">
                      {formatLabel(key)}
                    </label>
                    <div className="bg-gray-100 p-2 rounded mt-1">
                      {key === "lastVisit"
                        ? formatDate(value)
                        : value}
                    </div>
                  </div>
                ))}

              <div>
                <label className="text-sm font-medium">Doctor</label>
                <div className="bg-gray-100 p-2 rounded mt-1">
                  {appointments.find(
                    (a) => a.id === selectedRecord.id
                  )?.doctor || "Not Assigned"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;