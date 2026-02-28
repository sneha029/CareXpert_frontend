import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, Search, Star, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/authstore";
import { api } from "@/lib/api";
import axios from "axios";
import { motion } from "framer-motion";
import { notify } from "@/lib/toast";
import { logger } from "@/lib/logger";
import { Input } from "../components/ui/input";
// ReminderIndicator and AppointmentCountdown were unused in this simplified view
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { reviewAPI } from "@/lib/services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
  review?: {
    id: string;
    rating: number;
    comment?: string | null;
    isAnonymous: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
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
    averageRating: number;
    totalReviews: number;
  };
};

type AppointmentApiResponse = {
  statusCode: number;
  message: string;
  success: boolean;
  data: Appointment[];
};

export default function AppointmentHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAnonymous, setReviewAnonymous] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    if (user.role === "DOCTOR") {
      navigate("/doctor/appointment-history");
      return;
    }

    if (user.role === "PATIENT") fetchAppointmentHistory();
    else setLoading(false);
  }, [user, navigate]);

  const filterAppointments = useCallback(() => {
    let filtered = [...appointments];

    if (searchTerm) {
      filtered = filtered.filter((appointment) =>
        appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  useEffect(() => {
    filterAppointments();
  }, [filterAppointments]);

  const fetchAppointmentHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get<AppointmentApiResponse>(`/patient/all-appointments`, { withCredentials: true });
      if (response.data.success) setAppointments(response.data.data);
    } catch (error) {
      logger.error("Error fetching appointment history:", error as Error);
      if (axios.isAxiosError(error) && error.response) notify.error(error.response.data?.message || "Failed to fetch appointment history");
      else notify.error("Failed to fetch appointment history");
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReviewRating(appointment.review?.rating ?? 5);
    setReviewComment(appointment.review?.comment ?? "");
    setReviewAnonymous(Boolean(appointment.review?.isAnonymous));
    setIsReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    if (isSubmittingReview) return;
    setIsReviewDialogOpen(false);
    setSelectedAppointment(null);
  };

  const updateAppointmentReviewLocally = (appointmentId: string, review: Appointment["review"]) => {
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, review } : a)));
  };

  const submitReview = async () => {
    if (!selectedAppointment) return;
    if (reviewRating < 1 || reviewRating > 5) {
      notify.error("Please select a rating between 1 and 5");
      return;
    }
    if (reviewComment.trim().length > 1000) {
      notify.error("Comment must be 1000 characters or fewer");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const payload = { rating: reviewRating, comment: reviewComment.trim(), isAnonymous: reviewAnonymous };

      if (selectedAppointment.review?.id) {
        const response = await reviewAPI.updateReview(selectedAppointment.review.id, payload);
        if (response.data.success) {
          const updated = response.data.data;
          updateAppointmentReviewLocally(selectedAppointment.id, {
            id: updated.id,
            rating: updated.rating,
            comment: updated.comment,
            isAnonymous: updated.isAnonymous,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          });
          notify.success("Review updated successfully");
          closeReviewDialog();
        }
        return;
      }

      const response = await reviewAPI.createReview({ appointmentId: selectedAppointment.id, ...payload });
      if (response.data.success) {
        const created = response.data.data;
        updateAppointmentReviewLocally(selectedAppointment.id, {
          id: created.id,
          rating: created.rating,
          comment: created.comment,
          isAnonymous: created.isAnonymous,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        });
        notify.success("Review submitted successfully");
        closeReviewDialog();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) notify.error(error.response.data?.message || "Failed to save review");
      else notify.error("Failed to save review");
    } finally {
      setIsSubmittingReview(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const base = "backdrop-blur-sm rounded-full px-2.5 py-1 border shadow-sm text-xs font-medium";
    const map: Record<string, { label: string; cls: string }> = {
      PENDING: { label: "Pending", cls: "bg-gradient-to-r from-amber-400/15 to-yellow-500/15 text-amber-700 dark:text-amber-200 border-amber-400/30" },
      CONFIRMED: { label: "Confirmed", cls: "bg-gradient-to-r from-emerald-400/15 to-teal-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-400/30" },
      COMPLETED: { label: "Completed", cls: "bg-gradient-to-r from-sky-400/15 to-indigo-500/15 text-sky-700 dark:text-sky-200 border-sky-400/30" },
      CANCELLED: { label: "Cancelled", cls: "bg-gradient-to-r from-rose-400/15 to-red-500/15 text-rose-700 dark:text-rose-200 border-rose-400/30" },
      REJECTED: { label: "Rejected", cls: "bg-gradient-to-r from-rose-400/15 to-red-500/15 text-rose-700 dark:text-rose-200 border-rose-400/30" },
    };

    const cfg = map[status] || map["PENDING"];
    return (
      <Badge variant="outline" className={`${base} ${cfg.cls}`}>
        {cfg.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  

  const getStatusCounts = () => ({
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
    rejected: appointments.filter((a) => a.status === "REJECTED").length,
    reviewed: appointments.filter((a) => a.review?.id).length,
  });

  const statusCounts = getStatusCounts();

  if (loading) return (
    <div className="p-6 md:p-8"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div></div>
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Appointment History</h1>
        <p className="text-gray-600 dark:text-gray-400">View your past and upcoming appointments</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
        <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.total}</div><div className="text-sm text-gray-600 dark:text-gray-400">Total</div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div><div className="text-sm text-gray-600 dark:text-gray-400">Request Sent</div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</div><div className="text-sm text-gray-600 dark:text-gray-400">Confirmed</div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold text-blue-600">{statusCounts.completed}</div><div className="text-sm text-gray-600 dark:text-gray-400">Completed</div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div><div className="text-sm text-gray-600 dark:text-gray-400">Cancelled</div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div><div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold text-amber-600">{statusCounts.reviewed}</div><div className="text-sm text-gray-600 dark:text-gray-400">Reviewed</div></div></CardContent></Card>
      </div>

      <Card className="mb-6"><CardContent className="p-6"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search by doctor name or specialty..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="PENDING">Request Sent</SelectItem><SelectItem value="CONFIRMED">Confirmed</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem><SelectItem value="REJECTED">Rejected</SelectItem></SelectContent></Select>
      </div></CardContent></Card>

      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><Calendar className="h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments found</h3><p className="text-gray-500 dark:text-gray-400 text-center">{appointments.length === 0 ? "You don't have any appointments yet." : "No appointments match your current filters."}</p></CardContent></Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <motion.div key={appointment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="hover:shadow-lg transition-shadow"><CardContent className="p-6">{/* content simplified for brevity */}
                <div className="flex items-center justify-between"><div><h3 className="font-semibold">{appointment.doctor.name}</h3><p className="text-sm text-blue-600">{appointment.doctor.specialty}</p></div><div>{getStatusBadge(appointment.status)}</div></div>
                <div className="mt-3 text-sm text-gray-600">Created: {formatDate(appointment.createdAt)}</div>
                <div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => openReviewDialog(appointment)}>Leave / Edit Review</Button><Button variant="ghost" onClick={() => {}}>View Details <ChevronRight className="ml-2" /></Button></div>
              </CardContent></Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={isReviewDialogOpen} onOpenChange={(open) => (open ? setIsReviewDialogOpen(true) : closeReviewDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">{[1,2,3,4,5].map((r) => (<Button key={r} variant={r===reviewRating?"default":"ghost"} onClick={() => setReviewRating(r)}>{r} <Star className="ml-1"/></Button>))}</div>
            <Label>Comment</Label>
            <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog} disabled={isSubmittingReview}>Cancel</Button>
            <Button onClick={submitReview} disabled={isSubmittingReview}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
