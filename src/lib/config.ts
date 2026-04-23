import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface ConfigEntry {
  provider: string;
  endpoint: string;
  apiKey: string;
  model: string;
  alias: string;
  interval?: number;
  prompt?: string;
}

export interface CommunityProvider {
  provider: string;
  endpoint: string;
  models: Array<{ model: string; alias: string }>;
}

export interface AppConfig {
  prompt: string;
  interval: number;
  requestTimeout: number;
  port: number;
  entries: ConfigEntry[];
  community?: CommunityProvider[];
}

function loadConfig(): AppConfig {
  const root = process.cwd();
  const configPath = join(root, "config.json");
  const examplePath = join(root, "config.example.json");

  const path = existsSync(configPath) ? configPath : examplePath;
  const raw = readFileSync(path, "utf-8");
  const json = JSON.parse(raw);

  const entries: ConfigEntry[] = (json.entries || []).map((e: Record<string, unknown>) => ({
    provider: String(e.provider),
    endpoint: String(e.endpoint),
    apiKey: String(e.apiKey || ""),
    model: String(e.model),
    alias: String(e.alias || e.model),
    interval: e.interval !== undefined ? Number(e.interval) * 1000 : undefined,
    prompt: e.prompt !== undefined ? String(e.prompt) : undefined,
  }));

  const community: CommunityProvider[] = (json.community || []).map((p: Record<string, unknown>) => ({
    provider: String(p.provider),
    endpoint: String(p.endpoint),
    models: ((p.models || []) as Record<string, unknown>[]).map((m) => ({
      model: String(m.model),
      alias: String(m.alias || m.model),
    })),
  }));

  return {
    prompt: String(json.prompt || "You are a short-story writer. Write a compelling 2,000-word story with a clear conflict and emotional ending."),
    interval: Number(json.interval || 7200) * 1000,
    requestTimeout: Number(json.requestTimeout || 120) * 1000,
    port: parseInt(process.env.PORT || "3000", 10),
    entries,
    community,
  };
}

export const config = loadConfig();
