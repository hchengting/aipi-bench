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

export interface AppConfig {
  prompt: string;
  interval: number;
  requestTimeout: number;
  port: number;
  entries: ConfigEntry[];
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
    interval: e.interval !== undefined ? Number(e.interval) : undefined,
    prompt: e.prompt !== undefined ? String(e.prompt) : undefined,
  }));

  return {
    prompt: String(json.prompt || "Write a 2000 word long story"),
    interval: Number(json.interval || 7200000),
    requestTimeout: Number(json.requestTimeout || 120000),
    port: parseInt(process.env.PORT || "3000", 10),
    entries,
  };
}

export const config = loadConfig();
