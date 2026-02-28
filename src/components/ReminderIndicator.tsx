import { Bell } from "lucide-react";
import { format } from "date-fns";

interface ReminderIndicatorProps {
  reminderSent: boolean;
  scheduledReminderTime?: string;
  appointmentDate: string;
  appointmentTime: string;
  size?: "sm" | "md" | "lg";
  compact?: boolean;
}

export default function ReminderIndicator({
  reminderSent,
  scheduledReminderTime,
  appointmentDate,
  appointmentTime,
  size = "md",
  compact = false,
}: ReminderIndicatorProps) {
  const buildAppointmentDateTime = (dateValue: string, timeValue: string) => {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    const [hoursPart, minutesPart] = (timeValue || "").split(":");
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);

    if (
      Number.isInteger(hours) &&
      Number.isInteger(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      const mergedDateTime = new Date(parsedDate);
      mergedDateTime.setHours(hours, minutes, 0, 0);
      return mergedDateTime;
    }

    return parsedDate;
  };

  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (reminderSent) {
    return (
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`}
      >
        <Bell className={`h-3.5 w-3.5 text-green-600 dark:text-green-400 fill-current`} />
        <span className={`${textSizeMap[size]} font-medium text-green-700 dark:text-green-300`}>
          {compact ? "Sent" : "Reminder Sent"}
        </span>
      </div>
    );
  }

  // Calculate if reminder will be sent within 48 hours
  const now = new Date();
  const appointmentDateTime = buildAppointmentDateTime(
    appointmentDate,
    appointmentTime
  );
  const scheduledTime = scheduledReminderTime ? new Date(scheduledReminderTime) : null;
  const timeUntilReminder = scheduledTime ? scheduledTime.getTime() - now.getTime() : 0;
  const willBeSentSoon = timeUntilReminder > 0 && timeUntilReminder < 48 * 60 * 60 * 1000;
  const reminderAlreadyPassed = timeUntilReminder <= 0 && appointmentDateTime > now;

  if (reminderAlreadyPassed) {
    // Reminder was scheduled to be sent but pending dispatch
    return (
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800`}
      >
        <Bell className={`h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-pulse`} />
        <span className={`${textSizeMap[size]} font-medium text-amber-700 dark:text-amber-300`}>
          {compact ? "Pending" : "Reminder Pending"}
        </span>
      </div>
    );
  }

  if (willBeSentSoon && scheduledTime) {
    return (
      <div
        className={`flex flex-col gap-0.5 px-2.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}
      >
        <div className="flex items-center gap-1.5">
          <Bell className={`h-3.5 w-3.5 text-blue-600 dark:text-blue-400`} />
          <span className={`${textSizeMap[size]} font-medium text-blue-700 dark:text-blue-300`}>
            {compact ? "Scheduled" : "Reminder Scheduled"}
          </span>
        </div>
        {!compact && (
          <span className="text-xs text-blue-600 dark:text-blue-400 ml-5">
            {format(scheduledTime, "MMM d, yyyy 'at' h:mm a")}
          </span>
        )}
      </div>
    );
  }

  // For appointments more than 48 hours away, no indicator yet
  return null;
}
