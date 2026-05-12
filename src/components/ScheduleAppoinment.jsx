import React, { useState } from "react";
import { Calendar, User, Stethoscope, Users, Building2 } from "lucide-react";

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

const ScheduleAppointment = ({ onSave }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

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
  };

  const validate = () => {
    const err = {};

    if (!form.date) err.date = "Required";
    if (!form.time) err.time = "Required";
    if (!form.patientName) err.patientName = "Required";
    if (!form.patientAge) err.patientAge = "Required";
    if (!form.patientGender) err.patientGender = "Required";
    if (!form.department) err.department = "Required";
    if (!form.doctor) err.doctor = "Required";
    if (!form.reason) err.reason = "Required";

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
      status: "Scheduled",
    };

    if (onSave) onSave(payload);

    setForm(initialForm);
    setErrors({});
    setSubmitAttempted(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitAttempted(false);
    setOpen(false);
  };

  const inputClass =
    "w-full border rounded-lg px-4 py-2.5 outline-none text-sm focus:ring-2 focus:ring-black/20 placeholder:text-xs placeholder:text-gray-400";

  const showAlert = submitAttempted && Object.keys(errors).length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 bg-black text-white px-10 py-3 rounded-lg font-medium hover:bg-gray-800 transition text-sm"
      >
        <Calendar size={20} />
        Schedule Appointment
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-[850px] overflow-hidden">

            <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={20} />
                Schedule Appointment
              </h2>

              <button
                onClick={handleCancel}
                className="text-white/80 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="text-sm font-medium">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Time *</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <User size={14} /> Patient Name *
                </label>
                <input
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="e.g. Juan Dela Cruz"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users size={14} /> Age *
                </label>
                <input
                  name="patientAge"
                  value={form.patientAge}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="e.g. 25"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users size={14} /> Gender *
                </label>
                <select
                  name="patientGender"
                  value={form.patientGender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 size={14} /> Department *
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select department</option>
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope size={14} /> Doctor *
                </label>
                <input
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Santos"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Reason *</label>
                <input
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="e.g. General checkup"
                  className={inputClass}
                />
              </div>

            </div>

            <div className="px-6 py-4 flex justify-between items-center">

              <div>
                {showAlert && (
                  <p className="text-red-500 text-xs">
                    Please fill all required fields
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-xs"
                >
                  Save
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleAppointment;