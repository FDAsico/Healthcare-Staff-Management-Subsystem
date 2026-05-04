import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const Staff = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [category, setCategory] = useState("All");

  // ✅ REMOVED STATIC DATA (now ready for backend/API)
  const [staffData, setStaffData] = useState([]);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "Doctor",
    department: "",
    schedule: "",
    image: "",
    description: "",
  });

  useEffect(() => {
    const handleSidebarCollapse = (event) => {
      setCollapsed(event.detail);
    };

    window.addEventListener("sidebar-collapse", handleSidebarCollapse);
    return () => {
      window.removeEventListener("sidebar-collapse", handleSidebarCollapse);
    };
  }, []);

  const filteredStaff =
    category === "All"
      ? staffData
      : staffData.filter((s) => s.role === category);

  const roleStyle = (role) => {
    switch (role) {
      case "Doctor":
        return "bg-green-100 text-green-700";
      case "Nurse":
        return "bg-blue-100 text-blue-700";
      case "Pharmacist":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const openStaff = (staff) => {
    setSelectedStaff(staff);
    setIsViewOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setNewStaff({
      ...newStaff,
      image: imageUrl,
    });
  };

  const addStaff = () => {
    const newEntry = {
      ...newStaff,
      id: Date.now(),
      image:
        newStaff.image ||
        `https://ui-avatars.com/api/?name=${newStaff.name.replace(" ", "+")}`,
    };

    setStaffData([newEntry, ...staffData]);

    setNewStaff({
      name: "",
      role: "Doctor",
      department: "",
      schedule: "",
      image: "",
      description: "",
    });

    setIsAddOpen(false);
  };

  return (
    <div className="flex">
      <Sidebar />

      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="max-w-7xl mx-auto p-6 relative">

          {/* FILTER BUTTONS */}
          <div className="mb-6 flex gap-3">
            {["All", "Doctor", "Nurse", "Pharmacist"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  category === cat
                    ? "bg-black text-white"
                    : "bg-white border hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* STAFF GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => openStaff(staff)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 mt-5 cursor-pointer"
              >
                <div className="flex flex-col items-center mb-4">
                  <img
                    src={staff.image}
                    alt={staff.name}
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                </div>

                <div className="text-left space-y-1">
                  <h2 className="font-semibold text-lg">{staff.name}</h2>

                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Department:</span>{" "}
                    {staff.department}
                  </p>

                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Schedule:</span>{" "}
                    {staff.schedule}
                  </p>
                </div>

                <div className="mt-4">
                  <span
                    className={`inline-block px-4 py-1 text-sm font-semibold rounded-full ${roleStyle(
                      staff.role
                    )}`}
                  >
                    {staff.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-full shadow-lg"
          >
            + Add Staff
          </button>

          {/* VIEW MODAL */}
          {isViewOpen && selectedStaff && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white w-[500px] rounded-xl p-6">
                <div className="flex justify-center mb-4">
                  <img
                    src={selectedStaff.image}
                    className="w-28 h-28 rounded-full border"
                  />
                </div>

                <h2 className="text-xl font-bold text-center">
                  {selectedStaff.name}
                </h2>

                <p className="text-center mt-2">{selectedStaff.role}</p>

                <div className="mt-4 space-y-2 text-sm">
                  <p><b>Department:</b> {selectedStaff.department}</p>
                  <p><b>Schedule:</b> {selectedStaff.schedule}</p>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-1">Description</h3>

                  {selectedStaff.description ? (
                    <p className="text-sm text-gray-700">
                      {selectedStaff.description}
                    </p>
                  ) : (
                    <div className="text-sm text-gray-400 opacity-50 italic">
                      No description provided for this staff member.
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsViewOpen(false)}
                  className="mt-5 w-full bg-black text-white py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ADD MODAL */}
          {isAddOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white w-[600px] rounded-2xl shadow-2xl overflow-hidden">

                <div className="bg-black text-white px-6 py-4">
                  <h2 className="text-lg font-semibold">Add New Staff Member</h2>
                  <p className="text-xs text-gray-300">
                    Fill in the details below
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Full Name
                      </label>
                      <input
                        className="w-full mt-1 border rounded-lg p-2"
                        value={newStaff.name}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Role
                      </label>
                      <select
                        className="w-full mt-1 border rounded-lg p-2"
                        value={newStaff.role}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, role: e.target.value })
                        }
                      >
                        <option>Doctor</option>
                        <option>Nurse</option>
                        <option>Pharmacist</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Department
                      </label>
                      <select
                        className="w-full mt-1 border rounded-lg p-2"
                        value={newStaff.department}
                        onChange={(e) =>
                          setNewStaff({
                            ...newStaff,
                            department: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Department</option>
                        <option>Cardiology</option>
                        <option>Emergency</option>
                        <option>Neurology</option>
                        <option>Orthopedics</option>
                        <option>Pediatrics</option>
                        <option>Radiology</option>
                        <option>Oncology</option>
                        <option>Pharmacy</option>
                        <option>Dermatology</option>
                        <option>Gynecology</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Schedule
                      </label>
                      <input
                        className="w-full mt-1 border rounded-lg p-2"
                        value={newStaff.schedule}
                        onChange={(e) =>
                          setNewStaff({
                            ...newStaff,
                            schedule: e.target.value,
                          })
                        }
                      />
                    </div>

                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Description
                    </label>
                    <textarea
                      className="w-full mt-1 border rounded-lg p-2"
                      rows="3"
                      value={newStaff.description}
                      onChange={(e) =>
                        setNewStaff({
                          ...newStaff,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full mt-1 border rounded-lg p-2"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={addStaff}
                    className="px-5 py-2 bg-black text-white rounded-lg"
                  >
                    Save Staff
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Staff;