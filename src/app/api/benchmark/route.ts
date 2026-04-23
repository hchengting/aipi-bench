import { NextResponse } from "next/server";
import { runAllModels } from "@/benchmarker/scheduler";

export async function POST() {
  try {
    // Fire-and-forget so the HTTP response returns immediately.
    // The benchmarks run in the background; calling code should poll
    // /api/stats or rely on the scheduler instead of waiting.
    runAllModels().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[benchmarker] Background runAllModels failed:", message);
    });

    return NextResponse.json({ status: "started" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
