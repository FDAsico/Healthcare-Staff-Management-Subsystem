import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Users,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  FileText,
  Pill,
  X,
  AlertTriangle,
} from "lucide-react";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState(""); 

  const [appointments, setAppointments] = useState([
    { name: "Emma Wilson", type: "Consultation", time: "09:00 AM", confirmed: false },
    { name: "Michael Brown", type: "Follow-up", time: "10:30 AM", confirmed: false },
    { name: "Sarah Davis", type: "Surgery", time: "02:15 PM", confirmed: true },
    { name: "James Johnson", type: "Consultation", time: "04:00 PM", confirmed: false },
  ]);

  const [form, setForm] = useState({ firstName: "", lastName: "", type: "", time: "", age: "", gender: "" });
  const [customType, setCustomType] = useState("");

  const setCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const syncSidebar = () => {
      setCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
    };
    syncSidebar();
    const interval = setInterval(syncSidebar, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeModal === "patient") {
      setForm(prev => ({ ...prev, time: setCurrentTime() }));
      setError(""); 
    }
  }, [activeModal]);

  const formatTime = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const confirmAppointment = (index) => {
    setAppointments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, confirmed: true } : item))
    );
  };

  const handleAddAppointment = () => {
    const finalType = form.type === "Other" ? customType : form.type;
    
    if (!form.firstName || !form.lastName || !finalType || !form.time || !form.age || !form.gender) {
        setError("Warning: Please fill out all required fields.");
        return;
    }

    const newEntry = {
      name: `${form.firstName} ${form.lastName}`,
      type: finalType,
      time: formatTime(form.time),
      confirmed: false,
    };

    setAppointments((prev) => [newEntry, ...prev]);
    setForm({ firstName: "", lastName: "", type: "", time: "", age: "", gender: "" });
    setCustomType("");
    setError("");
    setActiveModal(null);
  };

  const deletePatient = () => {
    setAppointments((prev) => prev.filter((p) => p !== selectedPatient));
    setActiveModal(null);
  };

  const activeCasesCount = appointments.filter(
    (item) => item.type.toLowerCase() === "surgery"
  ).length;

  const activities = [
    { type: "new", text: "New patient registered", name: "Alice Cooper", time: "5 min ago" },
    { type: "completed", text: "Appointment completed", name: "Bob Wilson", time: "15 min ago" },
    { type: "lab", text: "Lab results uploaded", name: "Carol Smith", time: "32 min ago" },
    { type: "prescription", text: "Prescription updated", name: "David Lee", time: "1 hour ago" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: collapsed ? "85px" : "265px" }}
      >
        <h1 className="text-2xl font-bold mb-6">Good Day Doctor!</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card title="Total Patients" icon={<Users />} value={appointments.length} iconColor="text-blue-500" />
          <Card title="Today's Appointments" icon={<Calendar />} value={appointments.length} iconColor="text-green-500" />
          <Card title="Active Cases" icon={<Activity />} value={activeCasesCount} iconColor="text-orange-500" />
          <Card title="Critical Alerts" icon={<AlertCircle />} value="0" iconColor="text-red-500" />
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm flex flex-col h-[400px]">
            <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
            <div className="flex-1 overflow-y-auto flex flex-col">
              {appointments.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-2xl font-bold uppercase tracking-wider">No Patients Data</p>
                </div>
              ) : (
                appointments.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => { setSelectedPatient(item); setActiveModal("lab"); }}
                    className="flex justify-between items-center border-b py-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.type}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {item.confirmed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white">Confirmed</span>
                      )}
                      <p className="text-sm font-medium">{item.time}</p>
                      {!item.confirmed && (
                        <button
                          onClick={(e) => { e.stopPropagation(); confirmAppointment(index); }}
                          className="text-xs bg-yellow-400 px-2 py-1 rounded hover:opacity-90"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setActiveModal("patients")}
              className="mt-4 w-full bg-black text-white rounded-lg py-2 text-sm hover:opacity-90"
            >
              View All Patients
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-[400px]">
            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
            <div className="flex-1 overflow-y-auto">
              {activities.map((act, index) => {
                let icon, color, bgColor;
                switch (act.type) {
                  case "new": icon = <Users size={24} />; color = "text-blue-500"; bgColor = "bg-blue-50"; break;
                  case "completed": icon = <CheckCircle size={24} />; color = "text-green-500"; bgColor = "bg-green-50"; break;
                  case "lab": icon = <FileText size={24} />; color = "text-orange-500"; bgColor = "bg-orange-50"; break;
                  case "prescription": icon = <Pill size={24} />; color = "text-purple-500"; bgColor = "bg-purple-50"; break;
                  default: icon = <Activity size={24} />; color = "text-gray-500"; bgColor = "bg-gray-50";
                }
                return (
                  <div key={index} className="flex gap-4 mb-5 items-start">
                    <div className={`p-2.5 rounded-xl ${bgColor} ${color}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-800">{act.text}</p>
                      <p className="text-sm text-gray-500">{act.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            <ActionBtn label="Add New Patient" onClick={() => setActiveModal("patient")} primary />
            <ActionBtn label="Schedule Appointment" onClick={() => setActiveModal("schedule")} />
            <ActionBtn label="View Lab Results" onClick={() => setActiveModal("lab")} />
            <ActionBtn label="Emergency Alert" onClick={() => setActiveModal("alert")} />
          </div>
        </div>
      </div>

      {activeModal && (
        <Modal
          onClose={() => setActiveModal(null)}
          title={activeModal === "patient" ? "Add New Patient" : activeModal === "patients" ? "All Patients" : "Patient Profile"}
          showDelete={activeModal === "lab"}
          onDelete={deletePatient}
        >
          {activeModal === "patient" && (
            <div className="flex flex-col gap-6 text-sm">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
                  <AlertTriangle size={18} />
                  <span className="font-bold text-base">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-500 text-sm">First Name</label>
                  <input className="border p-3.5 rounded-xl focus:ring-1 focus:ring-black outline-none text-base" placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-500 text-sm">Last Name</label>
                  <input className="border p-3.5 rounded-xl focus:ring-1 focus:ring-black outline-none text-base" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-500 text-sm">Age Range</label>
                    <select className="border p-3.5 rounded-xl focus:ring-1 focus:ring-black outline-none bg-white text-base" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}>
                    <option value="">Select Age</option>
                    <optgroup label="Infant (Months)">
                        <option value="1-2 months">1 - 2 Months</option>
                        <option value="2-6 months">2 - 6 Months</option>
                        <option value="6-12 months">6 - 12 Months</option>
                    </optgroup>
                    <optgroup label="Adult (Years)">
                        {Array.from({ length: 100 }, (_, i) => (
                        <option key={i + 1} value={`${i + 1} years`}>{i + 1} Year{i > 0 ? 's' : ''}</option>
                        ))}
                    </optgroup>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-500 text-sm">Gender</label>
                  <select className="border p-3.5 rounded-xl focus:ring-1 focus:ring-black outline-none bg-white text-base" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-500 text-sm">Appointment Type</label>
                <select className="border p-3.5 rounded-xl focus:ring-1 focus:ring-black outline-none bg-white text-base" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="">Select Appointment Type</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Lab Test">Lab Test</option>
                  <option value="Other">Other</option>
                </select>
                {form.type === "Other" && <input className="border p-3.5 mt-2 rounded-xl focus:ring-1 focus:ring-black outline-none text-base" placeholder="Enter custom type" value={customType} onChange={(e) => setCustomType(e.target.value)} />}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-500 text-sm">Preferred Time</label>
                <input type="time" className="border p-3.5 rounded-xl focus:ring-1 focus:ring-black outline-none text-base" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              
              <button onClick={handleAddAppointment} className="bg-black text-white py-4.5 mt-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md active:scale-[0.98] text-base">Add Appointment</button>
            </div>
          )}

          {activeModal === "lab" && selectedPatient && (
            <div className="space-y-5 py-2 text-sm">
              <div className="bg-gray-50 p-5 rounded-xl">
                <p className="font-bold text-gray-400 uppercase tracking-widest mb-1 text-xs">Patient Name</p>
                <p className="text-xl font-bold text-gray-800">{selectedPatient.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-gray-50 p-5 rounded-xl">
                    <p className="font-bold text-gray-400 uppercase tracking-widest mb-1 text-xs">Type</p>
                    <p className="font-semibold text-base">{selectedPatient.type}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl">
                    <p className="font-bold text-gray-400 uppercase tracking-widest mb-1 text-xs">Time</p>
                    <p className="font-semibold text-base">{selectedPatient.time}</p>
                </div>
              </div>
              <div className="mt-6 p-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium italic text-base">No lab records found.</p>
              </div>
            </div>
          )}

          {activeModal === "patients" && (
            <div className="overflow-y-auto h-full flex flex-col gap-4">
              {appointments.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-12">
                   <p className="text-gray-300 text-3xl font-black uppercase italic">No Data Found</p>
                </div>
              ) : (
                appointments.map((p, i) => (
                  <div key={i} className="p-5 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors" onClick={() => { setSelectedPatient(p); setActiveModal("lab"); }}>
                    <div className="text-sm">
                        <span className="font-bold text-gray-800 text-lg">{p.name}</span>
                        <p className="text-gray-500 text-base">{p.type}</p>
                    </div>
                    <span className="text-black font-bold text-base bg-gray-100 px-4 py-2 rounded-lg">{p.time}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

const Card = ({ title, icon, value = "--", iconColor = "text-blue-500" }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-transparent hover:border-gray-200 transition-all">
    <div className="flex justify-between items-start">
      <h2 className="text-xl font-semibold text-gray-800 leading-tight">{title}</h2>
      <div className={`${iconColor}`}>{icon}</div>
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

const ActionBtn = ({ label, onClick, primary }) => (
  <button onClick={onClick} className={`py-3 rounded-lg text-sm font-semibold transition-all ${primary ? "bg-black text-white hover:bg-gray-800 shadow-md" : "bg-white border hover:bg-gray-50"}`}>
    {label}
  </button>
);

const Modal = ({ children, onClose, title, showDelete, onDelete }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
    <div className="bg-white w-full max-w-2xl rounded-[2.65rem] relative flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.25)] max-h-[90vh] overflow-hidden">
      <div className="flex justify-between items-center px-10 py-5 border-b border-gray-100">
        <h2 className="font-black text-2xl text-gray-800 tracking-tight">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-black p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
      </div>
      <div className="p-10 overflow-y-auto flex-1">
        {children}
      </div>
      {showDelete && (
        <div className="px-10 py-6 border-t border-gray-50 flex justify-end bg-gray-50/50">
          <button onClick={onDelete} className="bg-red-500 hover:bg-red-600 text-white text-sm px-6 py-2.5 rounded-xl font-bold transition-all shadow-md uppercase tracking-wider">Delete Record</button>
        </div>
      )}
    </div>
  </div>
);

export default Dashboard;

