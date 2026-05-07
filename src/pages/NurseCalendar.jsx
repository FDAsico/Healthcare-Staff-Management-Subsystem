import React, { useEffect, useMemo, useState } from "react";
import NurseSidebar from "../components/NurseSidebar";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const NurseCalendar = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);

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

    // Listen for updates
    window.addEventListener("storage", syncAppointments);
    window.addEventListener("focus", syncAppointments);
    window.addEventListener("appointments-updated", syncAppointments);

    return () => {
      window.removeEventListener("storage", syncAppointments);
      window.removeEventListener("focus", syncAppointments);
      window.removeEventListener(
        "appointments-updated",
        syncAppointments
      );
    };
  }, []);

  // Format date key
  const formatKey = (dateStr) => {
    if (!dateStr || dateStr === "-") return null;

    try {
      const d = new Date(dateStr);

      return d.toISOString().split("T")[0];
    } catch (e) {
      return null;
    }
  };

  // Group appointments by date
  const grouped = useMemo(() => {
    const map = {};

    appointments.forEach((appt) => {
      const key = formatKey(appt.date);

      if (key) {
        if (!map[key]) map[key] = [];

        map[key].push(appt);
      }
    });

    return map;
  }, [appointments]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const goPrevMonth = () =>
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );

  const goNextMonth = () =>
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const days = [];

  const startDay = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      )
    );
  }

  const formatKeyLocal = (date) => {
    const offset = date.getTimezoneOffset();

    const adjustedDate = new Date(
      date.getTime() - offset * 60 * 1000
    );

    return adjustedDate.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen flex bg-blue-500/30">
      <NurseSidebar />

      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Nurse Calendar
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              View patient appointment schedules and records.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={goPrevMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft />
            </button>

            <span className="text-lg font-semibold text-gray-700 w-44 text-center">
              {monthNames[currentDate.getMonth()]}{" "}
              {currentDate.getFullYear()}
            </span>

            <button
              onClick={goNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-blue-600">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-white py-3 border-r border-blue-500 last:border-r-0"
                >
                  {day}
                </div>
              )
            )}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-[1px] bg-gray-200">
            {days.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={idx}
                    className="h-32 bg-gray-50"
                  />
                );
              }

              const key = formatKeyLocal(day);
              const dayAppointments = grouped[key] || [];

              return (
                <div
                  key={idx}
                  className="h-32 p-2 bg-white flex flex-col overflow-hidden hover:bg-blue-50/40 transition-colors"
                >
                  <div className="text-xs font-bold text-gray-400 mb-2">
                    {day.getDate()}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {dayAppointments.map((appt) => (
                      <div
                        key={appt.id}
                        onClick={() => setSelectedAppt(appt)}
                        className={`text-[10px] px-2 py-1 rounded-lg cursor-pointer truncate shadow-sm transition-all hover:brightness-95 ${
                          appt.status === "Confirmed"
                            ? "bg-blue-600 text-white"
                            : "bg-yellow-300 text-black font-medium"
                        }`}
                      >
                        {appt.time} - {appt.patient}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[430px] p-6 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedAppt(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-5 border-b pb-3 text-gray-800">
              Nurse Appointment Details
            </h2>

            <div className="space-y-4 text-sm">
              <p>
                <strong className="text-gray-500">
                  Patient:
                </strong>{" "}
                <span className="text-gray-900 font-medium">
                  {selectedAppt.patient}
                </span>
              </p>

              <p>
                <strong className="text-gray-500">
                  Doctor:
                </strong>{" "}
                <span className="text-gray-900 font-medium">
                  {selectedAppt.doctor}
                </span>
              </p>

              <p>
                <strong className="text-gray-500">
                  Date:
                </strong>{" "}
                <span className="text-gray-900 font-medium">
                  {selectedAppt.date}
                </span>
              </p>

              <p>
                <strong className="text-gray-500">
                  Time:
                </strong>{" "}
                <span className="text-gray-900 font-medium">
                  {selectedAppt.time}
                </span>
              </p>

              <p>
                <strong className="text-gray-500">
                  Reason:
                </strong>{" "}
                <span className="text-gray-900 font-medium">
                  {selectedAppt.reason}
                </span>
              </p>

              <div className="pt-2 flex items-center">
                <strong className="text-gray-500 mr-2">
                  Status:
                </strong>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedAppt.status === "Confirmed"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {selectedAppt.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseCalendar;