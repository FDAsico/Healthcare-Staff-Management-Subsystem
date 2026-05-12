import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const CalendarView = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    const syncAppointments = () => {
      const saved = JSON.parse(localStorage.getItem("appointments")) || [];
      setAppointments(saved);
    };

    syncAppointments();
    window.addEventListener("storage", syncAppointments);
    window.addEventListener("focus", syncAppointments);
    window.addEventListener("appointments-updated", syncAppointments);

    return () => {
      window.removeEventListener("storage", syncAppointments);
      window.removeEventListener("focus", syncAppointments);
      window.removeEventListener("appointments-updated", syncAppointments);
    };
  }, []);

  const formatKey = (dateStr) => {
    if (!dateStr || dateStr === "-") return null;
    try {
      const d = new Date(dateStr);
      return d.toISOString().split("T")[0];
    } catch (e) {
      return null;
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      const key = formatKey(a.date);
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
    });
    return map;
  }, [appointments]);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const goPrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const goNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const days = [];
  const startDay = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const formatKeyLocal = (date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split("T")[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-black">Welcome Admin!</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage appointments and schedules</p>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-black">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={goPrevMonth} 
                className="p-2 rounded-lg hover:bg-gray-100 transition border border-gray-200"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button 
                onClick={goNextMonth} 
                className="p-2 rounded-lg hover:bg-gray-100 transition border border-gray-200"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-3 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {days.map((day, idx) => {
              if (!day) return <div key={idx} className="h-36 bg-gray-50/50" />;

              const key = formatKeyLocal(day);
              const dayAppointments = grouped[key] || [];
              const today = isToday(day);

              return (
                <div
                  key={idx}
                  className={`h-36 p-2 flex flex-col overflow-hidden hover:bg-gray-50 transition-colors ${
                    today ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 px-1 ${
                    today ? "text-black" : "text-gray-400"
                  }`}>
                    {day.getDate()}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {dayAppointments.length === 0 ? (
                      <p className="text-[10px] text-gray-300 text-center mt-4">No appointments</p>
                    ) : (
                      dayAppointments.map((appt) => (
                        <div
                          key={appt.id}
                          onClick={() => setSelectedAppt(appt)}
                          className={`text-[11px] px-2 py-1 rounded cursor-pointer truncate transition-all hover:brightness-95 ${
                            appt.status === "Confirmed" 
                              ? "bg-black text-white" 
                              : "bg-gray-100 text-black font-medium border border-gray-200"
                          }`}
                        >
                          {appt.time} - {appt.patient}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;