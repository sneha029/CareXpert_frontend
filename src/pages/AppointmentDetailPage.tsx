import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useAuthStore } from "@/store/authstore";
import { api } from "@/lib/api";
import axios from "axios";
import { logger } from "@/lib/logger";
import { notify } from "@/lib/toast";
import { motion } from "framer-motion";
import ReminderIndicator from "../components/ReminderIndicator";
import AppointmentCountdown from "../components/AppointmentCountdown";
import EnhancedAppointmentTimeline from "../components/EnhancedAppointmentTimeline";
import { useNavigate } from "react-router-dom";

type Appointment = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  appointmentType: "ONLINE" | "OFFLINE";
  date: string;
  time: string;
  notes?: string;
  consultationFee?: number;
  createdAt: string;
  updatedAt: string;
  prescriptionId?: string | null;
  reminderSent: boolean;
  scheduledReminderTime: string;
  isReminderScheduled: boolean;
  doctor: {
    id: string;
    name: string;
    profilePicture?: string;
    specialty: string;
    clinicLocation: string;
    experience: string;
    education?: string;
    bio?: string;
    languages: string[];
  };
};

export default function AppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  // ensure fetchAppointmentDetail is declared before use


  const fetchAppointmentDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Appointment }>(
        `/patient/all-appointments`,
        { withCredentials: true }
      );

      if (response.data.data) {
        const found = Array.isArray(response.data.data)
          ? (response.data.data as Appointment[]).find(
              (apt) => apt.id === appointmentId
            )
          : null;

        if (found) {
          setAppointment(found);
        } else {
          notify.error("Appointment not found");
          navigate("/appointment-history");
        }
      }
    } catch (error) {
      logger.error("Error fetching appointment:", error);
      if (axios.isAxiosError(error) && error.response) {
        notify.error(error.response.data?.message || "Failed to fetch appointment");
      } else {
        notify.error("Failed to fetch appointment");
      }
    } finally {
      setLoading(false);
    }
  }, [appointmentId, navigate]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!appointmentId || user?.role !== "PATIENT") {
      setLoading(false);
      return;
    }

    fetchAppointmentDetail();
  }, [authLoading, user, appointmentId, fetchAppointmentDetail]);

  const getStatusBadge = (status: string) => {
    const base =
      "backdrop-blur-sm rounded-full px-3 py-1.5 border shadow-sm text-sm font-medium";
    const map: Record<string, { label: string; cls: string }> = {
      PENDING: {
        label: "Pending",
        cls:
          "bg-gradient-to-r from-amber-400/15 to-yellow-500/15 text-amber-700 dark:text-amber-200 border-amber-400/30",
      },
      CONFIRMED: {
        label: "Confirmed",
        cls:
          "bg-gradient-to-r from-emerald-400/15 to-teal-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-400/30",
      },
      COMPLETED: {
        label: "Completed",
        cls:
          "bg-gradient-to-r from-sky-400/15 to-indigo-500/15 text-sky-700 dark:text-sky-200 border-sky-400/30",
      },
      CANCELLED: {
        label: "Cancelled",
        cls:
          "bg-gradient-to-r from-rose-400/15 to-red-500/15 text-rose-700 dark:text-rose-200 border-rose-400/30",
      },
      REJECTED: {
        label: "Rejected",
        cls:
          "bg-gradient-to-r from-rose-400/15 to-red-500/15 text-rose-700 dark:text-rose-200 border-rose-400/30",
      },
    };

    const cfg = map[status] || map["PENDING"];
    return (
      <Badge variant="outline" className={`${base} ${cfg.cls}`}>
        {cfg.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimelineStages = () => {
    const stages: Array<{
      id: string;
      label: string;
      timestamp?: string;
      description?: string;
    }> = [
      {
        id: "booked",
        label: "Appointment Booked",
        timestamp: appointment?.createdAt,
      },
    ];

    if (appointment?.reminderSent) {
      stages.push({
        id: "reminder_sent",
        label: "Reminder Sent",
        timestamp: appointment?.updatedAt,
      });
    } else {
      stages.push({
        id: "reminder_pending",
        label: "Reminder Pending",
        description: "Will be sent 48 hours before the appointment",
      });
    }

    stages.push({
      id: "upcoming",
      label: "Appointment Day",
      timestamp: `${appointment?.date}T${appointment?.time}`,
    });

    if (appointment?.status === "COMPLETED") {
      stages.push({
        id: "completed",
        label: "Completed",
        timestamp: appointment?.updatedAt,
      });
    } else if (appointment?.status === "CANCELLED") {
      stages.push({
        id: "cancelled",
        label: "Cancelled",
        timestamp: appointment?.updatedAt,
      });
    }

    return stages;
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6 md:p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/appointment-history")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Appointment Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We couldn't find the appointment you're looking for.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStageId =
    appointment.status === "COMPLETED"
      ? "completed"
      : appointment.status === "CANCELLED"
        ? "cancelled"
        : appointment.reminderSent
          ? "reminder_sent"
          : "reminder_pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 md:p-8"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/appointment-history")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Appointments
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {appointment.doctor.name}
              </h1>
              <p className="text-lg text-blue-600 dark:text-blue-400">
                {appointment.doctor.specialty}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {getStatusBadge(appointment.status)}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ID: {appointment.id.slice(0, 8)}...
            </div>
          </div>
        </div>

        {/* Reminder and Countdown */}
        <div className="space-y-3">
          {(appointment.reminderSent || appointment.isReminderScheduled) && (
            <ReminderIndicator
              reminderSent={appointment.reminderSent}
              scheduledReminderTime={appointment.scheduledReminderTime}
              appointmentDate={appointment.date}
              appointmentTime={appointment.time}
              size="lg"
            />
          )}
          {(appointment.status === "CONFIRMED" ||
            appointment.status === "PENDING") && (
            <AppointmentCountdown
              appointmentDate={appointment.date}
              appointmentTime={appointment.time}
              hideIfPast={false}
            />
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Appointment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Appointment Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Date
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(appointment.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Time
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatTime(appointment.time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointment.doctor.clinicLocation}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Type
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointment.appointmentType}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Doctor Information
              </h2>
              <div className="space-y-3">
                {appointment.doctor.experience && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Experience
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointment.doctor.experience} years
                    </p>
                  </div>
                )}
                {appointment.doctor.education && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Education
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointment.doctor.education}
                    </p>
                  </div>
                )}
                {appointment.doctor.languages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Languages
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {appointment.doctor.languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {appointment.doctor.bio && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Bio
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {appointment.doctor.bio}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {appointment.notes && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Appointment Notes
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {appointment.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Consultation Fee */}
          {appointment.consultationFee && (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Consultation Fee
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{appointment.consultationFee}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="p-6 space-y-3">
              {appointment.prescriptionId && (
                <Button
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `/patient/prescription-pdf/${appointment.prescriptionId}`,
                      "_blank"
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Prescription
                </Button>
              )}
              {(appointment.status === "CONFIRMED" ||
                appointment.status === "PENDING") && (
                <Button variant="destructive" className="w-full">
                  Cancel Appointment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Appointment Status Timeline
          </h2>
          <EnhancedAppointmentTimeline
            stages={getTimelineStages()}
            currentStageId={currentStageId}
            appointmentDate={appointment.date}
            appointmentTime={appointment.time}
            reminderSent={appointment.reminderSent}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
