// src/app/api/months/route.ts
// Compute or fetch month summaries for all technicians.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rollupMonth } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || "");
  const year = parseInt(searchParams.get("year") || "");

  const summaries = await prisma.monthSummary.findMany({
    where: { month, year },
    include: { technician: { select: { name: true, employeeId: true } } },
    orderBy: [{ isApproved: "asc" }, { netPoints: "desc" }],
  });
  return NextResponse.json(summaries);
}

export async function POST(req: NextRequest) {
  // Recompute month summaries for all active technicians for given month/year
  const { month, year, ratePerPoint = 2.0 } = await req.json();

  const technicians = await prisma.technician.findMany({ where: { isActive: true } });
  const results = [];

  for (const tech of technicians) {
    const jobs = await prisma.job.findMany({
      where: { technicianId: tech.id, month, year },
    });

    if (jobs.length === 0) continue;

    // Pass the real component fields, not just the floored total — the 30%
    // deduction cap needs the true size of penalties earned this month.
    const rollup = rollupMonth(
      jobs.map((j: (typeof jobs)[number]) => ({
        totalJobPoints: j.totalJobPoints,
        deadlinePoints: j.deadlinePoints,
        reopenPenalty: j.reopenPenalty,
        managerOverride: j.managerOverride,
        overridePoints: j.overridePoints,
      })),
      ratePerPoint
    );

    const summary = await prisma.monthSummary.upsert({
      where: { technicianId_month_year: { technicianId: tech.id, month, year } },
      create: {
        technicianId: tech.id,
        month,
        year,
        totalJobsDone: jobs.length,
        grossPoints: rollup.grossPoints,
        totalDeductions: rollup.totalDeductions,
        netPoints: rollup.netPoints,
        multiplierTier: rollup.tier,
        multiplier: rollup.multiplier,
        ratePerPoint,
        incentiveAmount: rollup.incentiveAmount,
        isApproved: false,
      },
      update: {
        totalJobsDone: jobs.length,
        grossPoints: rollup.grossPoints,
        totalDeductions: rollup.totalDeductions,
        netPoints: rollup.netPoints,
        multiplierTier: rollup.tier,
        multiplier: rollup.multiplier,
        ratePerPoint,
        incentiveAmount: rollup.incentiveAmount,
      },
      include: { technician: { select: { name: true, employeeId: true } } },
    });
    results.push(summary);
  }

  return NextResponse.json(results);
}