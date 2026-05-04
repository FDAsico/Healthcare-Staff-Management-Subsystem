import React, { useState } from "react";
import { UserPlus, User, Phone, Mail, Calendar, Users } from "lucide-react";

const initialForm = {
  firstName: "",
  lastName: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  condition: "",        // ✅ ADDED
  lastVisit: "",        // ✅ ADDED
};

const AddPatient = ({ onAddPatient }) => { // ✅ ADDED PROP (no removal)
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
  };

  const validate = () => {
    const err = {};
    if (!form.firstName) err.firstName = "Required";
    if (!form.lastName) err.lastName = "Required";
    if (!form.age) err.age = "Required";
    if (!form.gender) err.gender = "Required";
    if (!form.phone) err.phone = "Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!validate()) return;

    // ✅ SEND DATA TO PARENT (ADDED ONLY)
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

  const inputClass =
    "flex-1 outline-none text-base placeholder:text-gray-500 placeholder:text-[15px]";

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-black text-white px-10 py-3 rounded-lg font-semibold hover:bg-gray-800 text-sm"
      >
        <UserPlus size={18} />
        Add New Patient
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-[900px] overflow-hidden">

            {/* HEADER */}
            <div className="bg-black text-white px-6 py-6 flex items-center gap-2">
              <UserPlus size={24} />
              <h2 className="text-xl font-semibold">Add Patient</h2>
            </div>

            {/* BODY */}
            <div className="p-7 grid grid-cols-2 gap-6">

              {/* FIRST NAME */}
              <div>
                <label className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-lg px-4 py-2 mt-1 bg-white w-full">
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter patient's first name"
                    className={inputClass}
                  />
                  <User className="ml-2 text-gray-400" />
                </div>
              </div>

              {/* LAST NAME */}
              <div>
                <label className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-lg px-4 py-2 mt-1 bg-white w-full">
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter patient's last name"
                    className={inputClass}
                  />
                  <User className="ml-2 text-gray-400" />
                </div>
              </div>

              {/* AGE */}
              <div>
                <label className="text-sm font-medium">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-lg px-4 py-2 mt-1 bg-white w-full">
                  <input
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Enter patient age (e.g. 25)"
                    inputMode="numeric"
                    className={inputClass}
                  />
                  <Calendar className="ml-2 text-gray-400" />
                </div>
              </div>

              {/* GENDER */}
              <div>
                <label className="text-sm font-medium">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-lg px-4 py-2 mt-1 bg-white w-full">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="flex-1 outline-none text-base bg-white"
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <Users className="ml-2 text-gray-400" />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="text-sm font-medium">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-lg px-4 py-2 mt-1 bg-white w-full">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    inputMode="numeric"
                    className={inputClass}
                  />
                  <Phone className="ml-2 text-gray-400" />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center border rounded-lg px-4 py-2 mt-1 bg-white w-full">
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address (optional)"
                    className={inputClass}
                  />
                  <Mail className="ml-2 text-gray-400" />
                </div>
              </div>

              {/* ✅ CONDITION (ADDED ONLY) */}
              <div>
                <label className="text-sm font-medium">Condition</label>
                <div className="flex items-center border rounded-lg px-4 py-2 mt-1 bg-white w-full">
                  <input
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    placeholder="Enter condition"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* ✅ LAST VISIT DATE (ADDED ONLY) */}
              <div>
                <label className="text-sm font-medium">Last Visit Date</label>
                <div className="flex items-center border rounded-lg px-4 py-2 mt-1 bg-white w-full">
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
            <div className="flex flex-col items-center mt-6 px-6 pb-6">

              <div className="h-6 flex items-center justify-center w-full">
                {submitAttempted && Object.keys(errors).length > 0 ? (
                  <p className="text-red-500 text-sm text-center">
                    ⚠ Please fill all required fields correctly.
                  </p>
                ) : (
                  <span className="invisible text-sm">alert-space</span>
                )}
              </div>

              <div className="flex justify-end gap-3 w-full mt-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1.5 border rounded-lg text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-5 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-sm"
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