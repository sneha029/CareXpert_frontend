import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Users,
  UserCheck,
  Calendar,
  Settings,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Activity,
} from "lucide-react";
import { useAuthStore } from "../store/authstore";
import { logger } from "@/lib/logger";

export default function AdminPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      navigate("/auth/login");
    }
  }, [user, isLoading, navigate]);

  // Mock data with enhanced analytics
  const stats = {
    totalUsers: 1247,
    totalDoctors: 89,
    totalAppointments: 2456,
    activeChats: 156,
    pendingRequests: 12,
    monthlyGrowth: 15.3,
    revenue: 45600,
    satisfaction: 4.8,
  };

  const analyticsData = {
    appointmentsThisMonth: [
      { month: "Jan", appointments: 180 },
      { month: "Feb", appointments: 220 },
      { month: "Mar", appointments: 280 },
      { month: "Apr", appointments: 320 },
      { month: "May", appointments: 380 },
      { month: "Jun", appointments: 420 },
    ],
    topSpecialties: [
      { specialty: "General Medicine", count: 45, percentage: 35 },
      { specialty: "Cardiology", count: 32, percentage: 25 },
      { specialty: "Dermatology", count: 28, percentage: 22 },
      { specialty: "Neurology", count: 23, percentage: 18 },
    ],
  };

  const doctorRequests = [
    {
      id: 1,
      name: "Dr. James Wilson",
      email: "j.wilson@email.com",
      specialty: "Cardiology",
      experience: "8 years",
      licenseNumber: "MD789012",
      location: "Boston, MA",
      education: "Harvard Medical School",
      submittedDate: "2024-01-14",
      status: "Pending",
      documents: ["License", "Degree", "CV"],
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Dr. Lisa Chen",
      email: "l.chen@email.com",
      specialty: "Pediatrics",
      experience: "6 years",
      licenseNumber: "MD345678",
      location: "San Francisco, CA",
      education: "UCSF School of Medicine",
      submittedDate: "2024-01-13",
      status: "Under Review",
      documents: ["License", "Degree", "CV", "References"],
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Dr. Robert Kim",
      email: "r.kim@email.com",
      specialty: "Orthopedics",
      experience: "12 years",
      licenseNumber: "MD901234",
      location: "Seattle, WA",
      education: "Johns Hopkins University",
      submittedDate: "2024-01-12",
      status: "Approved",
      documents: ["License", "Degree", "CV", "References", "Background Check"],
      avatar: "/placeholder.svg",
    },
  ];

  const recentAppointments = [
    {
      id: 1,
      patient: "John Smith",
      doctor: "Dr. Sarah Johnson",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "Completed",
      type: "Video Call",
      revenue: 150,
    },
    {
      id: 2,
      patient: "Emily Davis",
      doctor: "Dr. Michael Chen",
      date: "2024-01-15",
      time: "2:30 PM",
      status: "Confirmed",
      type: "In-person",
      revenue: 120,
    },
    {
      id: 3,
      patient: "Robert Wilson",
      doctor: "Dr. Lisa Park",
      date: "2024-01-15",
      time: "4:00 PM",
      status: "Cancelled",
      type: "Video Call",
      revenue: 0,
    },
  ];

  const handleApproveDoctor = () => {
    logger.debug("Doctor approval initiated", { safe: true });
    alert("Doctor approved successfully!");
  };

  const handleRejectDoctor = () => {
    logger.debug("Doctor rejection initiated", { safe: true });
    alert("Doctor application rejected.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome, {user?.name || "Admin"}! Comprehensive platform management
            and analytics
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{stats.monthlyGrowth}% this month
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Active Doctors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalDoctors}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {stats.pendingRequests} pending
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Appointments
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalAppointments}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {stats.activeChats} active chats
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Rating: {stats.satisfaction}/5.0
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:w-auto lg:grid-cols-5 gap-2">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="doctor-requests"
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Doctor Requests
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Appointment Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Appointment Trends
                  </CardTitle>
                  <CardDescription>
                    Monthly appointment statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.appointmentsThisMonth.map((data, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {data.month}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(data.appointments / 500) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 w-12">
                            {data.appointments}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Popular Specialties
                  </CardTitle>
                  <CardDescription>
                    Most requested medical specialties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topSpecialties.map((specialty, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {specialty.specialty}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {specialty.count} doctors
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${specialty.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  Latest appointment activity and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.patient} → {appointment.doctor}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {appointment.date} at {appointment.time} •{" "}
                          {appointment.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ${appointment.revenue}
                        </span>
                        <Badge
                          variant={
                            appointment.status === "Completed"
                              ? "default"
                              : appointment.status === "Confirmed"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctor Requests Tab */}
          <TabsContent value="doctor-requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Doctor Applications
                </CardTitle>
                <CardDescription>
                  Review and approve new doctor registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {doctorRequests.map((request) => (
                    <Card key={request.id} className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={request.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {request.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {request.name}
                              </h3>
                              <Badge
                                variant={
                                  request.status === "Approved"
                                    ? "default"
                                    : request.status === "Under Review"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {request.status}
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                              <div>
                                <p>
                                  <strong>Email:</strong> {request.email}
                                </p>
                                <p>
                                  <strong>Specialty:</strong>{" "}
                                  {request.specialty}
                                </p>
                                <p>
                                  <strong>Experience:</strong>{" "}
                                  {request.experience}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>License:</strong>{" "}
                                  {request.licenseNumber}
                                </p>
                                <p>
                                  <strong>Location:</strong> {request.location}
                                </p>
                                <p>
                                  <strong>Education:</strong>{" "}
                                  {request.education}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <strong>Submitted:</strong>{" "}
                                {request.submittedDate}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {request.documents.map((doc) => (
                                  <Badge
                                    key={doc}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:w-48">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>

                          {request.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveDoctor()}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => handleRejectDoctor()}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs remain the same but simplified for brevity */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>
                  Monitor and manage all appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Appointment management interface...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  User management interface...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Settings interface...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
