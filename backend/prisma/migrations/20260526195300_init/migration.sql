-- CreateEnum
CREATE TYPE "RemittanceStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remittances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "origin_currency" TEXT NOT NULL,
    "target_currency" TEXT NOT NULL,
    "origin_amount" DECIMAL(15,2) NOT NULL,
    "target_amount" DECIMAL(15,2) NOT NULL,
    "exchange_rate" DECIMAL(15,6) NOT NULL,
    "fee" DECIMAL(15,2) NOT NULL,
    "spread" DECIMAL(5,4) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "status" "RemittanceStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remittances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explanations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "example" TEXT,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "explanations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "remittances_user_id_idx" ON "remittances"("user_id");

-- CreateIndex
CREATE INDEX "remittances_status_idx" ON "remittances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "explanations_key_key" ON "explanations"("key");

-- CreateIndex
CREATE INDEX "explanations_category_idx" ON "explanations"("category");

-- AddForeignKey
ALTER TABLE "remittances" ADD CONSTRAINT "remittances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
