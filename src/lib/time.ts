export function formatRelativeTime(timestamp: number | null): string {
  if (timestamp === null) return "—";

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function formatDuration(startedAt: number | null, finishedAt: number | null): string {
  if (startedAt === null) return "—";
  const end = finishedAt ?? Date.now();
  const diffMs = end - startedAt;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s`;

  const diffMin = Math.floor(diffSec / 60);
  const remainingSec = diffSec % 60;
  if (diffMin < 60) return `${diffMin}m ${remainingSec}s`;

  const diffHr = Math.floor(diffMin / 60);
  const remainingMin = diffMin % 60;
  return `${diffHr}h ${remainingMin}m`;
}
