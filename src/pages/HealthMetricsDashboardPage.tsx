// src/pages/HealthMetricsDashboardPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { HealthMetricsOverview } from "@/components/health-metrics/HealthMetricsOverview";
import { HealthMetricChart } from "@/components/health-metrics/HealthMetricChart";
import { MetricAlerts } from "@/components/health-metrics/MetricAlerts";
import { HealthMetricsTable } from "@/components/health-metrics/HealthMetricsTable";
import { useHealthMetricsStore } from "@/store/healthMetricsStore";
import { useAuthStore } from "@/store/authstore";

export default function HealthMetricsDashboardPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clearMetrics } = useHealthMetricsStore();

  useEffect(() => {
    // Clear metrics when leaving the page
    return () => {
      clearMetrics();
    };
  }, [clearMetrics]);

  if (!patientId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Patient ID</CardTitle>
            <CardDescription>
              Please select a valid patient to view their health metrics.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isDoctor = user?.role === 'DOCTOR';
  const editable = isDoctor;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Health Metrics</h1>
            <p className="text-muted-foreground">
              Track and monitor patient health measurements
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <MetricAlerts patientId={patientId} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <HealthMetricsOverview patientId={patientId} editable={editable} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Metric Trends</CardTitle>
              <CardDescription>
                Visualize how health metrics have changed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <HealthMetricChart
                patientId={patientId}
                metricType="BLOOD_PRESSURE_SYSTOLIC"
                showNormalRange
              />
              <HealthMetricChart
                patientId={patientId}
                metricType="BLOOD_GLUCOSE_FASTING"
                showNormalRange
              />
              <HealthMetricChart
                patientId={patientId}
                metricType="WEIGHT"
                showNormalRange
              />
              <HealthMetricChart
                patientId={patientId}
                metricType="HEART_RATE"
                showNormalRange
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metric History</CardTitle>
              <CardDescription>
                Complete history of all recorded health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HealthMetricsTable patientId={patientId} editable={editable} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
