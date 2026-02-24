import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout";
import DashboardLayout from "./components/DashboardLayout";
import { useAuthStore } from "./store/authstore";

// Import pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import ProfilePage from "./pages/ProfilePage";
import AppointmentManagementPage from "./pages/AppointmentManagementPage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import DoctorAppointmentHistoryPage from "./pages/DoctorAppointmentHistoryPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import NotificationsPage from "./pages/NotificationsPage";
import DoctorPendingRequestsPage from "./pages/DoctorPendingRequestsPage";
import AdminPage from "./pages/AdminPage";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import StartCall from "./pages/StartCall";
import UploadReportPage from "./pages/UploadReportPage";
import AppointmentHistoryPage from "./pages/AppointmentHistoryPage";
import PharmacyPage from "./pages/PharmacyPage";

// Protected Route wrapper — redirects to /auth if not logged in
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/auth/*" element={<AuthPage />} />

      {/* Dashboard routes with sidebar (protected) */}
      <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="patient" element={<PatientDashboard />} />
        <Route path="doctor" element={<DoctorDashboard />} />
      </Route>

      {/* Other authenticated routes with sidebar (protected) */}
      <Route path="/appointments" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AppointmentManagementPage />} />
      </Route>
      <Route path="/doctor/appointments" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DoctorAppointmentsPage />} />
      </Route>
      <Route path="/doctor/appointment-history" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DoctorAppointmentHistoryPage />} />
      </Route>
      <Route path="/prescriptions" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PrescriptionsPage />} />
      </Route>
      <Route path="/notifications" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<NotificationsPage />} />
      </Route>
      <Route path="/pending-requests" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DoctorPendingRequestsPage />} />
      </Route>
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ProfilePage />} />
      </Route>
      <Route path="/doctors" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DoctorsPage />} />
      </Route>
      <Route path="/doctors/:id" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DoctorProfilePage />} />
      </Route>
      <Route path="/book-appointment/:id" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<BookAppointmentPage />} />
      </Route>
      <Route path="/chat" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ChatPage />} />
      </Route>
      <Route path="/upload-report" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<UploadReportPage />} />
      </Route>
      <Route path="/appointment-history" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AppointmentHistoryPage />} />
      </Route>
      <Route path="/pharmacy" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PharmacyPage />} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminPage />} />
      </Route>
      <Route path="/start-call" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<StartCall />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}
