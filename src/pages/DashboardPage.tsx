import { Navigate } from "react-router-dom";

// This page is deprecated — use PatientDashboard or DoctorDashboard instead
export default function DashboardPage() {
  return <Navigate to="/dashboard/patient" replace />;
}

