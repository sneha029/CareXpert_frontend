// src/components/health-metrics/MetricAlerts.tsx
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, X } from "lucide-react";
import { useHealthMetricsStore } from "@/store/healthMetricsStore";
import { useAuthStore } from "@/store/authstore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MetricAlertsProps {
  patientId: string;
  compact?: boolean;
}

export function MetricAlerts({ patientId, compact = false }: MetricAlertsProps) {
  const { alerts, fetchAlerts } = useHealthMetricsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Only doctors and admins can access alerts endpoint
    if (user?.role === 'DOCTOR' || user?.role === 'ADMIN') {
      fetchAlerts(patientId);
    }
  }, [patientId, fetchAlerts, user?.role]);

  // Backend returns all abnormal metrics, no need to filter by dismissed
  const activeAlerts = alerts;

  if (activeAlerts.length === 0) {
    return null;
  }

  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = activeAlerts.filter(a => a.severity === 'abnormal');

  if (compact) {
    return (
      <div className="space-y-2">
        {criticalAlerts.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical Readings</AlertTitle>
            <AlertDescription>
              {criticalAlerts.length} critical health metric{criticalAlerts.length > 1 ? 's' : ''} require immediate attention
            </AlertDescription>
          </Alert>
        )}
        {warningAlerts.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle>Abnormal Readings</AlertTitle>
            <AlertDescription className="text-orange-600 dark:text-orange-400">
              {warningAlerts.length} abnormal health metric{warningAlerts.length > 1 ? 's' : ''} detected
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Health Alerts</h3>
        <div className="flex gap-2">
          {criticalAlerts.length > 0 && (
            <Badge variant="destructive">
              {criticalAlerts.length} Critical
            </Badge>
          )}
          {warningAlerts.length > 0 && (
            <Badge className="bg-orange-500 hover:bg-orange-600">
              {warningAlerts.length} Warning
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {activeAlerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.severity === 'critical' ? 'destructive' : 'default'}
            className={cn(
              alert.severity === 'abnormal' && 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
            )}
          >
            {alert.severity === 'critical' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            <div className="flex-1">
              <AlertTitle className="flex items-center justify-between">
                <span>
                  {alert.metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="text-sm font-normal">
                  {format(new Date(alert.recordedAt), 'PPp')}
                </span>
              </AlertTitle>
              <AlertDescription className={cn(
                alert.severity === 'abnormal' && 'text-orange-600 dark:text-orange-400'
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">
                      {alert.value} {alert.unit}
                    </span>
                    {' - '}
                    {alert.severity === 'critical' ? 'Critical reading detected' : 'Abnormal reading detected'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      // TODO: Implement dismiss functionality
                      console.log('Dismiss alert:', alert.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {alert.notes && (
                  <p className="mt-1 text-xs">{alert.notes}</p>
                )}
              </AlertDescription>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
}
