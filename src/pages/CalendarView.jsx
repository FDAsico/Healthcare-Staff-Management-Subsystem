import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Calendar as CalendarIcon, Search } from "lucide-react";

const CalendarView = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const syncSidebar = (event) => {
      setCollapsed(event.detail);
    };
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () =>
      window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    const syncAppointments = () => {
      const saved =
        JSON.parse(localStorage.getItem("appointments")) || [];
      setAppointments(saved);
    };

    syncAppointments();

    window.addEventListener("storage", syncAppointments);
    window.addEventListener("focus", syncAppointments);

    return () => {
      window.removeEventListener("storage", syncAppointments);
      window.removeEventListener("focus", syncAppointments);
    };
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredAppointments = appointments.filter(
    (appt) =>
      appt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[24px] font-bold flex items-center gap-2">
            <CalendarIcon size={22} /> Calendar View
          </h1>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-l font-medium">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-l font-medium">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-l font-medium">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-l font-medium">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-l font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-gray-500"
                  >
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">
                      {appt.patient}
                    </td>

                    <td className="px-6 py-4">
                      {formatDate(appt.date)}
                    </td>

                    <td className="px-6 py-4">
                      {appt.time}
                    </td>

                    <td className="px-6 py-4">
                      {appt.doctor}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          appt.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default CalendarView;