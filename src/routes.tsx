import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout";
import DashboardLayout from "./components/DashboardLayout";
import { useAuthStore } from "./store/authstore";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const DoctorsPage = lazy(() => import("./pages/DoctorsPage"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));
const BookAppointmentPage = lazy(() => import("./pages/BookAppointmentPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AppointmentManagementPage = lazy(() => import("./pages/AppointmentManagementPage"));
const DoctorAppointmentsPage = lazy(() => import("./pages/DoctorAppointmentsPage"));
const DoctorAppointmentHistoryPage = lazy(() => import("./pages/DoctorAppointmentHistoryPage"));
const PrescriptionsPage = lazy(() => import("./pages/PrescriptionsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const DoctorPendingRequestsPage = lazy(() => import("./pages/DoctorPendingRequestsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const StartCall = lazy(() => import("./pages/StartCall"));
const UploadReportPage = lazy(() => import("./pages/UploadReportPage"));
const AppointmentHistoryPage = lazy(() => import("./pages/AppointmentHistoryPage"));
const AppointmentStatusPage = lazy(() => import("./pages/AppointmentStatusPage"));
const PharmacyPage = lazy(() => import("./pages/PharmacyPage"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
<<<<<<< fix/mobile-responsiveness
=======
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
>>>>>>> main

        {/* Public Layout Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Auth */}
        <Route path="/auth/*" element={<AuthPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/appointments" element={<AppointmentManagementPage />} />
          <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
          <Route path="/doctor/appointment-history" element={<DoctorAppointmentHistoryPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/pending-requests" element={<DoctorPendingRequestsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="/book-appointment/:id" element={<BookAppointmentPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload-report" element={<UploadReportPage />} />
          <Route path="/appointment-history" element={<AppointmentHistoryPage />} />
          <Route path="/appointment-status" element={<AppointmentStatusPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/start-call" element={<StartCall />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}