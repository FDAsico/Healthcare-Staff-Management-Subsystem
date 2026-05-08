import React, { useState } from "react";
import { UserPlus, User, Phone, Mail, Calendar, Users } from "lucide-react";

const initialForm = {
  firstName: "",
  lastName: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  condition: "",
  lastVisit: "",
};

const AddPatient = ({ onAddPatient }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (submitAttempted && Object.keys(errors).length > 0) {
      setSubmitAttempted(false);
      setErrors({});
    }

    let newValue = value;

    if (name === "firstName" || name === "lastName") {
      newValue = value.replace(/[0-9]/g, "");
    }

    if (name === "age") {
      newValue = value.replace(/\D/g, "").slice(0, 3);
    }

    if (name === "phone") {
      newValue = value.replace(/\D/g, "").slice(0, 12);
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
    // Clear error for this field when user types
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
    if (!form.firstName.trim()) err.firstName = "First name is required";
    if (!form.lastName.trim()) err.lastName = "Last name is required";
    if (!form.age) err.age = "Age is required";
    if (!form.gender) err.gender = "Gender is required";
    if (!form.phone.trim()) err.phone = "Phone is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!validate()) return;

    if (onAddPatient) {
      onAddPatient(form);
    }

    setForm(initialForm);
    setErrors({});
    setSubmitAttempted(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setForm(initialForm);
    setErrors({});
    setSubmitAttempted(false);
  };

  const inputWrapperClass = (fieldName) =>
    `flex items-center border rounded-lg px-4 py-2.5 mt-1 bg-white w-full transition ${
      errors[fieldName] ? "border-red-400 ring-1 ring-red-100" : "border-gray-200 hover:border-gray-300"
    }`;

  const inputClass = "flex-1 outline-none text-sm placeholder:text-gray-400 bg-transparent";

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition text-sm min-w-[220px] shadow-lg"
      >
        <UserPlus size={18} strokeWidth={1.5} />
        Add New Patient
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] overflow-hidden">
            {/* HEADER */}
            <div className="bg-black text-white px-6 py-5 flex items-center gap-3">
              <UserPlus size={22} strokeWidth={1.5} />
              <h2 className="text-lg font-semibold">Add Patient</h2>
            </div>

            {/* BODY */}
            <div className="p-6 grid grid-cols-2 gap-5">
              {/* FIRST NAME */}
              <div>
                <label className="text-sm font-medium text-black">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className={inputWrapperClass("firstName")}>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter patient's first name"
                    className={inputClass}
                  />
                  <User className="ml-2 text-gray-400" size={18} />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              {/* LAST NAME */}
              <div>
                <label className="text-sm font-medium text-black">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className={inputWrapperClass("lastName")}>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter patient's last name"
                    className={inputClass}
                  />
                  <User className="ml-2 text-gray-400" size={18} />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>

              {/* AGE */}
              <div>
                <label className="text-sm font-medium text-black">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className={inputWrapperClass("age")}>
                  <input
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Enter patient age (e.g. 25)"
                    inputMode="numeric"
                    className={inputClass}
                  />
                  <Calendar className="ml-2 text-gray-400" size={18} />
                </div>
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>

              {/* GENDER */}
              <div>
                <label className="text-sm font-medium text-black">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className={inputWrapperClass("gender")}>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="flex-1 outline-none text-sm bg-transparent"
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <Users className="ml-2 text-gray-400" size={18} />
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              {/* PHONE */}
              <div>
                <label className="text-sm font-medium text-black">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className={inputWrapperClass("phone")}>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    inputMode="numeric"
                    className={inputClass}
                  />
                  <Phone className="ml-2 text-gray-400" size={18} />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-black">Email</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2.5 mt-1 bg-white w-full hover:border-gray-300 transition">
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address (optional)"
                    className={inputClass}
                  />
                  <Mail className="ml-2 text-gray-400" size={18} />
                </div>
              </div>

              {/* CONDITION */}
              <div>
                <label className="text-sm font-medium text-black">Condition</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2.5 mt-1 bg-white w-full hover:border-gray-300 transition">
                  <input
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    placeholder="Enter condition"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* LAST VISIT DATE */}
              <div>
                <label className="text-sm font-medium text-black">Last Visit Date</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2.5 mt-1 bg-white w-full hover:border-gray-300 transition">
                  <input
                    type="date"
                    name="lastVisit"
                    value={form.lastVisit}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col items-center mt-2 px-6 pb-6">
              <div className="h-5 flex items-center justify-center w-full mb-3">
                {submitAttempted && Object.keys(errors).length > 0 ? (
                  <p className="text-red-500 text-sm text-center">
                    ⚠ Please fill all required fields correctly.
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 w-full">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
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

export default AddPatient;