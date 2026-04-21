-- CreateTable
CREATE TABLE "Result" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "alias" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "ttftMs" INTEGER,
    "tps" REAL,
    "totalTimeMs" INTEGER,
    "tokensGenerated" INTEGER,
    "promptSent" TEXT,
    "errorMessage" TEXT
);

-- CreateIndex
CREATE INDEX "Result_provider_model_timestamp_idx" ON "Result"("provider", "model", "timestamp");
