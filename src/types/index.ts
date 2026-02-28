// src/types/index.ts
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: UserRole;
}

export interface Doctor {
  id: string;
  userId: string;
  specialty: string;
  clinicLocation: string;
  experience: string;
  education?: string;
  bio?: string;
  languages: string[];
  consultationFee?: number;
  user: User;
}

export interface Appointment {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  appointmentType: 'ONLINE' | 'OFFLINE';
  date: string;
  time: string;
  notes?: string;
  consultationFee?: number;
  createdAt: string;
  updatedAt?: string;
  prescriptionId?: string | null;
  patient?: User; // Depending on if you're fetching from Doctor or Patient side
  doctor?: Doctor;
}
export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  distanceValue?: number; // Distance in meters for sorting
  rating: number;
  phone: string;
  hours: string;
  openTime?: string;
  closeTime?: string;
  isOpen: boolean;
  services?: string[];
  latitude?: number;
  longitude?: number;
}
export interface BlockedDate {
  id: string;
  doctorId: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  isFullDay: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Health Metrics Types
export type MetricStatus = 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface PatientHealthMetric {
  id: string;
  patientId: string;
  metricType: string;
  value: number;
  unit: string;
  isAbnormal: boolean;
  notes?: string;
  recordedAt: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
  recordedByUser?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface MetricFilters {
  metricType?: string;
  startDate?: string;
  endDate?: string;
  abnormalOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface MetricsResponse {
  success: boolean;
  data: {
    metrics: PatientHealthMetric[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface LatestMetrics {
  [metricType: string]: PatientHealthMetric;
}

export interface TrendData {
  metricType: string;
  trend: TrendDirection;
  percentageChange: number;
  average: number;
  min: number;
  max: number;
  latest: number;
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
}

export interface MetricAlert {
  id: string;
  patientId: string;
  metricType: string;
  value: number;
  unit: string;
  notes?: string;
  recordedAt: string;
  recordedBy?: string;
  isAbnormal: boolean;
  createdAt: string;
  updatedAt: string;
  recordedByUser?: {
    id: string;
    name: string;
    role: string;
  };
  severity: 'normal' | 'abnormal' | 'critical';
}

export interface NewMetric {
  metricType: string;
  value: number;
  unit: string;
  notes?: string;
  recordedAt?: string;
}
export interface PrescriptionTemplate {
  id: string;
  doctorId: string;
  name: string;
  description?: string | null;
  prescriptionText: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}