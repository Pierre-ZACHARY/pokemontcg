/*
  Warnings:

  - You are about to drop the column `channelId` on the `Goods` table. All the data in the column will be lost.
  - You are about to drop the column `purchasedAt` on the `Goods` table. All the data in the column will be lost.
  - You are about to drop the column `purchaserId` on the `Goods` table. All the data in the column will be lost.
  - You are about to drop the column `serverId` on the `Goods` table. All the data in the column will be lost.
  - You are about to drop the `_GoodsToUser` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `shopId` on table `Server` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CardI18n" DROP CONSTRAINT "CardI18n_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_serverId_fkey";

-- DropForeignKey
ALTER TABLE "Goods" DROP CONSTRAINT "Goods_purchaserId_fkey";

-- DropForeignKey
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_serverId_fkey";

-- DropForeignKey
ALTER TABLE "Wish" DROP CONSTRAINT "Wish_serverId_fkey";

-- DropForeignKey
ALTER TABLE "_GoodsToUser" DROP CONSTRAINT "_GoodsToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GoodsToUser" DROP CONSTRAINT "_GoodsToUser_B_fkey";

-- AlterTable
ALTER TABLE "CardI18n" ALTER COLUMN "cardId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "serverId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Goods" DROP COLUMN "channelId",
DROP COLUMN "purchasedAt",
DROP COLUMN "purchaserId",
DROP COLUMN "serverId";

-- AlterTable
ALTER TABLE "Server" ALTER COLUMN "shopId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "serverId" DROP NOT NULL,
ALTER COLUMN "serverId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "selectedExtensionId" INTEGER,
ADD COLUMN     "selectedGameId" INTEGER;

-- AlterTable
ALTER TABLE "Wish" ALTER COLUMN "serverId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "_GoodsToUser";

-- CreateTable
CREATE TABLE "OwnedGoods" (
    "id" SERIAL NOT NULL,
    "goodsId" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "purchaserId" TEXT NOT NULL,

    CONSTRAINT "OwnedGoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenedGoods" (
    "id" SERIAL NOT NULL,
    "goodsId" INTEGER NOT NULL,
    "channelId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,

    CONSTRAINT "OpenedGoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OpenedGoodsToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OpenedGoodsToUser_AB_unique" ON "_OpenedGoodsToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_OpenedGoodsToUser_B_index" ON "_OpenedGoodsToUser"("B");

-- AddForeignKey
ALTER TABLE "CardI18n" ADD CONSTRAINT "CardI18n_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_selectedGameId_fkey" FOREIGN KEY ("selectedGameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_selectedExtensionId_fkey" FOREIGN KEY ("selectedExtensionId") REFERENCES "Extension"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedGoods" ADD CONSTRAINT "OwnedGoods_goodsId_fkey" FOREIGN KEY ("goodsId") REFERENCES "Goods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedGoods" ADD CONSTRAINT "OwnedGoods_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "User"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenedGoods" ADD CONSTRAINT "OpenedGoods_goodsId_fkey" FOREIGN KEY ("goodsId") REFERENCES "Goods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenedGoods" ADD CONSTRAINT "OpenedGoods_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpenedGoodsToUser" ADD CONSTRAINT "_OpenedGoodsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "OpenedGoods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpenedGoodsToUser" ADD CONSTRAINT "_OpenedGoodsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
