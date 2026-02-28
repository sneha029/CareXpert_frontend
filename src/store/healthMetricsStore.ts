// src/store/healthMetricsStore.ts
import { create } from "zustand";
import { healthMetricsAPI } from "@/lib/services";
import { useAuthStore } from "@/store/authstore";
import type {
  PatientHealthMetric,
  LatestMetrics,
  TrendData,
  MetricAlert,
  MetricFilters,
  NewMetric,
} from "@/types";
import { notify } from "@/lib/toast";

interface HealthMetricsState {
  metrics: PatientHealthMetric[];
  latestMetrics: LatestMetrics;
  alerts: MetricAlert[];
  trends: Record<string, TrendData>;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMetrics: (patientId: string, filters?: MetricFilters) => Promise<void>;
  fetchLatestMetrics: (patientId: string) => Promise<void>;
  fetchTrends: (patientId: string, metricTypes: string[], period: '7d' | '30d' | '90d' | '180d' | '1y') => Promise<void>;
  fetchAlerts: (patientId: string) => Promise<void>;
  addMetric: (patientId: string, data: NewMetric) => Promise<void>;
  updateMetric: (patientId: string, metricId: string, data: Partial<NewMetric>) => Promise<void>;
  deleteMetric: (patientId: string, metricId: string) => Promise<void>;
  clearMetrics: () => void;
}

export const useHealthMetricsStore = create<HealthMetricsState>((set, get) => ({
  metrics: [],
  latestMetrics: {},
  alerts: [],
  trends: {},
  loading: false,
  error: null,

  fetchMetrics: async (patientId: string, filters?: MetricFilters) => {
    set({ loading: true, error: null });
    try {
      const response = await healthMetricsAPI.getMetrics(patientId, filters);
      set({ 
        metrics: response.data.metrics,
        loading: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch metrics";
      set({ error: message, loading: false });
      notify.error(message);
    }
  },

  fetchLatestMetrics: async (patientId: string) => {
    set({ loading: true, error: null });
    try {
      const latestMetrics = await healthMetricsAPI.getLatestMetrics(patientId);
      set({ 
        latestMetrics,
        loading: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch latest metrics";
      set({ error: message, loading: false });
      notify.error(message);
    }
  },

  fetchTrends: async (patientId: string, metricTypes: string[], period: '7d' | '30d' | '90d' | '180d' | '1y') => {
    set({ loading: true, error: null });
    try {
      const trendsData = await healthMetricsAPI.getTrends(patientId, { metricTypes, period });
      set(state => ({
        trends: {
          ...state.trends,
          ...trendsData
        },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch trends";
      set({ error: message, loading: false });
      notify.error(message);
    }
  },

  fetchAlerts: async (patientId: string) => {
    try {
      const alerts = await healthMetricsAPI.getAlerts(patientId);
      set({ alerts });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch alerts";
      notify.error(message);
    }
  },

  addMetric: async (patientId: string, data: NewMetric) => {
    set({ loading: true, error: null });
    try {
      const newMetric = await healthMetricsAPI.createMetric(patientId, data);
      set(state => ({
        metrics: [newMetric, ...state.metrics],
        latestMetrics: {
          ...state.latestMetrics,
          [newMetric.metricType]: newMetric
        },
        loading: false
      }));
      notify.success("Health metric added successfully");
      
      // Refresh alerts (only for doctors)
      const { user } = useAuthStore.getState();
      if (user?.role === 'DOCTOR') {
        get().fetchAlerts(patientId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add metric";
      set({ error: message, loading: false });
      notify.error(message);
      throw error;
    }
  },

  updateMetric: async (patientId: string, metricId: string, data: Partial<NewMetric>) => {
    set({ loading: true, error: null });
    try {
      const updatedMetric = await healthMetricsAPI.updateMetric(patientId, metricId, data);
      set(state => ({
        metrics: state.metrics.map(m => m.id === metricId ? updatedMetric : m),
        latestMetrics: {
          ...state.latestMetrics,
          [updatedMetric.metricType]: updatedMetric
        },
        loading: false
      }));
      notify.success("Health metric updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update metric";
      set({ error: message, loading: false });
      notify.error(message);
      throw error;
    }
  },

  deleteMetric: async (patientId: string, metricId: string) => {
    set({ loading: true, error: null });
    try {
      await healthMetricsAPI.deleteMetric(patientId, metricId);
      set(state => ({
        metrics: state.metrics.filter(m => m.id !== metricId),
        loading: false
      }));
      notify.success("Health metric deleted successfully");
      
      // Refresh latest metrics and alerts
      get().fetchLatestMetrics(patientId);
      
      // Refresh alerts (only for doctors)
      const { user } = useAuthStore.getState();
      if (user?.role === 'DOCTOR') {
        get().fetchAlerts(patientId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete metric";
      set({ error: message, loading: false });
      notify.error(message);
      throw error;
    }
  },

  clearMetrics: () => {
    set({
      metrics: [],
      latestMetrics: {},
      alerts: [],
      trends: {},
      loading: false,
      error: null
    });
  }
}));
