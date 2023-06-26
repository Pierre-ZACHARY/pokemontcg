-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extension" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "seriesId" INTEGER NOT NULL,

    CONSTRAINT "Extension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rarity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Rarity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "cardId" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "extensionId" INTEGER NOT NULL,
    "rarityId" INTEGER NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardI18n" (
    "id" SERIAL NOT NULL,
    "langage" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "cardId" INTEGER NOT NULL,

    CONSTRAINT "CardI18n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "discordId" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "langage" TEXT NOT NULL DEFAULT 'fr',
    "boosterLimit" INTEGER NOT NULL DEFAULT 3,
    "lastClaim" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "discordId" TEXT NOT NULL,
    "shopId" INTEGER,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booster" (
    "id" SERIAL NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "extensionId" INTEGER NOT NULL,

    CONSTRAINT "Booster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedBooster" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "boosterId" INTEGER NOT NULL,

    CONSTRAINT "OwnedBooster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "purchaserId" INTEGER NOT NULL,

    CONSTRAINT "Goods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serverId" INTEGER NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ServerToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BoosterToGoods" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BoosterToShop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GoodsToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GoodsToShop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Series_name_key" ON "Series"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Series_acronym_key" ON "Series"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "Extension_name_key" ON "Extension"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Extension_acronym_key" ON "Extension"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "Rarity_name_key" ON "Rarity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rarity_acronym_key" ON "Rarity"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "Card_cardId_key" ON "Card"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Server_discordId_key" ON "Server"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Server_shopId_key" ON "Server"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_cardId_serverId_key" ON "Collection"("cardId", "serverId");

-- CreateIndex
CREATE UNIQUE INDEX "Goods_name_key" ON "Goods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_serverId_key" ON "Shop"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "_ServerToUser_AB_unique" ON "_ServerToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ServerToUser_B_index" ON "_ServerToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BoosterToGoods_AB_unique" ON "_BoosterToGoods"("A", "B");

-- CreateIndex
CREATE INDEX "_BoosterToGoods_B_index" ON "_BoosterToGoods"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BoosterToShop_AB_unique" ON "_BoosterToShop"("A", "B");

-- CreateIndex
CREATE INDEX "_BoosterToShop_B_index" ON "_BoosterToShop"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GoodsToUser_AB_unique" ON "_GoodsToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GoodsToUser_B_index" ON "_GoodsToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GoodsToShop_AB_unique" ON "_GoodsToShop"("A", "B");

-- CreateIndex
CREATE INDEX "_GoodsToShop_B_index" ON "_GoodsToShop"("B");

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extension" ADD CONSTRAINT "Extension_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "Extension"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "Rarity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardI18n" ADD CONSTRAINT "CardI18n_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booster" ADD CONSTRAINT "Booster_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "Extension"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedBooster" ADD CONSTRAINT "OwnedBooster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedBooster" ADD CONSTRAINT "OwnedBooster_boosterId_fkey" FOREIGN KEY ("boosterId") REFERENCES "Booster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goods" ADD CONSTRAINT "Goods_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("shopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServerToUser" ADD CONSTRAINT "_ServerToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServerToUser" ADD CONSTRAINT "_ServerToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoosterToGoods" ADD CONSTRAINT "_BoosterToGoods_A_fkey" FOREIGN KEY ("A") REFERENCES "Booster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoosterToGoods" ADD CONSTRAINT "_BoosterToGoods_B_fkey" FOREIGN KEY ("B") REFERENCES "Goods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoosterToShop" ADD CONSTRAINT "_BoosterToShop_A_fkey" FOREIGN KEY ("A") REFERENCES "Booster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoosterToShop" ADD CONSTRAINT "_BoosterToShop_B_fkey" FOREIGN KEY ("B") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoodsToUser" ADD CONSTRAINT "_GoodsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Goods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoodsToUser" ADD CONSTRAINT "_GoodsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoodsToShop" ADD CONSTRAINT "_GoodsToShop_A_fkey" FOREIGN KEY ("A") REFERENCES "Goods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoodsToShop" ADD CONSTRAINT "_GoodsToShop_B_fkey" FOREIGN KEY ("B") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
