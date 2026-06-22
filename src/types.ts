export type DoctorCategory = 'Super Core' | 'Core' | 'Regular';

export type VisitStatus = 'Planned' | 'Completed' | 'Missed' | 'Rescheduled' | 'Doctor Unavailable' | 'Clinic Closed';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  territory: string;
  zone: string;
  category: DoctorCategory;
  desiredFrequency: number; // monthly target frequency, e.g., 1, 2, 3
  maxAllowedFrequency: number;
  visitDays: string[]; // ['Monday', 'Friday']
  visitTimings: string; // '09:00 - 11:00' or similar
  appointmentRequired: boolean;
  priorityScore: number; // 1 to 10
  successRate: number; // 0 to 1 decimal percentage
  lastVisitDate?: string;
  lat: number;
  lng: number;
  address: string;
}

export interface Visit {
  id: string;
  doctorId: string;
  doctorName?: string; // compiled client-side or joined on server
  specialty?: string;
  category?: DoctorCategory;
  plannedDate: string; // 'YYYY-MM-DD'
  actualArrival?: string; // HH:MM
  status: VisitStatus;
  notes?: string;
  missedReason?: 'Representative Delayed' | 'Doctor Unavailable' | 'Clinic Closed' | 'Emergency' | 'Patient Volume High' | 'None';
  rescheduledToId?: string; // links to another visit if rescheduled
  lat?: number;
  lng?: number; // check-in location
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  geoTag?: string;
}

export interface TerritoryMetrics {
  totalVisitsRequired: number;
  completed: number;
  missed: number;
  rescheduled: number;
  pending: number;
  achievementRate: number; // 0 - 100
  daysRemaining: number;
  byCategory: {
    'Super Core': { required: number; completed: number; rate: number };
    'Core': { required: number; completed: number; rate: number };
    'Regular': { required: number; completed: number; rate: number };
  };
}

export interface RouteStop {
  stopNumber: number;
  visitId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  category: DoctorCategory;
  estimatedArrival: string;
  durationMs: number;
  address: string;
  lat: number;
  lng: number;
  priority: number;
  appointmentRequired: boolean;
  status: VisitStatus;
}

export type UserRole = 'Medical Representative' | 'Area Manager' | 'Regional Manager' | 'National Sales Manager' | 'Admin';

export interface RolePermissions {
  canViewSelfOnly: boolean;
  canViewTeam: boolean;
  canApproveLeaves: boolean;
  canEditDoctorMaster: boolean;
  canReallocateTerritories: boolean;
}
