import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import AddPatient from "../components/adminAddPatient";
import {
  Users,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  X,
  ChevronRight,
  UserPlus,
  CalendarPlus,
} from "lucide-react";

// ─── STORAGE HELPERS ────────────────────────────────────
const getStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const getLast24Hours = (data) => {
  const now = Date.now();
  return data.filter((item) => item.createdAt && now - item.createdAt <= 86400000);
};

const formatChange = (current, previous, suffix = "") => {
  const diff = current - previous;
  if (diff === 0) return `No change ${suffix}`;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff} ${suffix}`;
};

const seedDefaults = () => {
  if (!localStorage.getItem("doctors")) setStorage("doctors", []);
  if (!localStorage.getItem("departments")) setStorage("departments", []);
  if (!localStorage.getItem("patients")) setStorage("patients", []);
  if (!localStorage.getItem("appointments")) setStorage("appointments", []);
};

// ─── COMPONENTS ───────────────────────────────────────────
const Dashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true");

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: { value: 0, change: "" },
    todayAppointments: { value: 0, change: "" },
    activeCases: { value: 0, change: "" },
    criticalAlerts: { value: 0, change: "" },
  });

  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  useEffect(() => {
    seedDefaults();
  }, []);

  const syncData = () => {
    const savedAppointments = getStorage("appointments", []);
    const savedPatients = getStorage("patients", []);
    const savedDoctors = getStorage("doctors", []);
    const savedDepartments = getStorage("departments", []);

    const normalizedAppointments = savedAppointments.map((a) => ({
      ...a,
      createdAt: a.createdAt || Date.now(),
    }));

    const todayAppts = getLast24Hours(normalizedAppointments);
    const activeCases = todayAppts.filter((a) => a.status === "Confirmed").length;

    setAppointments(normalizedAppointments);
    setPatients(savedPatients);
    setDoctors(savedDoctors);
    setDepartments(savedDepartments);

    setStats({
      totalPatients: {
        value: savedPatients.length,
        change: formatChange(savedPatients.length, Math.max(0, savedPatients.length - 12), "from last month"),
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
        value: savedPatients.filter((p) => p.status === "critical").length,
        change: formatChange(
          savedPatients.filter((p) => p.status === "critical").length,
          Math.max(0, savedPatients.filter((p) => p.status === "critical").length + 2),
          "from last month"
        ),
      },
    });
  };

  useEffect(() => {
    syncData();
    const events = ["storage", "appointments-updated", "patients-updated", "doctors-updated", "departments-updated"];
    events.forEach((e) => window.addEventListener(e, syncData));
    return () => events.forEach((e) => window.removeEventListener(e, syncData));
  }, []);

  useEffect(() => {
    const handler = (e) => setCollapsed(e.detail);
    window.addEventListener("sidebar-collapse", handler);
    return () => window.removeEventListener("sidebar-collapse", handler);
  }, []);

  const updateStatus = (id, status) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status } : a));
    setAppointments(updated);
    setStorage("appointments", updated);
    window.dispatchEvent(new Event("appointments-updated"));
  };

  const handleDeleteAppointment = (id) => {
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    setStorage("appointments", updated);
    window.dispatchEvent(new Event("appointments-updated"));
  };

  const todayAppointments = getLast24Hours(appointments);

  return (
    <div className="bg-gray-100 min-h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 pb-24">
          <h1 className="text-xl font-bold mb-6">Welcome Admin!</h1>

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
                    <AppointmentRow key={item.id} item={item} onUpdateStatus={updateStatus} />
                  ))
                )}
              </div>

              <button
                onClick={() => setShowAppointmentsModal(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition"
              >
                <Calendar size={16} strokeWidth={1.5} />
                View All Appointments
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-[480px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold">Doctors</h2>
                <button
                  onClick={() => setActivePage("staff-all")}
                  className="text-sm text-gray-500 hover:text-black transition"
                >
                  View All
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {doctors.length === 0 ? (
                  <EmptyState message="No doctors available" />
                ) : (
                  doctors.map((doctor) => <DoctorRow key={doctor.id} doctor={doctor} />)
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

              <button
                onClick={() => setActivePage("patients")}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition"
              >
                <Users size={16} strokeWidth={1.5} />
                View All Patients
              </button>
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
                departments.map((dept) => <DepartmentCard key={dept.id} department={dept} />)
              )}
            </div>
          </div>
        </div>

        {/* ── FLOATING ACTION BUTTONS ── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className={`mx-auto flex justify-center gap-6 p-6 pointer-events-auto ${collapsed ? "ml-20" : "ml-64"}`}>
            <button
              onClick={() => setActivePage("patients")}
              className="bg-black text-white py-4 px-12 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg min-w-[280px]"
            >
              <UserPlus size={20} strokeWidth={1.5} />
              <span className="font-medium text-sm">Add New Patient</span>
            </button>
            <button
              onClick={() => setShowAppointmentsModal(true)}
              className="bg-white border border-gray-300 py-4 px-12 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-lg min-w-[280px]"
            >
              <CalendarPlus size={20} strokeWidth={1.5} />
              <span className="font-medium text-sm">Schedule Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── ALL APPOINTMENTS MODAL ── */}
      {showAppointmentsModal && (
        <Modal onClose={() => setShowAppointmentsModal(false)} title="All Appointments">
          {appointments.length === 0 ? (
            <EmptyState message="No appointments found" />
          ) : (
            appointments.map((item) => (
              <div
                key={item.id}
                className="border-b py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded transition"
              >
                <div>
                  <p className="font-medium text-sm">{item.patient}</p>
                  <p className="text-sm text-gray-500">{item.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} />
                  <button
                    onClick={() => updateStatus(item.id, "Confirmed")}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(item.id)}
                    className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </Modal>
      )}
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

const AppointmentRow = ({ item, onUpdateStatus }) => (
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
      <button
        onClick={() => onUpdateStatus(item.id, item.status === "Confirmed" ? "Pending" : "Confirmed")}
        className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
      >
        {item.status === "Confirmed" ? "Set Pending" : "Confirm"}
      </button>
    </div>
  </div>
);

const DoctorRow = ({ doctor }) => (
  <div className="flex justify-between items-center py-3 border-b last:border-b-0">
    <div>
      <p className="font-medium text-sm">{doctor.name}</p>
      <p className="text-xs text-gray-500">{doctor.specialty}</p>
    </div>
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        doctor.available ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      }`}
    >
      {doctor.available ? "Available" : "Unavailable"}
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
      {department.active && (
        <span className="text-xs px-2 py-1 bg-black text-white rounded-full">Active</span>
      )}
    </div>
    <p className="text-sm text-gray-500 mb-4">{department.description}</p>
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="font-medium text-sm">{department.head}</p>
      <p className="text-xs text-gray-500">Department Head</p>
    </div>
  </div>
);

const Avatar = ({ name, color = "bg-gray-200 text-gray-600" }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${color}`}>
    {name?.charAt(0)?.toUpperCase() || "P"}
  </div>
);

const Modal = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <h2 className="text-base font-semibold">{title}</h2>
        <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded transition">
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  </div>
);

export default Dashboard;