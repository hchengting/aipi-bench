import { runBenchmark } from "./runner";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import type { ConfigEntry } from "@/lib/config";

interface ScheduleState {
  entry: ConfigEntry;
  nextRunAt: number;
}

let tickId: ReturnType<typeof setInterval> | null = null;
const schedules = new Map<string, ScheduleState>();

function entryKey(entry: ConfigEntry): string {
  return `${entry.provider}|${entry.model}`;
}

function getInterval(entry: ConfigEntry): number {
  return entry.interval ?? config.interval;
}

async function runEntry(state: ScheduleState) {
  const entry = state.entry;
  const result = await runBenchmark(entry);

  await prisma.result.create({
    data: {
      provider: entry.provider,
      model: entry.model,
      alias: entry.alias,
      success: result.success,
      ttftMs: result.ttftMs,
      tps: result.tps,
      totalTimeMs: result.totalTimeMs,
      tokensGenerated: result.tokensGenerated,
      promptSent: result.promptSent,
      errorMessage: result.errorMessage,
    },
  });

  const status = result.success
    ? `TTFT=${result.ttftMs}ms TPS=${result.tps} Time=${result.totalTimeMs}ms`
    : `FAILED: ${result.errorMessage}`;

  console.log(`[benchmarker] ${entry.provider}/${entry.model}: ${status}`);

  state.nextRunAt = Date.now() + getInterval(entry);
}

async function tick() {
  const now = Date.now();
  const due: ScheduleState[] = [];

  for (const state of schedules.values()) {
    if (state.nextRunAt <= now) {
      due.push(state);
    }
  }

  for (const state of due) {
    runEntry(state).catch((err) =>
      console.error(`[benchmarker] Error running ${state.entry.provider}/${state.entry.model}:`, err)
    );
  }
}

export async function runAllModels() {
  console.log(`[benchmarker] Running all ${config.entries.length} entries immediately`);

  for (const entry of config.entries) {
    const key = entryKey(entry);
    const state = schedules.get(key);
    if (state) {
      await runEntry(state);
    }
  }
}

export function startScheduler() {
  const now = Date.now();

  for (const entry of config.entries) {
    schedules.set(entryKey(entry), {
      entry,
      nextRunAt: now, // run immediately on startup
    });
  }

  // Run all entries immediately
  runAllModels().catch((err) =>
    console.error("[benchmarker] Error in initial run:", err)
  );

  // Determine tick interval: minimum entry interval, capped at 60s minimum
  const intervals = config.entries.map(getInterval);
  const minInterval = Math.min(...intervals);
  const tickInterval = Math.min(minInterval, 60000);

  tickId = setInterval(() => {
    tick().catch((err) =>
      console.error("[benchmarker] Error in scheduler tick:", err)
    );
  }, tickInterval);

  console.log(
    `[benchmarker] Scheduler started — tick: ${tickInterval / 1000}s, entries: ${config.entries.length}`
  );
}

export function stopScheduler() {
  if (tickId !== null) {
    clearInterval(tickId);
    tickId = null;
    schedules.clear();
    console.log("[benchmarker] Scheduler stopped");
  }
}
