// src/services/patientService.ts
import { api } from "@/lib/api";

export interface AuthenticatedProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  patient?: {
    id: string;
  };
  doctor?: {
    id: string;
    specialty: string;
    clinicLocation: string;
  };
}

export const patientService = {
  /**
   * Get the authenticated user's profile including patient/doctor ID
   */
  async getAuthenticatedProfile(): Promise<AuthenticatedProfile> {
    const response = await api.get('/user/authenticated-profile');
    return response.data.data;
  },

  /**
   * Get patient ID for the authenticated user
   * Returns null if user is not a patient
   */
  async getPatientId(): Promise<string | null> {
    const profile = await this.getAuthenticatedProfile();
    return profile.patient?.id || null;
  },
};
