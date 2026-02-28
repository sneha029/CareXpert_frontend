// src/components/health-metrics/HealthMetricChart.tsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHealthMetricsStore } from "@/store/healthMetricsStore";
import { format } from "date-fns";
import type { MetricStatus } from "@/types";

interface HealthMetricChartProps {
  patientId: string;
  metricType: string;
  showNormalRange?: boolean;
}

const NORMAL_RANGES: Record<string, { min: number; max: number }> = {
  WEIGHT: { min: 50, max: 100 },
  HEIGHT: { min: 140, max: 200 },
  BMI: { min: 18.5, max: 24.9 },
  BLOOD_PRESSURE_SYSTOLIC: { min: 90, max: 120 },
  BLOOD_PRESSURE_DIASTOLIC: { min: 60, max: 80 },
  BLOOD_GLUCOSE_FASTING: { min: 70, max: 100 },
  BLOOD_GLUCOSE_RANDOM: { min: 70, max: 140 },
  BLOOD_GLUCOSE_POST_MEAL: { min: 70, max: 140 },
  TEMPERATURE: { min: 36.1, max: 37.2 },
  OXYGEN_SATURATION: { min: 95, max: 100 },
  HEART_RATE: { min: 60, max: 100 },
  RESPIRATORY_RATE: { min: 12, max: 20 },
  CHOLESTEROL_TOTAL: { min: 125, max: 200 },
  CHOLESTEROL_LDL: { min: 0, max: 100 },
  CHOLESTEROL_HDL: { min: 40, max: 100 },
  TRIGLYCERIDES: { min: 0, max: 150 },
  HBA1C: { min: 4, max: 5.7 },
};

const STATUS_COLORS: Record<MetricStatus, string> = {
  NORMAL: "#10b981",
  ABNORMAL: "#f59e0b",
  CRITICAL: "#ef4444",
};

export function HealthMetricChart({
  patientId,
  metricType,
  showNormalRange = true,
}: HealthMetricChartProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '180d' | '1y'>('30d');
  const { trends, fetchTrends, loading } = useHealthMetricsStore();

  useEffect(() => {
    fetchTrends(patientId, [metricType], period);
  }, [patientId, metricType, period, fetchTrends]);

  const trendData = trends[metricType];
  const normalRange = NORMAL_RANGES[metricType];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.dataPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trendData.dataPoints.map(point => ({
    date: format(new Date(point.date), 'MMM dd'),
    value: point.value,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>
          {metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Trend
        </CardTitle>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="180d">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {showNormalRange && normalRange ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="normalRange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <ReferenceLine
                  y={normalRange.max}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{ value: 'Max Normal', position: 'right' }}
                />
                <ReferenceLine
                  y={normalRange.min}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{ value: 'Min Normal', position: 'right' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="none"
                  fill="url(#normalRange)"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={(props: any) => (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={props.payload && props.payload.status ? STATUS_COLORS[props.payload.status as MetricStatus] : STATUS_COLORS.NORMAL}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={(props: any) => (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={props.payload && props.payload.status ? STATUS_COLORS[props.payload.status as MetricStatus] : STATUS_COLORS.NORMAL}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Average</p>
            <p className="font-semibold">{trendData.average.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Min</p>
            <p className="font-semibold">{trendData.min.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max</p>
            <p className="font-semibold">{trendData.max.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
