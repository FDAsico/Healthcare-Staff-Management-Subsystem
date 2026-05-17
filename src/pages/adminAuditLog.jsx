import React, { useEffect, useState } from "react";
import Sidebar from "../components/adminSidebar";
import api from "../lib/api";
import { Clock, User, Activity, FileText } from "lucide-react";

const AdminAuditLog = () => {
  const [activePage, setActivePage] = useState("audit-logs");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    // Fetch audit logs and map user UUIDs to usernames
    // First, get logs
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/audit-logs");
      const logsData =
          // Try multiple possible nesting structures for logs array, including the top-level data array
          res.data?.data?.logs ||
          res.data?.logs ||
          res.data?.data?.data ||
          res.data?.data?.records ||
          res.data?.data?.auditLogs ||
          res.data?.auditLogs ||
          res.data?.data ||
          [];

      // Fetch users for mapping (admin users endpoint)
      let userMap = {};
      try {
        const usersRes = await api.get("/admin-proxy/users");
        const users = usersRes.data?.users || usersRes.data?.data || [];
        users.forEach((u) => {
          // Assuming user_id is the UUID
          userMap[u.user_id] = u.username || u.email || `${u.first_name || u.firstName || ""} ${u.last_name || u.lastName || ""}`.trim();
        });
      } catch (e) {
        console.error("Failed to fetch users for audit log mapping", e);
      }
      const enriched = logsData.map((log) => {
        const userId = log.performedBy || log.user_id || log.userId || log.user;
        return { ...log, resolvedUser: userMap[userId] || "-" };
      });
      setLogs(enriched);
    } catch (err) {
      console.error("Audit log fetch error:", err);
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Listen for sidebar collapse events
  useEffect(() => {
    const handler = (e) => setCollapsed(e.detail);
    window.addEventListener("sidebar-collapse", handler);
    return () => window.removeEventListener("sidebar-collapse", handler);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 pb-24">
          <h1 className="text-xl font-bold mb-4">Audit Log</h1>
          {loading && <p className="text-gray-600">Loading audit logs...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Log ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Time</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">User</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Action</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Entity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Entity ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">IP Address</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Old Value</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">New Value</th>
                  </tr>
                </thead>
               <tbody>
                 {logs.map((log, idx) => {
                   const date = new Date(log.performedAt || log.timestamp || log.time || log.createdAt);
                   const formattedDate = isNaN(date) ? "-" : date.toLocaleString();
                   return (
                     <tr key={idx} className="border-t">
                       <td className="px-4 py-2 text-sm text-gray-700">{log.log_id}</td>
                       <td className="px-4 py-2 text-sm text-gray-700">{formattedDate}</td>
                       <td className="px-4 py-2 text-sm text-gray-700">{log.resolvedUser}</td>
                       <td className="px-4 py-2 text-sm text-gray-700">{log.action || "-"}</td>
                       <td className="px-4 py-2 text-sm text-gray-700">{log.entity || "-"}</td>
                       <td className="px-4 py-2 text-sm text-gray-700">{log.entityId || "-"}</td>
                       <td className="px-4 py-2 text-sm text-gray-700">{log.ipAddress || "-"}</td>
                       <td className="px-4 py-2 text-sm text-gray-700">{log.oldValue ? JSON.stringify(log.oldValue) : "-"}</td>
                       <td className="px-4 py-2 text-sm text-gray-700">{log.newValue ? JSON.stringify(log.newValue) : "-"}</td>
                     </tr>
                   );
                 })}
                 {logs.length === 0 && (
                   <tr>
                     <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                       No audit records found.
                     </td>
                   </tr>
                 )}
               </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLog;
