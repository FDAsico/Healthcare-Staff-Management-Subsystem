import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Calendar, CheckCircle } from "lucide-react";

const Appointment = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const handleSidebarCollapse = (event) => {
      setCollapsed(event.detail);
    };

    window.addEventListener("sidebar-collapse", handleSidebarCollapse);
    return () =>
      window.removeEventListener("sidebar-collapse", handleSidebarCollapse);
  }, []);

  useEffect(() => {
    const syncAppointments = () => {
      const patients =
        JSON.parse(localStorage.getItem("patients")) || [];

      const storedAppointments =
        JSON.parse(localStorage.getItem("appointments")) || [];

      const merged = patients.map((p) => {
        const existing = storedAppointments.find(
          (appt) => appt.id === p.id
        );

        return (
          existing || {
            id: p.id,
            patient: `${p.firstName} ${p.lastName}`,
            doctor: "Not Assigned",
            date: p.lastVisit || "-",
            time: "10:00 AM",
            reason: p.condition || "General Checkup",
            status: "Pending",
          }
        );
      });

      setAppointments(merged);
      localStorage.setItem("appointments", JSON.stringify(merged));
    };

    syncAppointments();

    window.addEventListener("focus", syncAppointments);
    window.addEventListener("storage", syncAppointments);

    return () => {
      window.removeEventListener("focus", syncAppointments);
      window.removeEventListener("storage", syncAppointments);
    };
  }, []);

  const confirmAppointment = (id) => {
    setAppointments((prev) => {
      const updated = prev.map((appt) =>
        appt.id === id ? { ...appt, status: "Confirmed" } : appt
      );

      localStorage.setItem("appointments", JSON.stringify(updated));

      // 🔥 TRIGGER REAL-TIME SYNC
      window.dispatchEvent(new Event("appointments-updated"));

      return updated;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    const date = new Date(dateStr);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Appointments</h1>
              <p className="text-gray-600">
                Automatically generated from patient records.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <Calendar size={18} />
              <span className="text-sm font-medium">
                {appointments.length} total
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-500 text-xl font-semibold">
                  No Patients Found (No Appointments Yet)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between rounded-xl border p-5"
                  >
                    <div>
                      <p className="font-semibold text-lg">{appt.patient}</p>

                      <p className="text-sm text-gray-500">
                        {formatDate(appt.date)} at {appt.time}
                      </p>

                      <p className="text-sm text-gray-500">
                        {appt.reason}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full font-semibold ${
                          appt.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <CheckCircle size={16} />
                        {appt.status}
                      </span>

                      {appt.status !== "Confirmed" && (
                        <button
                          onClick={() => confirmAppointment(appt.id)}
                          className="mt-3 block bg-black text-white px-5 py-2 text-sm rounded-lg"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Appointment;