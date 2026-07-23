// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

export async function GET() {
  const settings = await prisma.appSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ratePerPoint: 2.0 },
    update: {},
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const { ratePerPoint } = await req.json();

  if (typeof ratePerPoint !== "number" || ratePerPoint <= 0) {
    return NextResponse.json({ error: "ratePerPoint must be a positive number" }, { status: 400 });
  }

  const settings = await prisma.appSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ratePerPoint },
    update: { ratePerPoint },
  });
  return NextResponse.json(settings);
}