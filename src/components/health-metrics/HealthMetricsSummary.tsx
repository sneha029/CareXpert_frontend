// src/components/health-metrics/HealthMetricsSummary.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight } from "lucide-react";
import { useHealthMetricsStore } from "@/store/healthMetricsStore";
import { useAuthStore } from "@/store/authstore";
import { getMetricStatus } from "@/lib/healthMetricUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { MetricStatus } from "@/types";

interface HealthMetricsSummaryProps {
  patientId: string;
  maxItems?: number;
}

const STATUS_COLORS: Record<MetricStatus, string> = {
  NORMAL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  ABNORMAL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function HealthMetricsSummary({ patientId, maxItems = 4 }: HealthMetricsSummaryProps) {
  const navigate = useNavigate();
  const { latestMetrics, alerts, fetchLatestMetrics, fetchAlerts } = useHealthMetricsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchLatestMetrics(patientId);
    // Only doctors and admins can access alerts endpoint
    if (user?.role === 'DOCTOR' || user?.role === 'ADMIN') {
      fetchAlerts(patientId);
    }
  }, [patientId, fetchLatestMetrics, fetchAlerts, user?.role]);

  const metricsArray = Object.values(latestMetrics).slice(0, maxItems);
  const activeAlerts = alerts; // Backend only returns abnormal metrics
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  const handleViewAll = () => {
    navigate(`/patient/${patientId}/health-metrics`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Metrics
          </CardTitle>
          <CardDescription>Latest health measurements</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={handleViewAll}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {metricsArray.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No health metrics recorded yet</p>
            <Button
              variant="link"
              onClick={handleViewAll}
              className="mt-2"
            >
              Add First Metric
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Alerts Summary */}
            {activeAlerts.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                {criticalAlerts.length > 0 ? (
                  <Badge variant="destructive">
                    {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
                  </Badge>
                ) : (
                  <Badge className="bg-orange-500">
                    {activeAlerts.length} Alert{activeAlerts.length > 1 ? 's' : ''}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Abnormal readings detected
                </span>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {metricsArray.map((metric) => {
                const status: MetricStatus = getMetricStatus(metric.metricType, metric.value);
                return (
                  <div
                    key={metric.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      status === 'CRITICAL' && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
                      status === 'ABNORMAL' && "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20",
                      status === 'NORMAL' && "border-border bg-muted/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          {metric.metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-bold">{metric.value}</span>
                          <span className="text-xs text-muted-foreground">{metric.unit}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(metric.recordedAt), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", STATUS_COLORS[status])}
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(latestMetrics).length > maxItems && (
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={handleViewAll}
              >
                View {Object.keys(latestMetrics).length - maxItems} More Metric{Object.keys(latestMetrics).length - maxItems > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
