// src/lib/healthMetricUtils.ts
import type { MetricStatus } from "@/types";

// Normal ranges for health metrics
const NORMAL_RANGES: Record<string, { min: number; max: number; critical?: { min: number; max: number } }> = {
  WEIGHT: { min: 40, max: 150 },
  HEIGHT: { min: 140, max: 220 },
  BMI: { min: 18.5, max: 24.9, critical: { min: 16, max: 35 } },
  BLOOD_PRESSURE_SYSTOLIC: { min: 90, max: 120, critical: { min: 70, max: 180 } },
  BLOOD_PRESSURE_DIASTOLIC: { min: 60, max: 80, critical: { min: 40, max: 120 } },
  BLOOD_GLUCOSE_FASTING: { min: 70, max: 100, critical: { min: 54, max: 200 } },
  BLOOD_GLUCOSE_RANDOM: { min: 70, max: 140, critical: { min: 54, max: 250 } },
  BLOOD_GLUCOSE_POST_MEAL: { min: 70, max: 140, critical: { min: 54, max: 250 } },
  TEMPERATURE: { min: 36.1, max: 37.2, critical: { min: 35, max: 39.5 } },
  OXYGEN_SATURATION: { min: 95, max: 100, critical: { min: 85, max: 100 } },
  HEART_RATE: { min: 60, max: 100, critical: { min: 40, max: 150 } },
  RESPIRATORY_RATE: { min: 12, max: 20, critical: { min: 8, max: 30 } },
  CHOLESTEROL_TOTAL: { min: 125, max: 200, critical: { min: 0, max: 300 } },
  CHOLESTEROL_LDL: { min: 0, max: 100, critical: { min: 0, max: 190 } },
  CHOLESTEROL_HDL: { min: 40, max: 100 },
  TRIGLYCERIDES: { min: 0, max: 150, critical: { min: 0, max: 500 } },
  HBA1C: { min: 4, max: 5.7, critical: { min: 0, max: 10 } },
};

/**
 * Calculate the status of a health metric based on its type and value
 * @param metricType - The type of metric (e.g., 'BLOOD_PRESSURE_SYSTOLIC')
 * @param value - The metric value
 * @returns The status: 'NORMAL', 'ABNORMAL', or 'CRITICAL'
 */
export function getMetricStatus(metricType: string, value: number): MetricStatus {
  const range = NORMAL_RANGES[metricType];
  
  if (!range) {
    // If no range defined, consider it normal
    return 'NORMAL';
  }

  // Check critical range first if defined
  if (range.critical) {
    if (value < range.critical.min || value > range.critical.max) {
      return 'CRITICAL';
    }
  }

  // Check normal range
  if (value < range.min || value > range.max) {
    // If it's outside normal but within critical (or no critical defined), it's abnormal
    return 'ABNORMAL';
  }

  return 'NORMAL';
}

/**
 * Check if a metric value is abnormal
 * @param metricType - The type of metric
 * @param value - The metric value
 * @returns true if the value is abnormal or critical
 */
export function isMetricAbnormal(metricType: string, value: number): boolean {
  const status = getMetricStatus(metricType, value);
  return status === 'ABNORMAL' || status === 'CRITICAL';
}

/**
 * Get the normal range for a metric type
 * @param metricType - The type of metric
 * @returns The normal range or undefined if not defined
 */
export function getNormalRange(metricType: string): { min: number; max: number } | undefined {
  return NORMAL_RANGES[metricType];
}
