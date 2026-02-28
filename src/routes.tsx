import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate} from "react-router-dom";
import Layout from "./components/layout";
import DashboardLayout from "./components/DashboardLayout";
import { useAuthStore } from "./store/authstore";

/* ============================= */
/* Lazy Loaded Pages */
/* ============================= */

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const DoctorsPage = lazy(() => import("./pages/DoctorsPage"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));
const BookAppointmentPage = lazy(() => import("./pages/BookAppointmentPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const AppointmentManagementPage = lazy(
  () => import("./pages/AppointmentManagementPage")
);
const DoctorAppointmentsPage = lazy(
  () => import("./pages/DoctorAppointmentsPage")
);
const DoctorAppointmentHistoryPage = lazy(
  () => import("./pages/DoctorAppointmentHistoryPage")
);
const AppointmentManagementPage = lazy(() => import("./pages/AppointmentManagementPage"));
const DoctorAppointmentsPage = lazy(() => import("./pages/DoctorAppointmentsPage"));
const DoctorAppointmentHistoryPage = lazy(() => import("./pages/DoctorAppointmentHistoryPage"));
const DoctorPrescriptionsPage = lazy(() => import("./pages/DoctorPrescriptionsPage"));
const DoctorReportsPage = lazy(() => import("./pages/DoctorReportsPage"));
const DoctorReviewsPage = lazy(() => import("./pages/DoctorReviewsPage"));
const PrescriptionTemplatesPage = lazy(() => import("./pages/PrescriptionTemplatesPage"));
const PrescriptionsPage = lazy(() => import("./pages/PrescriptionsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const DoctorPendingRequestsPage = lazy(
  () => import("./pages/DoctorPendingRequestsPage")
);
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const StartCall = lazy(() => import("./pages/StartCall"));
const UploadReportPage = lazy(() => import("./pages/UploadReportPage"));

const AppointmentHistoryPage = lazy(
  () => import("./pages/AppointmentHistoryPage")
);
const AppointmentStatusPage = lazy(
  () => import("./pages/AppointmentStatusPage")
);

const AppointmentHistoryPage = lazy(() => import("./pages/AppointmentHistoryPage"));
const AppointmentDetailPage = lazy(() => import("./pages/AppointmentDetailPage"));
const MyReviewsPage = lazy(() => import("./pages/MyReviewsPage"));
const AppointmentStatusPage = lazy(() => import("./pages/AppointmentStatusPage"));
const PharmacyPage = lazy(() => import("./pages/PharmacyPage"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HealthMetricsDashboardPage = lazy(() => import("./pages/HealthMetricsDashboardPage"));

/* ============================= */
/* Loader */
/* ============================= */

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

/* ============================= */
/* Protected Route */
/* ============================= */

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

/* ============================= */
/* App Routes */
/* ============================= */

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ---------- Public Layout ---------- */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* ---------- Auth Routes ---------- */}
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ---------- Protected Routes ---------- */}
       <Route
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
        
          {/* Dashboards */}
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />

          {/* Appointments */}
          <Route path="/appointments" element={<AppointmentManagementPage />} />
          <Route path="/appointment-history" element={<AppointmentHistoryPage />} />
          <Route path="/appointment-status" element={<AppointmentStatusPage />} />
          <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
          <Route
            path="/doctor/appointment-history"
            element={<DoctorAppointmentHistoryPage />}
          />

          {/* Other Features */}
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/pending-requests" element={<DoctorPendingRequestsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="/book-appointment/:id" element={<BookAppointmentPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload-report" element={<UploadReportPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/start-call" element={<StartCall />} />

        <Route path="/appointments" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AppointmentManagementPage />} />
        </Route>
        <Route path="/doctor/appointments" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DoctorAppointmentsPage />} />
        </Route>
        <Route path="/doctor/appointment-history" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DoctorAppointmentHistoryPage />} />
        </Route>
        <Route path="/doctor/prescriptions" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DoctorPrescriptionsPage />} />
        </Route>
        <Route path="/doctor/prescription-templates" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<PrescriptionTemplatesPage />} />
        </Route>
        <Route path="/doctor/reports" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DoctorReportsPage />} />
        </Route>
        <Route path="/doctor/reviews" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DoctorReviewsPage />} />
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
        <Route path="/appointment/:appointmentId" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AppointmentDetailPage />} />
        </Route>
        <Route path="/my-reviews" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<MyReviewsPage />} />
        </Route>
        <Route path="/appointment-status" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AppointmentStatusPage />} />
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
        <Route path="/patient/:patientId/health-metrics" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<HealthMetricsDashboardPage />} />
        </Route>

        {/* ---------- 404 ---------- */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}