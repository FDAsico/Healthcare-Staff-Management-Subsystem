import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const Patients = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem("patients");
    return savedPatients ? JSON.parse(savedPatients) : [];
  });

  useEffect(() => {
    const syncSidebar = (event) => setCollapsed(event.detail);

    window.addEventListener("sidebar-collapse", syncSidebar);

    return () =>
      window.removeEventListener("sidebar-collapse", syncSidebar);
  }, []);

  useEffect(() => {
    const syncPatients = (event) => {
      if (event?.detail?.source === "patients") return;

      const savedPatients = localStorage.getItem("patients");

      setPatients(savedPatients ? JSON.parse(savedPatients) : []);
    };

    window.addEventListener("patients-updated", syncPatients);
    window.addEventListener("storage", syncPatients);

    return () => {
      window.removeEventListener("patients-updated", syncPatients);
      window.removeEventListener("storage", syncPatients);
    };
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
        

        {patients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <p className="text-xl font-semibold">No patients found.</p>

            <p className="text-sm text-gray-400 mt-4">
              No patient records available.
            </p>
          </div>
        ) : (
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