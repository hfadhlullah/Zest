-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'paid');

-- CreateEnum
CREATE TYPE "OutputFormat" AS ENUM ('html_css', 'tailwind');

-- CreateEnum
CREATE TYPE "ProviderUsed" AS ENUM ('glm', 'gemini', 'github_copilot');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('success', 'failed', 'moderated');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('html_css', 'tailwind');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('blocked', 'allowed', 'reviewed');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "clerk_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "generation_count" INTEGER NOT NULL DEFAULT 0,
    "generation_reset_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "latest_generation_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" UUID NOT NULL,
    "project_id" UUID,
    "user_id" UUID,
    "prompt_hash" VARCHAR(64) NOT NULL,
    "output_format" "OutputFormat" NOT NULL,
    "html" TEXT NOT NULL,
    "css" TEXT,
    "provider_used" "ProviderUsed" NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "token_count" INTEGER,
    "status" "GenerationStatus" NOT NULL,
    "parent_generation_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Export" (
    "id" UUID NOT NULL,
    "generation_id" UUID NOT NULL,
    "user_id" UUID,
    "format" "ExportFormat" NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Export_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" UUID NOT NULL,
    "prompt_hash" VARCHAR(64) NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "user_id" UUID,
    "ip_hash" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerk_id_key" ON "User"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerk_id_idx" ON "User"("clerk_id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_user_id_idx" ON "Project"("user_id");

-- CreateIndex
CREATE INDEX "idx_projects_not_deleted" ON "Project"("deleted_at");

-- CreateIndex
CREATE INDEX "Generation_project_id_created_at_idx" ON "Generation"("project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Generation_user_id_created_at_idx" ON "Generation"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Generation_prompt_hash_output_format_idx" ON "Generation"("prompt_hash", "output_format");

-- CreateIndex
CREATE INDEX "Export_generation_id_idx" ON "Export"("generation_id");

-- CreateIndex
CREATE INDEX "ModerationLog_created_at_idx" ON "ModerationLog"("created_at" DESC);

-- CreateIndex
CREATE INDEX "ModerationLog_action_idx" ON "ModerationLog"("action");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_latest_generation_id_fkey" FOREIGN KEY ("latest_generation_id") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_parent_generation_id_fkey" FOREIGN KEY ("parent_generation_id") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "Generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
