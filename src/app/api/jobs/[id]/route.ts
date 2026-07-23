// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreJob } from "@/lib/scoring";
import type { JobCategory, DeadlinePerformance, PartsUsed, FixAttempt, AcceptanceSpeed } from "@/lib/scoring";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { technician: { select: { name: true, employeeId: true } } },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const existing = await prisma.job.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const merged = { ...existing, ...body };

  const jobsTodayCount = await prisma.job.count({
    where: {
      technicianId: existing.technicianId,
      assignedAt: {
        gte: new Date(new Date(existing.assignedAt).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(existing.assignedAt).setHours(23, 59, 59, 999)),
      },
      NOT: { id: params.id },
    },
  });

  const score = scoreJob({
    category: merged.category as JobCategory,
    deadlinePerformance: merged.deadlinePerformance as DeadlinePerformance,
    partsUsed: merged.partsUsed as PartsUsed,
    fixAttempt: merged.fixAttempt as FixAttempt,
    acceptanceSpeed: merged.acceptanceSpeed as AcceptanceSpeed,
    partsOrdered: merged.partsOrdered || 0,
    partsActuallyUsed: merged.partsActuallyUsed || 0,
    isReopened: merged.isReopened || false,
    jobsCompletedTodayBefore: jobsTodayCount,
    managerOverride: merged.managerOverride ? merged.overridePoints : null,
  });

  const updated = await prisma.job.update({
    where: { id: params.id },
    data: {
      ...body,
      deadlinePoints: score.deadlinePoints,
      deadlineBonusPoints: score.deadlineBonusPoints,
      partsPoints: score.partsPoints,
      fixPoints: score.fixPoints,
      acceptancePoints: score.acceptancePoints,
      volumeBonusPoints: score.volumeBonusPoints,
      noWastePoints: score.noWastePoints,
      reopenPenalty: score.reopenPenalty,
      totalJobPoints: score.totalJobPoints,
    },
    include: { technician: { select: { name: true, employeeId: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
