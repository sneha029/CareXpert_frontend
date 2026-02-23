import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Calendar,
  Users,
  MessageCircle,
  FileText,
  Clock,
  Settings,
  Search as _Search,
  Send as _Send,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input as _Input } from "../components/ui/input";
import { Label as _Label } from "../components/ui/label";
import {
  Select as _Select,
  SelectContent as _SelectContent,
  SelectItem as _SelectItem,
  SelectTrigger as _SelectTrigger,
  SelectValue as _SelectValue,
} from "../components/ui/select";
import { ScrollArea as _ScrollArea } from "../components/ui/scroll-area";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authstore";

type Appointment = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  appointmentType: 'ONLINE' | 'OFFLINE';
  date: string;
  time: string;
  notes?: string;
  consultationFee?: number;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    profilePicture?: string;
    email: string;
    medicalHistory?: string;
  };
};

type AppointmentApiResponse = {
  statusCode: number;
  message: string;
  success: boolean;
  data: Appointment[];
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [_selectedTimeSlot, _setSelectedTimeSlot] = useState(""); // Keep this state for future UI
  const [_searchQuery, _setSearchQuery] = useState(""); // Keep this state for future UI

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingApppointments] = useState<
    Appointment[]
  >([]);

  const url = `${import.meta.env.VITE_BASE_URL}/api/doctor`;
  // Redirect if not logged in or not a doctor (using dummy logic for now)
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "DOCTOR")) {
      navigate("/auth/login"); // Use react-router-dom navigate
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get<AppointmentApiResponse>(
          `${url}/all-appointments`,
          { withCredentials: true }
        );
        if (res.data.success) {
          const allAppointments = res.data.data;
          const now = new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Filter today's appointments
          const todayApts = allAppointments.filter(apt => {
            const appointmentDate = new Date(apt.date);
            return appointmentDate >= today && appointmentDate < tomorrow;
          });
          
          // Filter upcoming appointments (including today)
          const upcoming = allAppointments.filter(apt => {
            const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
            return appointmentDateTime >= now;
          });
          
          setTodayAppointments(todayApts);
          setUpcomingApppointments(upcoming);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data?.message || "Something went wrong");
        } else {
          toast.error("Unknown error occured");
        }
      }
    }

    fetchAppointments();
  }, []);

  // TODO: Implement patient chats and available slots functionality

  return (
    <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Welcome back, {user?.name || "Doctor"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your practice and help your patients
        </p>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Today's Appointments
                  </p>
                  <p className="text-2xl font-bold dark:text-white">
                    {todayAppointments?.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    247
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Unread Messages
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    3
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    89
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs structure with Appointments tab content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Today's Appointments
                  </CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={
                              appointment.patient.profilePicture || "/placeholder.svg"
                            }
                          />
                          <AvatarFallback>
                            {appointment.patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {appointment.patient.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(appointment.date).toLocaleDateString("en-US")} at {appointment.time}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={appointment.appointmentType === "ONLINE" ? "secondary" : "default"}>
                              {appointment.appointmentType === "ONLINE" ? "Video Call" : "In-Person"}
                            </Badge>
                            <Badge variant={
                              appointment.status === "PENDING" ? "outline" :
                              appointment.status === "CONFIRMED" ? "default" :
                              appointment.status === "COMPLETED" ? "secondary" : "destructive"
                            }>
                              {appointment.status}
                            </Badge>
                          </div>
                          {appointment.notes && (
                            <Badge className="bg-gray-200 text-black dark:bg-gray-600 dark:text-white/90">
                              {appointment.notes}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge
                          variant={
                            appointment.status === "COMPLETED"
                              ? "default"
                              : appointment.status === "PENDING"
                              ? "secondary"
                              : appointment.status === "CANCELLED"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {appointment.status}
                        </Badge>

                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" /> Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments?.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={
                              appointment.patient.profilePicture || "/placeholder.svg"
                            }
                          />
                          <AvatarFallback>
                            {appointment.patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {appointment.patient.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(appointment.date).toLocaleDateString("en-US")} at {appointment.time}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={appointment.appointmentType === "ONLINE" ? "secondary" : "default"}>
                              {appointment.appointmentType === "ONLINE" ? "Video Call" : "In-Person"}
                            </Badge>
                            <Badge variant={
                              appointment.status === "PENDING" ? "outline" :
                              appointment.status === "CONFIRMED" ? "default" :
                              appointment.status === "COMPLETED" ? "secondary" : "destructive"
                            }>
                              {appointment.status}
                            </Badge>
                          </div>
                          {appointment.notes && (
                            <Badge className="bg-gray-200 text-black dark:bg-gray-600 dark:text-white/90">
                              {appointment.notes}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          appointment.status === "CONFIRMED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Availability Tab Placeholder */}
          <TabsContent value="availability">
            <Card>
              <CardContent className="p-6">
                <p>Availability tab content placeholder</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab Placeholder */}
          <TabsContent value="patients">
            <Card>
              <CardContent className="p-6">
                <p>Patients tab content placeholder</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
