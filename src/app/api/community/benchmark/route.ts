import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { runBenchmark } from "@/benchmarker/runner";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { provider, model, apiKey } = body;

  const cleanKey = apiKey.trim();

  if (!provider || !model || !cleanKey) {
    return NextResponse.json(
      { error: "Missing provider, model, or apiKey" },
      { status: 400 }
    );
  }

  const providerConfig = config.community?.find((p) => p.provider === provider);
  if (!providerConfig) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 400 }
    );
  }

  const modelConfig = providerConfig.models.find((m) => m.model === model);
  if (!modelConfig) {
    return NextResponse.json(
      { error: "Model not found" },
      { status: 400 }
    );
  }

  const entry = {
    provider: providerConfig.provider,
    endpoint: providerConfig.endpoint,
    apiKey: cleanKey,
    model: modelConfig.model,
    alias: modelConfig.alias,
  };

  const result = await runBenchmark(entry);

  if (result.success) {
    await prisma.communityResult.create({
      data: {
        provider: entry.provider,
        model: entry.model,
        alias: entry.alias,
        ttftMs: result.ttftMs,
        tps: result.tps,
      },
    });
  }

  return NextResponse.json({
    success: result.success,
    ttftMs: result.ttftMs,
    tps: result.tps,
    errorMessage: result.errorMessage,
  });
}
