// src/app/api/technicians/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const technicians = await prisma.technician.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(technicians);
}

export async function POST(req: NextRequest) {
  const { name, employeeId, email, phone } = await req.json();
  const tech = await prisma.technician.create({
    data: { name, employeeId, email, phone },
  });
  return NextResponse.json(tech, { status: 201 });
}
