import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const results = await prisma.communityResult.findMany({
    orderBy: { timestamp: "desc" },
    take: 500,
  });

  return NextResponse.json({ results });
}
