import { NextResponse } from "next/server";
import { getBenchmarkStatus } from "@/benchmarker/scheduler";

export async function GET() {
  const status = getBenchmarkStatus();
  return NextResponse.json({
    running: status.running,
    startedAt: status.startedAt,
    finishedAt: status.finishedAt,
    runBy: status.runBy,
  });
}
