// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const [totalTechs, totalJobs, summaries] = await Promise.all([
    prisma.technician.count({ where: { isActive: true } }),
    prisma.job.count({ where: { month, year } }),
    prisma.monthSummary.findMany({
      where: { month, year },
      include: { technician: { select: { name: true } } },
      orderBy: { netPoints: "desc" },
      take: 5,
    }),
  ]);

  const totalPayout = summaries.reduce((s, r) => s + r.incentiveAmount, 0);
  const totalPoints = summaries.reduce((s, r) => s + r.netPoints, 0);

  return NextResponse.json({
    month,
    year,
    totalTechs,
    totalJobs,
    totalPayout,
    totalPoints,
    topPerformers: summaries,
  });
}
