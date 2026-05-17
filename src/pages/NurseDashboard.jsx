import React, { useEffect, useState } from "react";
import NurseSidebar from "../components/NurseSidebar";
import api from "../lib/api";

import {
  Users,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
} from "lucide-react";

const NurseDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true");

  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  // Fetch data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        api.get("/patient-proxy/appointments").catch((err) => {
          console.error("Appointments API error:", err.response?.status, err.response?.data);
          return { data: { data: { appointments: [] } } };
        }),
        api.get("/patient-proxy/health-records").catch((err) => {
          console.error("Patients API error:", err.response?.status, err.response?.data);
          return { data: { data: { records: [] } } };
        }),
      ]);

      // Extract data based on API response structure
      const appointmentsData = appointmentsRes.data?.data?.appointments || [];
      const patientsData = patientsRes.data?.data?.records || [];

      // Normalize appointments data
      const normalizedAppointments = appointmentsData.map((a) => ({
        id: a.appointment_id || a._id,
        patient: a.patient_name || "Unknown",
        reason: a.reason || "General Checkup",
        time: a.scheduled_at ? new Date(a.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        status: a.status || "Pending",
        date: a.scheduled_at,
        createdAt: a.created_at || a.scheduled_at,
      }));

      // Normalize patients data - show all health records
      const normalizedPatients = patientsData.map((p, index) => ({
        id: p.record_id || p.patient_id || index,
        patientId: p.patient_id,
        name: p.patient_name || "Unknown",
        recordType: p.record_type || "General Checkup",
        recordDate: p.record_date || p.created_at,
        summary: p.summary || "",
        provider: p.provider || "",
        details: p.details || null,
      }));

      setAppointments(normalizedAppointments);
      setPatients(normalizedPatients);
    } catch (err) {
      console.error("Error fetching nurse dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLast24HoursAppointments = (data) => {
    const now = Date.now();

    return data.filter((item) => {
      if (!item.createdAt) return false;
      return now - new Date(item.createdAt).getTime() <= 24 * 60 * 60 * 1000;
    });
  };

  useEffect(() => {
    const handleSidebarCollapse = (event) => {
      setCollapsed(event.detail);
    };

    window.addEventListener(
      "sidebar-collapse",
      handleSidebarCollapse
    );

    return () => {
      window.removeEventListener(
        "sidebar-collapse",
        handleSidebarCollapse
      );
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status } : a
        )
      );
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) =>
        prev.filter((a) => a.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    }
  };

  const todayAppointments =
    getLast24HoursAppointments(appointments);

  const activeCasesCount =
    todayAppointments.filter(
      (item) => item.status === "Confirmed"
    ).length;

  // Generate recent activities from appointments
  const activities = appointments
    .slice(0, 5)
    .map((a) => ({
      type: a.status,
      text: `${a.status || "Pending"} Appointment`,
      name: a.patient || "Unknown Patient",
      time: a.time || a.scheduled_at || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

  return (

    <div className="bg-blue-500/30 min-h-screen flex">
      <NurseSidebar />

      <div
        className={`flex-1 p-6 transition-all duration-300 ${
          collapsed ? "ml-[85px]" : "ml-[265px]"
        }`}
      >
        <h1 className="text-[20px] font-bold mb-6">
          Good Day Nurse!
        </h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card
            title="Total Patients"
            icon={<Users />}
            value={patients.length}
            iconColor="text-blue-500"
          />

          <Card
            title="Today's Appointments"
            icon={<Calendar />}
            value={todayAppointments.length}
            iconColor="text-green-500"
          />

          <Card
            title="Active Cases"
            icon={<Activity />}
            value={activeCasesCount}
            iconColor="text-orange-500"
          />

          <Card
            title="Critical Alerts"
            icon={<AlertCircle />}
            value="0"
            iconColor="text-red-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm flex flex-col h-170">
            <h2 className="text-lg font-semibold mb-4">
              Today's Appointments
            </h2>

            <p className="text-sm text-gray-500 mb-3">
              You have {todayAppointments.length} appointment
              {todayAppointments.length !== 1
                ? "s"
                : ""}{" "}
              in the last 24 hours
            </p>

            <div className="flex-1 overflow-y-auto">
              {todayAppointments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-lg font-medium">
                    No appointments available
                  </p>
                </div>
              ) : (
                todayAppointments.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {item.patient}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium">
                        {item.time}
                      </p>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.status === "Confirmed"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>

                      <button
                        onClick={() =>
                          updateStatus(
                            item.id,
                            item.status === "Confirmed"
                              ? "Pending"
                              : "Confirmed"
                          )
                        }
                        className="text-xs px-2 py-1 border rounded-lg hover:bg-gray-100"
                      >
                        {item.status === "Confirmed"
                          ? "Set Pending"
                          : "Confirm"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() =>
                setShowAppointmentsModal(true)
              }
              className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-100"
            >
              <Calendar size={16} />
              View All Appointments
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-[480px]">
            <h2 className="text-lg font-semibold mb-4">
              Recent Activities
            </h2>

            <div className="flex-1 overflow-y-auto">
              {activities.map((act, index) => (
                <div
                  key={index}
                  className="flex gap-3 mb-4 items-start"
                >
                  <div className="p-2 rounded-full bg-gray-100">
                    {act.type === "Confirmed" ? (
                      <CheckCircle
                        size={16}
                        className="text-green-500"
                      />
                    ) : (
                      <Clock
                        size={16}
                        className="text-yellow-500"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {act.text}
                    </p>

                    <p className="text-xs text-gray-500">
                      {act.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAppointmentsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[700px] max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                All Appointments
              </h2>

              <button
                onClick={() =>
                  setShowAppointmentsModal(false)
                }
              >
                <X />
              </button>
            </div>

            {appointments.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                No appointments found
              </p>
            ) : (
              appointments.map((item) => (
                <div
                  key={item.id}
                  className="border-b py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {item.patient}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {item.status || "Pending"}
                    </span>

                    <button
                      onClick={() =>
                        updateStatus(
                          item.id,
                          "Confirmed"
                        )
                      }
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded-lg"
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteAppointment(item.id)
                      }
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Card = ({
  title,
  icon,
  value,
  iconColor,
}) => (
  <div className="bg-white p-5 rounded-xl shadow-sm flex justify-between">
    <div>
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>
    </div>

    <div className={iconColor}>{icon}</div>
  </div>
);

export default NurseDashboard;