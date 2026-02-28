// src/services/healthMetricsService.ts
import { api } from "@/lib/api";
import type {
  PatientHealthMetric,
  MetricFilters,
  MetricsResponse,
  LatestMetrics,
  TrendData,
  MetricAlert,
  NewMetric,
} from "@/types";

interface QueryParams extends MetricFilters {
  period?: '7d' | '30d' | '90d' | '180d' | '1y';
}

interface TrendParams {
  metricTypes: string[];
  period: '7d' | '30d' | '90d' | '180d' | '1y';
}

export const healthMetricsService = {
  /**
   * Get all health metrics for a patient with optional filters
   */
  async getMetrics(
    patientId: string,
    params?: QueryParams
  ): Promise<MetricsResponse> {
    const response = await api.get(
      `/patient/${patientId}/health-metrics`,
      { params }
    );
    return response.data;
  },

  /**
   * Get the latest reading for each metric type
   */
  async getLatestMetrics(patientId: string): Promise<LatestMetrics> {
    const response = await api.get(
      `/patient/${patientId}/health-metrics/latest`
    );
    return response.data.data;
  },

  /**
   * Get trend data for a specific metric type
   */
  async getTrends(
    patientId: string,
    params: TrendParams
  ): Promise<Record<string, TrendData>> {
    const response = await api.get(
      `/patient/${patientId}/health-metrics/trends`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get alerts for abnormal metrics
   */
  async getAlerts(patientId: string): Promise<MetricAlert[]> {
    const response = await api.get(
      `/patient/${patientId}/health-metrics/alerts`
    );
    return response.data.data;
  },

  /**
   * Create a new health metric
   */
  async createMetric(
    patientId: string,
    data: NewMetric
  ): Promise<PatientHealthMetric> {
    const response = await api.post(
      `/patient/${patientId}/health-metrics`,
      data
    );
    return response.data.data;
  },

  /**
   * Update an existing health metric
   */
  async updateMetric(
    patientId: string,
    metricId: string,
    data: Partial<NewMetric>
  ): Promise<PatientHealthMetric> {
    const response = await api.put(
      `/patient/${patientId}/health-metrics/${metricId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a health metric
   */
  async deleteMetric(
    patientId: string,
    metricId: string
  ): Promise<void> {
    await api.delete(
      `/patient/${patientId}/health-metrics/${metricId}`
    );
  },

  /**
   * Get metric history for a specific type
   */
  async getMetricHistory(
    patientId: string,
    metricType: string,
    params?: QueryParams
  ): Promise<MetricsResponse> {
    const response = await api.get(
      `/patient/${patientId}/health-metrics`,
      {
        params: {
          ...params,
          metricType,
        },
      }
    );
    return response.data;
  },
};
