// src/app/api/months/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { approvedBy, notes } = await req.json();

  const summary = await prisma.monthSummary.update({
    where: { id: params.id },
    data: {
      isApproved: true,
      approvedAt: new Date(),
      approvedBy,
      notes,
    },
    include: { technician: { select: { name: true, employeeId: true } } },
  });
  return NextResponse.json(summary);
}
