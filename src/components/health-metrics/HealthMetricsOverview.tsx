// src/components/health-metrics/HealthMetricsOverview.tsx
import { useEffect, useState } from "react";
import { useHealthMetricsStore } from "@/store/healthMetricsStore";
import { MetricCard } from "./MetricCard";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { AddHealthMetricModal } from "./AddHealthMetricModal";

interface HealthMetricsOverviewProps {
  patientId: string;
  editable?: boolean;
}

export function HealthMetricsOverview({
  patientId,
  editable = true,
}: HealthMetricsOverviewProps) {
  const { latestMetrics, loading, fetchLatestMetrics } = useHealthMetricsStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<string>();

  useEffect(() => {
    fetchLatestMetrics(patientId);
  }, [patientId, fetchLatestMetrics]);

  const handleRefresh = () => {
    fetchLatestMetrics(patientId);
  };

  const metricsArray = Object.values(latestMetrics);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (metricsArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-muted-foreground">No health metrics recorded yet</p>
        {editable && (
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Metric
          </Button>
        )}
        <AddHealthMetricModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          patientId={patientId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Latest Health Metrics</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {editable && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedMetricType(undefined);
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Metric
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metricsArray.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            onClick={() => {
              // Navigate to detailed view (to be implemented)
              console.log('View details for:', metric);
            }}
          />
        ))}
      </div>

      <AddHealthMetricModal
        open={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedMetricType(undefined);
        }}
        patientId={patientId}
        metricType={selectedMetricType}
      />
    </div>
  );
}
