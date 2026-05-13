import React, { useEffect, useState } from "react";
import NurseSidebar from "../components/NurseSidebar";
import api from "../lib/api";
import { User, X, FileText, Calendar } from "lucide-react";

const NursePatient = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showRecordsModal, setShowRecordsModal] = useState(false);

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/patient-proxy/health-records");
      console.log("Nurse Patient API response:", response.data);
      
      // Health records API returns: response.data.data.records
      const patientsData = response.data?.data?.records || [];

      console.log("Extracted patients data:", patientsData);

      setRecords(patientsData);

      // Group records by patient and get unique patients
      const patientMap = new Map();
      patientsData.forEach((p) => {
        const patientId = p.patient_id;
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            firstName: p.patient_name?.split(' ')[0] || "Unknown",
            lastName: p.patient_name?.split(' ').slice(1).join(' ') || "",
            patientName: p.patient_name || "Unknown",
            age: "-",
            gender: "-",
            lastVisit: p.record_date || p.updated_at || p.created_at || null,
          });
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
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
    return () => window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  // Get medical records for selected patient
  const getPatientRecords = (patientId) => {
    return records.filter((r) => r.patient_id === patientId);
  };

  // Handle patient row click
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowRecordsModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowRecordsModal(false);
    setSelectedPatient(null);
  };

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
    <div className="bg-blue-500/30 min-h-screen flex">
      <NurseSidebar />

      <div
        className="flex-1 p-6 transition-all duration-300 flex flex-col"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <h1 className="text-[24px] font-bold mb-6 text-black-900">
          Patients
        </h1>

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
          <div className="bg-white rounded-xl shadow-sm p-90 text-center text-gray-500">
            <p className="text-xl font-semibold">No patients found.</p>
            <p className="text-sm text-gray-400 mt-4">
              No patient records available yet.
            </p>
          </div>
        ) : !loading && !error && (
          <div className="bg-white rounded-xl shadow-sm flex-1 overflow-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-blue-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-l font-bold text-blue-700 uppercase">
                    Last Visit
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {patients.map((p) => (
                  <tr 
                    key={p.id} 
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handlePatientClick(p)}
                  >
                    <td className="px-6 py-4">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-6 py-4">{p.age}</td>
                    <td className="px-6 py-4">{p.gender}</td>
                    <td className="px-6 py-4">{formatDate(p.lastVisit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Medical Records Modal */}
      {showRecordsModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {selectedPatient.firstName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedPatient.patientName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Patient ID: {selectedPatient.id}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Medical Records
              </h3>

              <div className="space-y-4">
                {getPatientRecords(selectedPatient.id).length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    No medical records found for this patient.
                  </p>
                ) : (
                  getPatientRecords(selectedPatient.id).map((record, index) => (
                    <div
                      key={record.record_id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {record.record_type || "Record"}
                          </span>
                          <span className="text-sm text-gray-400">
                            #{record.record_id}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(record.record_date)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {record.summary && (
                          <p className="text-gray-700">
                            <span className="font-medium">Summary:</span> {record.summary}
                          </p>
                        )}
                        
                        {record.details && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-600 mb-2">Details:</p>
                            {record.details.medicationName && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Medication:</span> {record.details.medicationName}
                              </p>
                            )}
                            {record.details.dosage && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Dosage:</span> {record.details.dosage}
                              </p>
                            )}
                            {record.details.directionsForUse && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Directions:</span> {record.details.directionsForUse}
                              </p>
                            )}
                          </div>
                        )}

                        {record.provider && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                            <User size={14} />
                            Provider: {record.provider}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NursePatient;