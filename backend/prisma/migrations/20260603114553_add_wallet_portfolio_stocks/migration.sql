-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('INITIAL_CREDIT', 'CREDIT', 'DEBIT', 'TRANSFER_IN', 'TRANSFER_OUT', 'STOCK_BUY', 'STOCK_SELL', 'REMITTANCE');

-- CreateEnum
CREATE TYPE "StockTransactionType" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 50000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "balance_before" DECIMAL(18,2) NOT NULL,
    "balance_after" DECIMAL(18,2) NOT NULL,
    "description" TEXT NOT NULL,
    "counterparty_id" TEXT,
    "related_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "avg_price_brl" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" "StockTransactionType" NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "price_usd" DECIMAL(18,4) NOT NULL,
    "price_brl" DECIMAL(18,2) NOT NULL,
    "exchange_rate" DECIMAL(18,4) NOT NULL,
    "total_brl" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_idx" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "portfolios_user_id_idx" ON "portfolios"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_user_id_symbol_key" ON "portfolios"("user_id", "symbol");

-- CreateIndex
CREATE INDEX "stock_transactions_user_id_idx" ON "stock_transactions"("user_id");

-- CreateIndex
CREATE INDEX "stock_transactions_symbol_idx" ON "stock_transactions"("symbol");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
