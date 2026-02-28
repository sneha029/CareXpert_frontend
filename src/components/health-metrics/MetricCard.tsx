// src/components/health-metrics/MetricCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Heart, 
  Droplet, 
  Thermometer, 
  Wind, 
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle
} from "lucide-react";
import type { PatientHealthMetric, TrendDirection, MetricStatus } from "@/types";
import { getMetricStatus } from "@/lib/healthMetricUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: PatientHealthMetric;
  trend?: TrendDirection;
  onClick?: () => void;
}

const METRIC_ICONS: Record<string, React.ElementType> = {
  'WEIGHT': Scale,
  'HEIGHT': Scale,
  'BLOOD_PRESSURE_SYSTOLIC': Heart,
  'BLOOD_PRESSURE_DIASTOLIC': Heart,
  'BLOOD_GLUCOSE_FASTING': Droplet,
  'BLOOD_GLUCOSE_RANDOM': Droplet,
  'BLOOD_GLUCOSE_POST_MEAL': Droplet,
  'TEMPERATURE': Thermometer,
  'OXYGEN_SATURATION': Wind,
  'HEART_RATE': Activity,
  'RESPIRATORY_RATE': Wind,
  'CHOLESTEROL_TOTAL': Droplet,
  'CHOLESTEROL_LDL': Droplet,
  'CHOLESTEROL_HDL': Droplet,
  'TRIGLYCERIDES': Droplet,
  'HBA1C': Droplet,
  'BMI': Scale,
};

const STATUS_COLORS: Record<MetricStatus, {
  badge: string;
  border: string;
  icon: string;
}> = {
  NORMAL: {
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
  },
  ABNORMAL: {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    icon: "text-orange-600 dark:text-orange-400",
  },
  CRITICAL: {
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
  },
};

export function MetricCard({ metric, trend, onClick }: MetricCardProps) {
  const Icon = METRIC_ICONS[metric.metricType] || Activity;
  
  // Calculate status from metric type and value
  const status = getMetricStatus(metric.metricType, metric.value);
  const colors = STATUS_COLORS[status];
  
  const TrendIcon = trend === 'up' ? TrendingUp : 
                    trend === 'down' ? TrendingDown : 
                    Minus;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        colors.border,
        status === 'CRITICAL' && "animate-pulse"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {metric.metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </CardTitle>
        <Icon className={cn("h-4 w-4", colors.icon)} />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-sm text-muted-foreground">{metric.unit}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={colors.badge}>
                {status === 'CRITICAL' && <AlertCircle className="w-3 h-3 mr-1" />}
                {status}
              </Badge>
              {trend && (
                <TrendIcon className={cn(
                  "h-4 w-4",
                  trend === 'up' ? "text-red-500" :
                  trend === 'down' ? "text-blue-500" :
                  "text-gray-500"
                )} />
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {format(new Date(metric.recordedAt), 'PPp')}
        </p>
        {metric.notes && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {metric.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
