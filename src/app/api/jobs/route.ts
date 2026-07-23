// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreJob } from "@/lib/scoring";
import type { JobCategory, DeadlinePerformance, PartsUsed, FixAttempt, AcceptanceSpeed } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const technicianId = searchParams.get("technicianId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Record<string, unknown> = {};
  if (technicianId) where.technicianId = technicianId;
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);

  const jobs = await prisma.job.findMany({
    where,
    include: { technician: { select: { name: true, employeeId: true } } },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    jobNumber,
    technicianId,
    category,
    description,
    assignedAt,
    deadlineAt,
    completedAt,
    deadlinePerformance,
    partsUsed,
    fixAttempt,
    acceptanceSpeed,
    partsOrdered,
    partsActuallyUsed,
    isReopened,
    managerOverride,
    overridePoints,
    overrideReason,
  } = body;

  const assignedDate = new Date(assignedAt);
  const month = assignedDate.getMonth() + 1;
  const year = assignedDate.getFullYear();

  // Count jobs completed today by this technician (for volume bonus)
  const dayStart = new Date(assignedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(assignedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const jobsTodayCount = await prisma.job.count({
    where: {
      technicianId,
      assignedAt: { gte: dayStart, lte: dayEnd },
    },
  });

  const score = scoreJob({
    category: category as JobCategory,
    deadlinePerformance: deadlinePerformance as DeadlinePerformance,
    partsUsed: partsUsed as PartsUsed,
    fixAttempt: fixAttempt as FixAttempt,
    acceptanceSpeed: acceptanceSpeed as AcceptanceSpeed,
    partsOrdered: parseInt(partsOrdered) || 0,
    partsActuallyUsed: parseInt(partsActuallyUsed) || 0,
    isReopened: isReopened || false,
    jobsCompletedTodayBefore: jobsTodayCount,
    managerOverride: managerOverride ? parseInt(overridePoints) : null,
  });

  const job = await prisma.job.create({
    data: {
      jobNumber,
      technicianId,
      category,
      description,
      assignedAt: new Date(assignedAt),
      deadlineAt: new Date(deadlineAt),
      completedAt: completedAt ? new Date(completedAt) : null,
      deadlinePerformance,
      partsUsed,
      fixAttempt,
      acceptanceSpeed,
      partsOrdered: parseInt(partsOrdered) || 0,
      partsActuallyUsed: parseInt(partsActuallyUsed) || 0,
      isReopened: isReopened || false,
      deadlinePoints: score.deadlinePoints,
      deadlineBonusPoints: score.deadlineBonusPoints,
      partsPoints: score.partsPoints,
      fixPoints: score.fixPoints,
      acceptancePoints: score.acceptancePoints,
      volumeBonusPoints: score.volumeBonusPoints,
      noWastePoints: score.noWastePoints,
      reopenPenalty: score.reopenPenalty,
      totalJobPoints: score.totalJobPoints,
      managerOverride: managerOverride || false,
      overridePoints: managerOverride ? parseInt(overridePoints) : null,
      overrideReason: managerOverride ? overrideReason : null,
      month,
      year,
    },
    include: { technician: { select: { name: true, employeeId: true } } },
  });

  return NextResponse.json(job, { status: 201 });
}
