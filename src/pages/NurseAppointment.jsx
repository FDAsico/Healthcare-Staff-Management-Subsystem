// NurseAppointment.jsx

import React, { useEffect, useState } from "react";
import NurseSidebar from "../components/NurseSidebar";
import { Calendar, CheckCircle, Stethoscope, Briefcase } from "lucide-react";

const NurseAppointment = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const handleSidebarCollapse = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", handleSidebarCollapse);
    return () =>
      window.removeEventListener(
        "sidebar-collapse",
        handleSidebarCollapse
      );
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
            doctor: "",
            department: "",
            date:
              p.lastVisit ||
              new Date().toISOString().split("T")[0],
            time: "10:00 AM",
            reason: p.condition || "General Checkup",
            status: "Pending",
          }
        );
      });

      setAppointments(merged);
      localStorage.setItem(
        "appointments",
        JSON.stringify(merged)
      );
    };

    syncAppointments();

    window.addEventListener("focus", syncAppointments);
    window.addEventListener("storage", syncAppointments);

    return () => {
      window.removeEventListener("focus", syncAppointments);
      window.removeEventListener("storage", syncAppointments);
    };
  }, []);

  const handleDoctorAssignment = (id, doctorName) => {
    setAppointments((prev) => {
      const updated = prev.map((appt) =>
        appt.id === id
          ? {
              ...appt,
              doctor: doctorName,
              department: "",
            }
          : appt
      );

      localStorage.setItem(
        "appointments",
        JSON.stringify(updated)
      );

      window.dispatchEvent(
        new Event("appointments-updated")
      );

      return updated;
    });
  };

  const confirmAppointment = (id) => {
    setAppointments((prev) => {
      const updated = prev.map((appt) =>
        appt.id === id
          ? { ...appt, status: "Confirmed" }
          : appt
      );

      localStorage.setItem(
        "appointments",
        JSON.stringify(updated)
      );

      window.dispatchEvent(
        new Event("appointments-updated")
      );

      return updated;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "No Date Set";

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
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Appointments
              </h1>
              <p className="text-gray-600">
                Assign medical staff and confirm visits.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-200">
              <Calendar
                size={18}
                className="text-blue-600"
              />
              <span className="text-sm font-semibold">
                {appointments.length} Records
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {appointments.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-medium">
                  No patient records found.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-gray-50/50 transition-colors gap-6"
                  >
                    <div className="flex gap-4 items-start min-w-[250px]">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {appt.patient.charAt(0)}
                      </div>

                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {appt.patient}
                        </p>

                        <p className="text-xs text-blue-600 mt-1 uppercase tracking-widest font-bold">
                          {formatDate(appt.date)} •{" "}
                          {appt.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center gap-4">
                      <div className="relative flex-1 max-w-[240px]">
                        <Stethoscope
                          size={16}
                          className="absolute left-3 top-3 text-gray-400 pointer-events-none"
                        />

                        <select
                          value={appt.doctor}
                          onChange={(e) =>
                            handleDoctorAssignment(
                              appt.id,
                              e.target.value
                            )
                          }
                          disabled={
                            appt.status === "Confirmed"
                          }
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="">
                            Select Doctor...
                          </option>
                        </select>

                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                          <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>

                      <div className="relative flex-1 max-w-[200px]">
                        <Briefcase
                          size={16}
                          className="absolute left-3 top-3 text-gray-400"
                        />

                        <input
                          type="text"
                          placeholder="Department"
                          value={appt.department}
                          readOnly
                          className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none italic font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 min-w-[200px] justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          appt.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <CheckCircle size={14} />
                        {appt.status}
                      </span>

                      {appt.status !== "Confirmed" && (
                        <button
                          onClick={() =>
                            confirmAppointment(appt.id)
                          }
                          disabled={!appt.doctor}
                          className={`px-5 py-2 text-xs font-bold rounded-lg transition-all shadow-sm
                            ${
                              appt.doctor
                                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          Confirm Visit
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

export default NurseAppointment;