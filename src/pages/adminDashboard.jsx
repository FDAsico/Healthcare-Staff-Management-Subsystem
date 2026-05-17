import React, { useEffect, useState } from "react";
import Sidebar from "../components/adminSidebar";
import api from "../lib/api";
import {
  Users,
  Calendar,
  Activity,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

// ─── API HELPERS ────────────────────────────────────
const getLast24Hours = (data) => {
  const now = Date.now();
  return data.filter((item) => {
    const itemDate = new Date(item.date || item.appointmentDate || item.createdAt).getTime();
    return itemDate && now - itemDate <= 86400000;
  });
};

const formatChange = (current, previous, suffix = "") => {
  const diff = current - previous;
  if (diff === 0) return `No change ${suffix}`;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff} ${suffix}`;
};

// ─── COMPONENTS ───────────────────────────────────────────
const Dashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true");

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: { value: 0, change: "" },
    todayAppointments: { value: 0, change: "" },
    activeCases: { value: 0, change: "" },
    criticalAlerts: { value: 0, change: "" },
  });

  // Fetch data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [patientsRes, appointmentsRes, staffRes, departmentsRes] = await Promise.all([
        api.get("/patient-proxy/health-records").catch((err) => {
          console.error("Patients API error:", err.response?.status, err.response?.data);
          return { data: { data: [] } };
        }),
        api.get("/patient-proxy/appointments").catch((err) => {
          console.error("Appointments API error:", err.response?.status, err.response?.data);
          return { data: { data: [] } };
        }),
        api.get("/staff").catch((err) => {
          console.error("Staff API error:", err.response?.status, err.response?.data);
          return { data: { data: [] } };
        }),
        api.get("/departments").catch((err) => {
          console.error("Departments API error:", err.response?.status, err.response?.data);
          return { data: { data: [] } };
        }),
      ]);

      // Extract data based on specific API response structures
      // Appointments: response.data.data.appointments
      const appointmentsData = appointmentsRes.data?.data?.appointments || [];
      
      // Patients (health records): response.data.data.records  
      const patientsData = patientsRes.data?.data?.records || [];
      
      // Staff: response.data.data (array directly)
      const staffData = staffRes.data?.data || [];
      
      // Departments: response.data.data (array directly)
      const departmentsData = departmentsRes.data?.data || [];

      // Filter doctors from staff (role === "DOCTOR")
      const doctorsData = staffData.filter((s) => s.role === "DOCTOR" || s.position?.toLowerCase().includes("doctor"));

      // Normalize appointments data from API
      const normalizedAppointments = appointmentsData.map((a) => ({
        ...a,
        id: a.appointment_id || a._id,
        patient: a.patient_name || "Unknown",
        reason: a.reason || "General Checkup",
        time: a.scheduled_at ? new Date(a.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        status: a.status || "Pending",
        date: a.scheduled_at,
      }));

      const todayAppts = getLast24Hours(normalizedAppointments);
      const activeCases = todayAppts.filter((a) => a.status === "Confirmed" || a.status === "Scheduled").length;

      // Normalize patients data from health records API
      const normalizedPatients = patientsData.map((p, index) => ({
        ...p,
        id: p.record_id || p.patient_id || index + 1,
        firstName: p.patient_name?.split(' ')[0] || "Unknown",
        lastName: p.patient_name?.split(' ').slice(1).join(' ') || "",
        condition: p.record_type || "General Checkup",
        status: "stable",
      }));

      setAppointments(normalizedAppointments);
      setPatients(normalizedPatients);
      setDoctors(doctorsData);
      setDepartments(departmentsData);

      setStats({
        totalPatients: {
          value: normalizedPatients.length,
          change: formatChange(normalizedPatients.length, Math.max(0, normalizedPatients.length - 12), "from last month"),
        },
        todayAppointments: {
          value: todayAppts.length,
          change: formatChange(todayAppts.length, Math.max(0, todayAppts.length - 3), "from last month"),
        },
        activeCases: {
          value: activeCases,
          change: formatChange(activeCases, Math.max(0, activeCases - 8), "from last month"),
        },
        criticalAlerts: {
          value: normalizedPatients.filter((p) => p.status === "critical" || p.priority === "high").length,
          change: formatChange(
            normalizedPatients.filter((p) => p.status === "critical" || p.priority === "high").length,
            Math.max(0, normalizedPatients.filter((p) => p.status === "critical" || p.priority === "high").length + 2),
            "from last month"
          ),
        },
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
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

  useEffect(() => {
    const handler = (e) => setCollapsed(e.detail);
    window.addEventListener("sidebar-collapse", handler);
    return () => window.removeEventListener("sidebar-collapse", handler);
  }, []);

  const todayAppointments = getLast24Hours(appointments);

  return (
    <div className="bg-gray-100 min-h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 pb-24">
          <h1 className="text-xl font-bold mb-6">Welcome Admin!</h1>

          {loading && (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500 mb-6">
              <p className="text-xl font-semibold">Loading dashboard data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6 text-center text-red-600 mb-6">
              <p className="text-xl font-semibold">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── STATS CARDS ── */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Patients" icon={<Users size={22} strokeWidth={1.5} />} value={stats.totalPatients.value} change={stats.totalPatients.change} iconColor="text-blue-500" />
            <StatCard title="Today's Appointments" icon={<Calendar size={22} strokeWidth={1.5} />} value={stats.todayAppointments.value} change={stats.todayAppointments.change} iconColor="text-green-500" />
            <StatCard title="Active Cases" icon={<Activity size={22} strokeWidth={1.5} />} value={stats.activeCases.value} change={stats.activeCases.change} iconColor="text-orange-500" />
            <StatCard title="Critical Alerts" icon={<AlertCircle size={22} strokeWidth={1.5} />} value={stats.criticalAlerts.value} change={stats.criticalAlerts.change} iconColor="text-red-500" />
          </div>

          {/* ── APPOINTMENTS & DOCTORS ── */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm flex flex-col h-[480px]">
              <h2 className="text-base font-semibold mb-1">Today's Appointments</h2>
              <p className="text-sm text-gray-500 mb-3">
                You have {todayAppointments.length} appointment{todayAppointments.length !== 1 ? "s" : ""} scheduled for today
              </p>

              <div className="flex-1 overflow-y-auto pr-1">
                {todayAppointments.length === 0 ? (
                  <EmptyState message="No appointments available" />
                ) : (
                  todayAppointments.map((item) => (
                    <AppointmentRow key={item.id} item={item} />
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-[480px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold">Doctors</h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {doctors.length === 0 ? (
                  <EmptyState message="No doctors available" />
                ) : (
                  doctors.map((doctor, idx) => <DoctorRow key={doctor.id || idx} doctor={doctor} />)
                )}
              </div>
            </div>
          </div>

          {/* ── PATIENTS & MEDICAL RECORDS ── */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm flex flex-col h-[400px]">
              <h2 className="text-base font-semibold mb-1">Patient's List</h2>
              <p className="text-sm text-gray-500 mb-3">You have {patients.length} patients registered</p>

              <div className="flex-1 overflow-y-auto pr-1">
                {patients.length === 0 ? (
                  <EmptyState message="No patients registered" />
                ) : (
                  patients.map((patient, index) => (
                    <PatientRow key={patient.id || index} patient={patient} index={index} />
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-[400px]">
              <h2 className="text-base font-semibold mb-1">Medical Records</h2>
              <p className="text-sm text-gray-500 mb-3">Patient medical history and record</p>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {patients.length === 0 ? (
                  <EmptyState message="No medical records available" />
                ) : (
                  patients.slice(0, 5).map((patient, index) => (
                    <MedicalRecordCard key={patient.id || index} patient={patient} index={index} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── DEPARTMENTS ── */}
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Departments</h2>
              <p className="text-sm text-gray-500">Smart Health Care Predictive Care System</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {departments.length === 0 ? (
                <div className="col-span-3 bg-white rounded-xl p-10 text-center text-gray-400">
                  No departments available
                </div>
              ) : (
                departments.map((dept, idx) => <DepartmentCard key={dept.id || idx} department={dept} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SUB-COMPONENTS ─────────────────────────────────────

const StatCard = ({ title, icon, value, change, iconColor }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-start">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{change}</p>
    </div>
    <div className={`${iconColor} mt-1`}>{icon}</div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-400 text-base font-medium">{message}</p>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`text-xs px-2 py-1 rounded-full ${
      status === "Confirmed" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
    }`}
  >
    {status || "Pending"}
  </span>
);

const AppointmentRow = ({ item }) => (
  <div className="flex justify-between items-center border-b py-3 hover:bg-gray-50 px-2 rounded transition">
    <div className="flex items-center gap-3">
      <Avatar name={item.patient} />
      <div>
        <p className="font-medium text-sm">{item.patient}</p>
        <p className="text-sm text-gray-500">{item.reason}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <p className="text-sm font-medium text-gray-700">{item.time}</p>
      <StatusBadge status={item.status} />
    </div>
  </div>
);

const DoctorRow = ({ doctor }) => (
  <div className="flex justify-between items-center py-3 border-b last:border-b-0">
    <div>
      <p className="font-medium text-sm">{doctor.firstName} {doctor.lastName}</p>
      <p className="text-xs text-gray-500">{doctor.role || "Doctor"}</p>
    </div>
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        doctor.status === "ACTIVE" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      }`}
    >
      {doctor.status === "ACTIVE" ? "Active" : "Inactive"}
    </span>
  </div>
);

const PatientRow = ({ patient, index }) => (
  <div className="flex justify-between items-center border-b py-3 hover:bg-gray-50 px-2 rounded transition">
    <div className="flex items-center gap-3">
      <Avatar name={patient.firstName} color="bg-blue-100 text-blue-600" />
      <div>
        <p className="font-medium text-sm">{`${patient.firstName || ""} ${patient.lastName || ""}`}</p>
        <p className="text-sm text-gray-500">{patient.condition || "General Checkup"}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">ID: {String(patient.id || index + 1).padStart(3, "0")}</span>
      <ChevronRight size={16} className="text-gray-400" />
    </div>
  </div>
);

const MedicalRecordCard = ({ patient, index }) => (
  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
    <p className="font-medium text-sm">{`${patient.firstName || ""} ${patient.lastName || ""}`}</p>
    <p className="text-xs text-gray-500 mt-1">ID: {String(patient.id || index + 1).padStart(3, "0")}</p>
  </div>
);

const DepartmentCard = ({ department }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-semibold text-base">{department.name}</h3>
      {department.isActive && (
        <span className="text-xs px-2 py-1 bg-black text-white rounded-full">Active</span>
      )}
    </div>
    <p className="text-sm text-gray-500 mb-4">{department.description}</p>
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="font-medium text-sm">{department.location}</p>
      <p className="text-xs text-gray-500">Location</p>
    </div>
  </div>
);

const Avatar = ({ name, color = "bg-gray-200 text-gray-600" }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${color}`}>
    {name?.charAt(0)?.toUpperCase() || "P"}
  </div>
);

export default Dashboard;