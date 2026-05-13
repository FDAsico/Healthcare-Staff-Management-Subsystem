import { Navigate, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import Patients from './pages/Patients'
import Dashboard from './pages/Dashboard'
import Appointment from './pages/Appointment'
import CalendarView from './pages/CalendarView'
import MedicalRecord from './pages/MedicalRecord'
import NurseDashboard from './pages/NurseDashboard'
import NursePatient from './pages/NursePatient'
import NurseShiftSchedule from './pages/NurseShiftSchedule'
import PharmaDashboard from './pages/PharmaDashboard'
import PharmaSidebar from './components/PharmaSidebar'
import PharmaScheule from './pages/PharmaSchedule'

// Component to check auth and render children or redirect
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const role = user?.role?.toLowerCase();
  const isNurse = role === "nurse";
  const isPharmacist = role === "pharmacist";

  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Component to check role and render children or redirect
function RequireRole({ allowedRoles, children }) {
  const { role } = useAuth();
  
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Component to handle users with no profile
function NoProfileHandler() {
  useEffect(() => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login?error=no_profile";
  }, []);
  
  return <div className="min-h-screen flex items-center justify-center">Logging out...</div>;
}

function App() {
  const { user, loading, isAdmin, isDoctor, isNurse, isPharmacist } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Dashboard component selector
  let DashboardComponent;
  if (isNurse) {
    DashboardComponent = NurseDashboard;
  } else if (isPharmacist) {
    DashboardComponent = PharmaDashboard; 
  } else if (isDoctor) {
    DashboardComponent = Dashboard;
  } else if (isAdmin) {
    DashboardComponent = AdminDashboard;
  }

  // Patients component selector
  let PatientsComponent;
  if (isNurse) {
    PatientsComponent = NursePatient;
  } else if (isDoctor){
    PatientsComponent = Patients;  
  } else if (isAdmin) {
    PatientsComponent = AdminPatients;
  }

  // Appointments component selector
  let AppointmentsComponent;
  if (isAdmin) {
    AppointmentsComponent = AdminAppointment;
  } else if (isDoctor || isNurse || isPharmacist) {
    AppointmentsComponent = Appointment;
  }

  // Records component selector
  let RecordsComponent;
  if (isAdmin) {
    RecordsComponent = AdminMedicalRecords;
  } else if (isDoctor || isNurse) {
    RecordsComponent = MedicalRecord;
  }

  // Calendar component selector
  let CalendarComponent;
  if (isAdmin) {
    CalendarComponent = AdminCalendarView;
  } else if (isDoctor || isNurse || isPharmacist) {
    CalendarComponent = CalendarView;
  }

  return (

    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <RequireAuth>
            {DashboardComponent ? <DashboardComponent /> : <NoProfileHandler />}
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            {DashboardComponent ? <DashboardComponent /> : <NoProfileHandler />}
          </RequireAuth>
        }
      />

      <Route
        path="/patients"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN", "DOCTOR", "NURSE"]}>
              {PatientsComponent ? <PatientsComponent /> : <Navigate to="/" replace />}
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/appointments"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN", "DOCTOR", "NURSE", "PHARMACIST"]}>
              {AppointmentsComponent ? <AppointmentsComponent /> : <Navigate to="/" replace />}
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/appointments/all"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN", "DOCTOR", "NURSE", "PHARMACIST"]}>
              {AppointmentsComponent ? <AppointmentsComponent /> : <Navigate to="/" replace />}
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/appointments/calendar"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN", "DOCTOR", "NURSE", "PHARMACIST"]}>
              {CalendarComponent ? <CalendarComponent /> : <Navigate to="/" replace />}
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/schedule-appointment"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN", "DOCTOR"]}>
              <AdminScheduleAppointment />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/record"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN", "DOCTOR", "NURSE"]}>
              {RecordsComponent ? <RecordsComponent /> : <Navigate to="/" replace />}
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/staff/all"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN"]}>
              <AdminStaff />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/staff/departments"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN"]}>
              <AdminDepartments />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/staff/shifts"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["ADMIN"]}>
              <AdminShift />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/shift-schedule"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["NURSE", "PHARMACIST"]}>
              <NurseShiftSchedule />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/"
        element={user ? (isPharmacist ? <PharmaDashboard /> : <Navigate to="/" replace />) : <Navigate to="/login" replace />}
      />

    <Route
        path="/pharma-dashboard"
        element={user && isPharmacist? <PharmaDashboard /> : <Navigate to="/login" replace />}
      />
      
    <Route
      path="/shift-schedule"
      element={isPharmacist? <PharmaScheule /> : <Navigate to="/login" replace />}
  />

      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      
    </Routes>
  );
}

export default App;