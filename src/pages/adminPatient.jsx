import React, { useEffect, useState } from "react";
import Sidebar from "../components/adminSidebar";
import api from "../lib/api";

const Patients = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/patient-proxy/health-records");
      console.log("Patient API response:", response.data);
      
      // Health records API returns: response.data.data.records
      const patientsData = response.data?.data?.records || [];

      console.log("Extracted patients data:", patientsData);

      // Normalize patient data from health records API
      const normalizedPatients = patientsData.map((p, index) => ({
        id: p.record_id || p.patient_id || index + 1,
        firstName: p.patient_name?.split(' ')[0] || "Unknown",
        lastName: p.patient_name?.split(' ').slice(1).join(' ') || "",
        age: "-", // Not available in health records
        gender: "-", // Not available in health records
        condition: p.record_type || p.condition || "General Checkup",
        lastVisit: p.record_date || p.updated_at || p.created_at || null,
      }));

      setPatients(normalizedPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    fetchPatients();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);

    window.addEventListener("sidebar-collapse", syncSidebar);

    return () =>
      window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  // FORMAT DATE
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div
        className="flex-1 p-6 transition-all duration-300 flex flex-col"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <h1 className="text-[24px] font-bold mb-6">Welcome Admin!</h1>

        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <p className="text-xl font-semibold">Loading patients...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6 text-center text-red-600 mb-4">
            <p className="text-xl font-semibold">{error}</p>
            <button
              onClick={fetchPatients}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && patients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <p className="text-xl font-semibold">No patients found.</p>

            <p className="text-sm text-gray-400 mt-4">
              No patient records available.
            </p>
          </div>
        ) : !loading && !error && (
          <div className="bg-white rounded-xl shadow-sm flex-1 overflow-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Name
                  </th>

                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Age
                  </th>

                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Gender
                  </th>

                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Condition
                  </th>

                  <th className="px-6 py-3 text-left text-l font-bold text-blue-600 uppercase">
                    Last Visit
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {p.firstName} {p.lastName}
                    </td>

                    <td className="px-6 py-4">{p.age}</td>

                    <td className="px-6 py-4">{p.gender}</td>

                    <td className="px-6 py-4">{p.condition}</td>

                    <td className="px-6 py-4">
                      {formatDate(p.lastVisit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;