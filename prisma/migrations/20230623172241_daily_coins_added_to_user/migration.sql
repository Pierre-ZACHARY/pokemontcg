-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyCoins" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "dailyCoinsReceived" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "lastClaim" DROP NOT NULL,
ALTER COLUMN "lastClaim" DROP DEFAULT;