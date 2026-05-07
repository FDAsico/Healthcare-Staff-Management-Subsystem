import { useState } from "react";

const columns = ["Staff Member", "Department", "Contact", "Schedule", "Status", "Today's Load", "Actions"];

const departmentStyles = [
  { color: "text-red-500",    bg: "bg-red-50",    border: "border-red-100"    },
  { color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-100"   },
  { color: "text-green-500",  bg: "bg-green-50",  border: "border-green-100"  },
  { color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
  { color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
  { color: "text-pink-500",   bg: "bg-pink-50",   border: "border-pink-100"   },
  { color: "text-teal-500",   bg: "bg-teal-50",   border: "border-teal-100"   },
];

function StaffManagement({ role = "admin" }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Empty by default — will be filled when admin adds data or fetches from backend
  const [departments, setDepartments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);

  const filtered = staffMembers.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? s.status === statusFilter : true;
    const matchDept   = deptFilter   ? s.department === deptFilter : true;
    return matchSearch && matchStatus && matchDept;
  });

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-8 overflow-auto">

      {/* Page Title */}
      <h1 className="text-xl font-bold text-gray-900 mb-6">Staff</h1>

      {/* Subheader */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-gray-800">Staff Management</p>
          <p className="text-xs text-gray-400 mt-0.5">Manage hospital staff and medical personnel</p>
        </div>

        {/* Only admin can see Add Staff Member button */}
        {role === "admin" && (
          <button className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Staff
          </button>
        )}
      </div>

      {/* Department Cards — empty until admin adds departments */}
      {departments.length === 0 ? (
        <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <p className="text-xs text-gray-300">No departments added yet.</p>
        </div>
      ) : (
        <div className="flex flex-row gap-4 mb-6 overflow-x-auto">
          {departments.map((dept, i) => {
            const style = departmentStyles[i % departmentStyles.length];
            const count = staffMembers.filter((s) => s.department === dept.name).length;
            return (
              <div key={dept.name} className={`bg-white rounded-xl border ${style.border} p-4 min-w-[180px] flex-1`}>
                <p className="text-xs text-gray-500 mb-3">{dept.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${style.bg} ${style.color}`}>
                    Staff
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search staff by name, role, department, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="">Filter by status</option>
          {staffMembers.length > 0 && (
            <>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </>
          )}
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="">Filter by department</option>
          {departments.map((d) => (
            <option key={d.name} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Staff Members ({filtered.length})</p>
          <p className="text-xs text-gray-400 mt-0.5">All medical and administrative personnel</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {columns.map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center text-xs text-gray-300 py-12">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                filtered.map((staff, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {staff.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{staff.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {staff.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{staff.department}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        {staff.email}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>
                        {staff.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {staff.schedule}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        staff.status === "Active"   ? "bg-green-100 text-green-600" :
                        staff.status === "On Leave" ? "bg-yellow-100 text-yellow-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {staff.load} patients
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-gray-700 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-700 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StaffManagement;