import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import {differenceInHours, isTomorrow, isToday } from "date-fns";

interface AppointmentCountdownProps {
  appointmentDate: string;
  appointmentTime: string;
  hideIfPast?: boolean;
  compact?: boolean;
}

export default function AppointmentCountdown({
  appointmentDate,
  appointmentTime,
  hideIfPast = true,
  compact = false,
}: AppointmentCountdownProps) {
  const [countdown, setCountdown] = useState<string>("");
  const [colorClass, setColorClass] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      
      // Parse the date properly - handle both ISO strings and date-only strings
      const dateOnly = appointmentDate.split('T')[0]; // Extract YYYY-MM-DD from ISO string
      const appointmentDateTime = new Date(`${dateOnly}T${appointmentTime}`);

      // If appointment is in the past
      if (appointmentDateTime <= now) {
        if (hideIfPast) {
          setCountdown("");
        } else {
          setCountdown("Appointment in the past");
        }
        setColorClass("text-gray-400 dark:text-gray-600");
        setIsLoading(false);
        return;
      }

      const diffMs = appointmentDateTime.getTime() - now.getTime();
      const diffHours = differenceInHours(appointmentDateTime, now);
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      // Determine color based on urgency
      let color = "";
      let newCountdown = "";

      if (diffHours < 1) {
        // Less than 1 hour - critical
        color = "text-red-600 dark:text-red-400 animate-pulse font-semibold";
        const mins = Math.max(0, diffMins);
        newCountdown = compact ? `In ${mins}m` : `In ${mins} minute${mins !== 1 ? "s" : ""}`;
      } else if (diffHours < 24) {
        // Less than 24 hours - warning
        color = "text-amber-600 dark:text-amber-400 font-semibold";
        if (isToday(appointmentDateTime)) {
          newCountdown = compact ? `Today at ${formatTime(appointmentTime)}` : `Today at ${formatTime(appointmentTime)}`;
        } else {
          newCountdown = compact ? `In ${diffHours}h` : `In ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
        }
      } else {
        // More than 24 hours
        color = "text-emerald-600 dark:text-emerald-400";
        if (isTomorrow(appointmentDateTime)) {
          newCountdown = compact ? `Tomorrow` : `Tomorrow at ${formatTime(appointmentTime)}`;
        } else {
          newCountdown = compact ? `In ${diffDays}d` : `In ${diffDays} day${diffDays !== 1 ? "s" : ""}, ${Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h`;
        }
      }

      setCountdown(newCountdown);
      setColorClass(color);
      setIsLoading(false);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [appointmentDate, appointmentTime, hideIfPast, compact]);

  if (isLoading || !countdown) return null;

  return (
    <div className={`flex items-center gap-1.5 ${colorClass}`}>
      <Clock className="h-4 w-4" />
      <span className={compact ? "text-xs font-medium" : "text-sm font-medium"}>
        {countdown}
      </span>
    </div>
  );
}

function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const min = parseInt(minutes, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${ampm}`;
  } catch {
    return timeString;
  }
}
