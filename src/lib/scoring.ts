// src/lib/scoring.ts
// ⭐ Core scoring engine — every point value here is taken directly from
// "Servyn AI — Technician Incentive Point System" (v1 PDF). No DB calls.

export type JobCategory = "A" | "B" | "C";
export type DeadlinePerformance = "MET" | "EARLY_30" | "EARLY_50" | "EARLY_70" | "MISSED";
export type PartsUsed = "LOW" | "MEDIUM" | "HIGH";
export type FixAttempt = "FIRST_TIME" | "REWORK_1" | "REWORK_2";
export type AcceptanceSpeed = "FAST" | "MEDIUM" | "SLOW";
export type MultiplierTier = "NO_INCENTIVE" | "STANDARD" | "HIGH_PERFORMER" | "STAR_PERFORMER";

// ---------------------------------------------------------------------------
// 1. Deadline performance (PDF page 1–2)
// Meeting the deadline earns a base amount; finishing early adds a bonus ON
// TOP of that base. Missing the deadline replaces the base with a penalty.
// ---------------------------------------------------------------------------
const DEADLINE_BASE: Record<JobCategory, number> = { A: 30, B: 20, C: 12 };

const DEADLINE_BONUS: Record<Exclude<DeadlinePerformance, "MISSED">, Record<JobCategory, number>> = {
  MET:      { A: 0,  B: 0,  C: 0 },
  EARLY_30: { A: 6,  B: 4,  C: 2 },
  EARLY_50: { A: 12, B: 8,  C: 5 },
  EARLY_70: { A: 20, B: 12, C: 8 },
};

const DEADLINE_MISSED: Record<JobCategory, number> = { A: -20, B: -12, C: -6 };

// ---------------------------------------------------------------------------
// 2. Components used — low cost parts score highest (rewards smart diagnosis)
// ---------------------------------------------------------------------------
const PARTS_POINTS: Record<PartsUsed, Record<JobCategory, number>> = {
  LOW:    { A: 20, B: 14, C: 8 },
  MEDIUM: { A: 12, B: 8,  C: 4 },
  HIGH:   { A: 5,  B: 3,  C: 1 }, // never negative — "no parts penalty" guardrail
};

// ---------------------------------------------------------------------------
// 3. Fix attempt
// ---------------------------------------------------------------------------
const FIX_POINTS: Record<FixAttempt, Record<JobCategory, number>> = {
  FIRST_TIME: { A: 25, B: 16, C: 10 },
  REWORK_1:   { A: 8,  B: 5,  C: 3 },
  REWORK_2:   { A: 0,  B: 0,  C: 0 }, // zero, not a deduction — see PDF note
};

// ---------------------------------------------------------------------------
// 4. Job acceptance speed (flat, not category dependent)
// ---------------------------------------------------------------------------
const ACCEPTANCE_POINTS: Record<AcceptanceSpeed, number> = {
  FAST: 10,
  MEDIUM: 5,
  SLOW: 0,
};

// ---------------------------------------------------------------------------
// Additional auto-tracked parameters
// ---------------------------------------------------------------------------
const VOLUME_BONUS_PER_EXTRA_JOB = 5; // after the 3rd job/day
const VOLUME_BONUS_THRESHOLD = 3;     // jobs already done today before this one
const NO_WASTE_BONUS = 8;             // parts ordered === parts used
const REOPEN_PENALTY = -15;           // reopened within 72h

// ---------------------------------------------------------------------------
// Month-end multiplier tiers
// ---------------------------------------------------------------------------
const TIERS: { min: number; tier: MultiplierTier; multiplier: number }[] = [
  { min: 800, tier: "STAR_PERFORMER", multiplier: 1.5 },
  { min: 500, tier: "HIGH_PERFORMER", multiplier: 1.2 },
  { min: 200, tier: "STANDARD", multiplier: 1.0 },
  { min: 0,   tier: "NO_INCENTIVE", multiplier: 0 },
];

const MONTHLY_DEDUCTION_CAP_RATIO = 0.3; // deductions can't exceed 30% of gross

// ---------------------------------------------------------------------------
// scoreJob — per-job calculation
// ---------------------------------------------------------------------------
export interface ScoreJobInput {
  category: JobCategory;
  deadlinePerformance: DeadlinePerformance;
  partsUsed: PartsUsed;
  fixAttempt: FixAttempt;
  acceptanceSpeed: AcceptanceSpeed;
  partsOrdered: number;
  partsActuallyUsed: number;
  isReopened: boolean;
  jobsCompletedTodayBefore: number; // count of jobs this tech already logged today
  managerOverride?: number | null;  // if set, this value wins outright
}

export interface ScoreJobResult {
  deadlinePoints: number;
  deadlineBonusPoints: number;
  partsPoints: number;
  fixPoints: number;
  acceptancePoints: number;
  volumeBonusPoints: number;
  noWastePoints: number;
  reopenPenalty: number;
  rawTotal: number;        // sum of all components, before the floor rule
  totalJobPoints: number;  // after floor rule (never < 0), or manager override
  breakdown: string[];     // human-readable lines for UI preview
}

export function scoreJob(input: ScoreJobInput): ScoreJobResult {
  const {
    category,
    deadlinePerformance,
    partsUsed,
    fixAttempt,
    acceptanceSpeed,
    partsOrdered,
    partsActuallyUsed,
    isReopened,
    jobsCompletedTodayBefore,
    managerOverride,
  } = input;

  // 1. Deadline
  let deadlinePoints: number;
  let deadlineBonusPoints: number;
  if (deadlinePerformance === "MISSED") {
    deadlinePoints = DEADLINE_MISSED[category];
    deadlineBonusPoints = 0;
  } else {
    deadlinePoints = DEADLINE_BASE[category];
    deadlineBonusPoints = DEADLINE_BONUS[deadlinePerformance][category];
  }

  // 2. Parts used
  const partsPoints = PARTS_POINTS[partsUsed][category];

  // 3. Fix attempt
  const fixPoints = FIX_POINTS[fixAttempt][category];

  // 4. Acceptance speed
  const acceptancePoints = ACCEPTANCE_POINTS[acceptanceSpeed];

  // 5. Volume bonus — extra jobs after the 3rd one that day
  const volumeBonusPoints =
    jobsCompletedTodayBefore >= VOLUME_BONUS_THRESHOLD ? VOLUME_BONUS_PER_EXTRA_JOB : 0;

  // 6. No-waste bonus — parts ordered exactly matches parts used (and >0)
  const noWastePoints =
    partsOrdered > 0 && partsOrdered === partsActuallyUsed ? NO_WASTE_BONUS : 0;

  // 7. Reopen penalty
  const reopenPenalty = isReopened ? REOPEN_PENALTY : 0;

  const rawTotal =
    deadlinePoints +
    deadlineBonusPoints +
    partsPoints +
    fixPoints +
    acceptancePoints +
    volumeBonusPoints +
    noWastePoints +
    reopenPenalty;

  // Floor rule: a single job can never go below 0 — unless manager overrides
  const totalJobPoints =
    managerOverride !== null && managerOverride !== undefined
      ? managerOverride
      : Math.max(0, rawTotal);

  const breakdown: string[] = [
    `Deadline (${deadlinePerformance.replace("_", " ")}): ${deadlinePoints >= 0 ? "+" : ""}${deadlinePoints}`,
  ];
  if (deadlineBonusPoints !== 0) breakdown.push(`Early bonus: +${deadlineBonusPoints}`);
  breakdown.push(`Parts used (${partsUsed}): +${partsPoints}`);
  breakdown.push(`Fix attempt (${fixAttempt.replace("_", " ")}): +${fixPoints}`);
  breakdown.push(`Acceptance speed (${acceptanceSpeed}): +${acceptancePoints}`);
  if (volumeBonusPoints > 0) breakdown.push(`Volume bonus (4th+ job today): +${volumeBonusPoints}`);
  if (noWastePoints > 0) breakdown.push(`No unused parts: +${noWastePoints}`);
  if (reopenPenalty < 0) breakdown.push(`Reopened within 72h: −${Math.abs(reopenPenalty)}`);
  if (managerOverride !== null && managerOverride !== undefined) {
    breakdown.push(`Manager override → ${managerOverride}`);
  }

  return {
    deadlinePoints,
    deadlineBonusPoints,
    partsPoints,
    fixPoints,
    acceptancePoints,
    volumeBonusPoints,
    noWastePoints,
    reopenPenalty,
    rawTotal,
    totalJobPoints,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// rollupMonth — month-end aggregation for one technician
//
// Takes the stored per-job component fields (not just the floored total),
// because the 30%-deduction-cap guardrail needs to know the *actual* size of
// deductions earned during the month, independent of the per-job floor.
// ---------------------------------------------------------------------------
export interface RollupJobInput {
  totalJobPoints: number;
  deadlinePoints: number;
  reopenPenalty: number;
  managerOverride?: boolean;
  overridePoints?: number | null;
}

export interface RollupMonthResult {
  grossPoints: number;
  totalDeductions: number; // after the 30% cap has been applied
  netPoints: number;
  tier: MultiplierTier;
  multiplier: number;
  incentiveAmount: number;
}

export function rollupMonth(
  jobs: RollupJobInput[],
  ratePerPoint: number
): RollupMonthResult {
  let grossPoints = 0;
  let rawDeductions = 0;

  for (const job of jobs) {
    if (job.managerOverride && job.overridePoints !== null && job.overridePoints !== undefined) {
      // Manager-overridden jobs count straight toward gross, no deduction split
      grossPoints += job.overridePoints;
      continue;
    }
    // Positive contribution to gross = anything above 0 from deadline points,
    // plus everything else that's already baked into totalJobPoints (which
    // only ever holds the *floored* value). To recover true deductions we
    // look at the components that can go negative: deadlinePoints (MISSED)
    // and reopenPenalty.
    const deadlineDeduction = job.deadlinePoints < 0 ? Math.abs(job.deadlinePoints) : 0;
    const reopenDeduction = job.reopenPenalty < 0 ? Math.abs(job.reopenPenalty) : 0;
    const jobDeductions = deadlineDeduction + reopenDeduction;

    // Gross = the job's floored total + the deductions it absorbed, i.e. what
    // it would have scored before penalties were netted out.
    grossPoints += job.totalJobPoints + jobDeductions;
    rawDeductions += jobDeductions;
  }

  const deductionCap = Math.round(grossPoints * MONTHLY_DEDUCTION_CAP_RATIO);
  const totalDeductions = Math.min(rawDeductions, deductionCap);
  const netPoints = Math.max(0, grossPoints - totalDeductions);

  const { tier, multiplier } = TIERS.find((t) => netPoints >= t.min)!;
  const incentiveAmount = tier === "NO_INCENTIVE" ? 0 : netPoints * ratePerPoint * multiplier;

  return { grossPoints, totalDeductions, netPoints, tier, multiplier, incentiveAmount };
}