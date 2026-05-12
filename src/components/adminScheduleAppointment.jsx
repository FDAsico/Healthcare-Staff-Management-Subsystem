import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Stethoscope,
  Users,
  Building2,
  ArrowLeft,
  Clock,
  CheckCircle,
} from "lucide-react";

const initialForm = {
  date: "",
  time: "",
  patientName: "",
  patientAge: "",
  patientGender: "",
  department: "",
  doctor: "",
  reason: "",
};

const departments = [
  "General Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "ENT",
  "Gynecology",
];

const ScheduleAppointmentPage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [success, setSuccess] = useState(false);

  // Listen for sidebar collapse
  React.useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);
    window.addEventListener("sidebar-collapse", syncSidebar);
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (submitAttempted) {
      setSubmitAttempted(false);
      setErrors({});
    }

    let newValue = value;

    if (name === "patientAge") {
      newValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const err = {};

    if (!form.date) err.date = "Date is required";
    if (!form.time) err.time = "Time is required";
    if (!form.patientName.trim()) err.patientName = "Patient name is required";
    if (!form.patientAge) err.patientAge = "Age is required";
    if (!form.patientGender) err.patientGender = "Gender is required";
    if (!form.department) err.department = "Department is required";
    if (!form.doctor.trim()) err.doctor = "Doctor is required";
    if (!form.reason.trim()) err.reason = "Reason is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!validate()) return;

    const payload = {
      id: Date.now(),
      patient: form.patientName,
      age: form.patientAge,
      gender: form.patientGender,
      department: form.department,
      doctor: form.doctor,
      reason: form.reason,
      date: form.date,
      time: form.time,
      status: "Pending",
      createdAt: Date.now(),
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updated = [...existing, payload];
    localStorage.setItem("appointments", JSON.stringify(updated));
    window.dispatchEvent(new Event("appointments-updated"));

    setSuccess(true);

    // Reset after 2 seconds then navigate back
    setTimeout(() => {
      setForm(initialForm);
      setErrors({});
      setSubmitAttempted(false);
      setSuccess(false);
      navigate("/appointments/calendar");
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/appointments/calendar");
  };

  const inputWrapperClass = (fieldName) =>
    `w-full border rounded-lg px-4 py-2.5 mt-1 bg-white text-sm outline-none transition ${
      errors[fieldName]
        ? "border-red-400 ring-1 ring-red-100"
        : "border-gray-200 hover:border-gray-300 focus:border-black"
    }`;

  if (success) {
    return (
      <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold text-black mb-2">Appointment Scheduled!</h2>
            <p className="text-gray-500">Redirecting to calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
      <div className="p-6 pb-24 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition border border-gray-200"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-black">Schedule Appointment</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create a new appointment for a patient</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-5">
              {/* Date */}
              <div>
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={inputWrapperClass("date")}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={inputWrapperClass("time")}
                />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
              </div>

              {/* Patient Name */}
              <div>
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="e.g. Juan Dela Cruz"
                  className={inputWrapperClass("patientName")}
                />
                {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  name="patientAge"
                  value={form.patientAge}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="e.g. 25"
                  className={inputWrapperClass("patientAge")}
                />
                {errors.patientAge && <p className="text-red-500 text-xs mt-1">{errors.patientAge}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="patientGender"
                  value={form.patientGender}
                  onChange={handleChange}
                  className={inputWrapperClass("patientGender")}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                {errors.patientGender && <p className="text-red-500 text-xs mt-1">{errors.patientGender}</p>}
              </div>

              {/* Department */}
              <div>
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Building2 size={14} className="text-gray-400" />
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputWrapperClass("department")}
                >
                  <option value="">Select department</option>
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              {/* Doctor */}
              <div>
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Stethoscope size={14} className="text-gray-400" />
                  Doctor <span className="text-red-500">*</span>
                </label>
                <input
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Santos"
                  className={inputWrapperClass("doctor")}
                />
                {errors.doctor && <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>}
              </div>

              {/* Reason */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-black">
                  Reason <span className="text-red-500">*</span>
                </label>
                <input
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="e.g. General checkup"
                  className={inputWrapperClass("reason")}
                />
                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center px-6 py-5 border-t border-gray-100">
            <div className="h-5">
              {submitAttempted && Object.keys(errors).length > 0 ? (
                <p className="text-red-500 text-sm">
                  ⚠ Please fill all required fields correctly.
                </p>
              ) : null}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentPage;