// src/types/index.ts
export type { JobCategory, DeadlinePerformance, PartsUsed, FixAttempt, AcceptanceSpeed, MultiplierTier } from "@/lib/scoring";

export interface TechnicianRow {
  id: string;
  name: string;
  employeeId: string;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface JobRow {
  id: string;
  jobNumber: string;
  technicianId: string;
  technician: { name: string; employeeId: string };
  category: string;
  description?: string | null;
  assignedAt: string;
  deadlineAt: string;
  completedAt?: string | null;
  deadlinePerformance?: string | null;
  partsUsed?: string | null;
  fixAttempt?: string | null;
  acceptanceSpeed?: string | null;
  partsOrdered?: number | null;
  partsActuallyUsed?: number | null;
  isReopened: boolean;
  totalJobPoints: number;
  managerOverride: boolean;
  overridePoints?: number | null;
  overrideReason?: string | null;
  month: number;
  year: number;
}

export interface MonthSummaryRow {
  id: string;
  technicianId: string;
  technician: { name: string; employeeId: string };
  month: number;
  year: number;
  totalJobsDone: number;
  grossPoints: number;
  totalDeductions: number;
  netPoints: number;
  multiplierTier: string;
  multiplier: number;
  ratePerPoint: number;
  incentiveAmount: number;
  isApproved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  notes?: string | null;
}
