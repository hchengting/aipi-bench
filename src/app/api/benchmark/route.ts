import { NextRequest, NextResponse } from "next/server";
import { runAllModels } from "@/benchmarker/scheduler";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const result = await runAllModels();

    if (!result.started && result.reason === "already_running") {
      return NextResponse.json(
        { status: "already_running" },
        { status: 429 }
      );
    }

    return NextResponse.json({ status: "started" });
  } catch (err: unknown) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? (err.statusCode as number)
        : 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "error", error: message },
      { status: statusCode }
    );
  }
}
