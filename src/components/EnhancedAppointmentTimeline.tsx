import { format } from "date-fns";
import { Check, Clock, Bell, XCircle } from "lucide-react";

type TimelineStage = {
  id: string;
  label: string;
  timestamp?: string | Date;
  description?: string;
};

interface EnhancedAppointmentTimelineProps {
  stages: TimelineStage[];
  currentStageId: string;
  appointmentDate: string;
  appointmentTime: string;
  reminderSent?: boolean;
  cancelReason?: string;
}

export default function EnhancedAppointmentTimeline({
  stages,
  currentStageId,
  appointmentDate,
  appointmentTime,
  reminderSent = false,
  cancelReason,
}: EnhancedAppointmentTimelineProps) {
  const currentIndex = stages.findIndex((stage) => stage.id === currentStageId);
  const isCancelled = currentStageId === "cancelled";

  const getStageIcon = (stageId: string) => {
    if (stageId === "cancelled") return <XCircle className="h-5 w-5" />;
    if (stageId === "reminder_sent" || reminderSent && stageId === "upcoming")
      return <Bell className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  const getFormattedTimestamp = (timestamp?: string | Date) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Main timeline line */}
        <div className="absolute left-2.5 top-12 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700" />

        {/* Timeline items */}
        <div className="space-y-6">
          {stages.map((stage, index) => {
            let status: "upcoming" | "active" | "completed" | "cancelled" = "upcoming";

            if (isCancelled) {
              if (stage.id === "cancelled") status = "cancelled";
            } else {
              if (index < currentIndex) status = "completed";
              if (index === currentIndex) status = "active";
            }

            const isCompleted = status === "completed";
            const isActive = status === "active";
            const isStageCancelled = status === "cancelled";

            return (
              <div key={stage.id} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white dark:bg-gray-900
                      ${isCompleted ? "bg-green-100 border-green-400 text-green-600" : ""}
                      ${isActive ? "bg-blue-100 border-blue-400 text-blue-600 animate-pulse" : ""}
                      ${!isCompleted && !isActive && !isStageCancelled ? "bg-gray-100 border-gray-300 text-gray-400" : ""}
                      ${isStageCancelled ? "bg-red-100 border-red-400 text-red-600" : ""}
                    `}
                  >
                    {isCompleted && <Check className="h-4 w-4" />}
                    {isActive && getStageIcon(stage.id)}
                    {!isCompleted && !isActive && !isStageCancelled && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                    {isStageCancelled && <XCircle className="h-4 w-4" />}
                  </div>
                </div>

                {/* Timeline content */}
                <div className="pb-6 flex-1">
                  <h3
                    className={`font-semibold text-base
                      ${isCompleted ? "text-green-700 dark:text-green-400" : ""}
                      ${isActive ? "text-blue-700 dark:text-blue-400" : ""}
                      ${!isCompleted && !isActive && !isStageCancelled ? "text-gray-500 dark:text-gray-400" : ""}
                      ${isStageCancelled ? "text-red-700 dark:text-red-400 line-through" : ""}
                    `}
                  >
                    {stage.label}
                  </h3>

                  {stage.timestamp && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getFormattedTimestamp(stage.timestamp)}
                    </p>
                  )}

                  {stage.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {stage.description}
                    </p>
                  )}

                  {/* Special messages */}
                  {stage.id === "upcoming" && appointmentDate && appointmentTime && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Scheduled for {format(new Date(`${appointmentDate}T${appointmentTime}`), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}

                  {stage.id === "reminder_sent" && reminderSent && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Reminder email has been sent successfully
                    </p>
                  )}

                  {stage.id === "reminder_sent" && !reminderSent && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Reminder email will be sent 48 hours before the appointment
                    </p>
                  )}

                  {stage.id === "cancelled" && isStageCancelled && cancelReason && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-medium">Reason:</span> {cancelReason}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
