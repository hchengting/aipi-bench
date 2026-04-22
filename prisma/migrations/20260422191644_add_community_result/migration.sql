-- CreateTable
CREATE TABLE "CommunityResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "alias" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ttftMs" INTEGER,
    "tps" REAL
);

-- CreateIndex
CREATE INDEX "CommunityResult_provider_model_timestamp_idx" ON "CommunityResult"("provider", "model", "timestamp");
