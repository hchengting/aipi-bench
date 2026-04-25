import { NextRequest, NextResponse } from "next/server";
import { runAllModels } from "@/benchmarker/scheduler";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    // Fire-and-forget so the HTTP response returns immediately.
    // The benchmarks run in the background; calling code should poll
    // /api/stats or rely on the scheduler instead of waiting.
    runAllModels().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[benchmarker] Background runAllModels failed:", message);
    });

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
