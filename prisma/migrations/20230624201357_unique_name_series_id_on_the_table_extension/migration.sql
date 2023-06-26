/*
  Warnings:

  - You are about to drop the column `acronym` on the `Rarity` table. All the data in the column will be lost.
  - You are about to drop the `_ServerToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,seriesId]` on the table `Extension` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_ServerToUser" DROP CONSTRAINT "_ServerToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServerToUser" DROP CONSTRAINT "_ServerToUser_B_fkey";

-- DropIndex
DROP INDEX "Extension_name_key";

-- DropIndex
DROP INDEX "Rarity_acronym_key";

-- AlterTable
ALTER TABLE "Rarity" DROP COLUMN "acronym";

-- DropTable
DROP TABLE "_ServerToUser";

-- CreateTable
CREATE TABLE "Wish" (
    "cardId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Wish_cardId_userId_serverId_key" ON "Wish"("cardId", "userId", "serverId");

-- CreateIndex
CREATE UNIQUE INDEX "Extension_name_seriesId_key" ON "Extension"("name", "seriesId");

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
