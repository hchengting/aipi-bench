"use client";

import { useState, useEffect, useCallback } from "react";

interface BenchmarkStatus {
  running: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  runBy: "manual" | "scheduler" | null;
}

export default function RunBenchmarkButton() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/benchmark/status");
      if (!res.ok) return;
      const data: BenchmarkStatus = await res.json();
      setRunning(data.running);
    } catch {
      // silently retry next interval
    }
  }, []);

  useEffect(() => {
    // Initial status check
    pollStatus();
  }, [pollStatus]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(pollStatus, 5000);
    return () => clearInterval(id);
  }, [running, pollStatus]);

  async function handleClick() {
    setError(null);
    setMessage(null);
    setRunning(true);

    try {
      const res = await fetch("/api/benchmark", { method: "POST" });
      const data = await res.json();

      if (res.status === 429 && data.status === "already_running") {
        setMessage("A benchmark run is already in progress.");
        return;
      }

      if (!res.ok) {
        setError("Failed to start benchmark.");
        setRunning(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setRunning(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleClick}
        disabled={running}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer
          ${running
            ? "bg-border text-muted cursor-not-allowed"
            : "bg-accent-blue text-white hover:bg-accent-blue/90"
          }`}
      >
        {running ? "Running benchmarks..." : "Run All Benchmarks Now"}
      </button>

      {message && (
        <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-3 text-sm text-accent-blue">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
