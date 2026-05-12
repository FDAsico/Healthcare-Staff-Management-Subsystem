import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/adminDashboard";
import AdminPatients from "./pages/adminPatient";
import AdminAppointment from "./pages/adminAppointment";
import AdminCalendarView from "./pages/adminCalendarView";
import AdminScheduleAppointment from "./components/adminScheduleAppointment";
import AdminMedicalRecords from "./pages/adminMedicalRecords";
import AdminDepartments from "./pages/adminDepartments";
import AdminStaff from "./pages/adminStaff";
import AdminShift from "./pages/adminshift";
import Login from './pages/login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Appointment from './pages/Appointment'
import CalendarView from './pages/CalendarView'
import MedicalRecord from './pages/MedicalRecord'
import ShiftSchedule from './pages/ShiftSchedule' 
import NurseDashboard from './pages/NurseDashboard'
import NursePatient from './pages/NursePatient'
import NurseCalendar from './pages/NurseCalendar'
import NurseMedicalRecord from './pages/NurseMedicalRecord'
import NurseShiftSchedule from './pages/NurseShiftSchedule'
import PharmaDashboard from './pages/PharmaDashboard'
import PharmaSidebar from './components/PharmaSidebar'

const App = () => {
  const { user, loading } = useAuth();
  const role = user?.role?.toLowerCase();
  const isNurse = role === "nurse";
  const isPharmacist = role === "pharmacist";
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  return (

    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={user ? (isNurse ? <NurseDashboard /> : <AdminDashboard />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/dashboard"
        element={user ? (isNurse ? <NurseDashboard /> : <AdminDashboard />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/patients"
        element={user ? (isNurse ? <NursePatient /> : <AdminPatients />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/appointments"
        element={user ? (isNurse ? <Appointment /> : <AdminAppointment />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/appointments/all"
        element={user ? (isNurse ? <Appointment /> : <AdminAppointment />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/appointments/calendar"
        element={user ? (isNurse ? <CalendarView /> : <AdminCalendarView />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/schedule-appointment"
        element={user ? (isNurse ? <Navigate to="/" replace /> : <AdminScheduleAppointment />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/record"
        element={user ? (isNurse ? <MedicalRecord /> : <AdminMedicalRecords />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/staff/all"
        element={user ? (isNurse ? <Navigate to="/" replace /> : <AdminStaff />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/staff/departments"
        element={user ? (isNurse ? <Navigate to="/" replace /> : <AdminDepartments />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/staff/shifts"
        element={user ? (isNurse ? <Navigate to="/" replace /> : <AdminShift />) : <Navigate to="/login" replace />}
      />

      <Route
        path="/shift-schedule"
        element={user ? (isNurse ? <NurseShiftSchedule /> : <Navigate to="/" replace />) : <Navigate to="/login" replace />}
      />

    <Route
        path="/pharma-dashboard"
        element={user && isPharmacist? <PharmaDashboard /> : <Navigate to="/login" replace />}
      />
      
    <Route
      path="/shift-schedule"
      element={isPharmacist? <ShiftSchedule /> : <Navigate to="/login" replace />}
  />

      <Route
        path="/"
        element={user ? (isPharmacist ? <PharmaDashboard /> : <Navigate to="/" replace />) : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      
    </Routes>
  );
};

export default App;