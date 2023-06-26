-- DropForeignKey
ALTER TABLE "CardI18n" DROP CONSTRAINT "CardI18n_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_userId_fkey";

-- DropForeignKey
ALTER TABLE "OwnedBooster" DROP CONSTRAINT "OwnedBooster_boosterId_fkey";

-- DropForeignKey
ALTER TABLE "OwnedBooster" DROP CONSTRAINT "OwnedBooster_userId_fkey";

-- DropForeignKey
ALTER TABLE "Wish" DROP CONSTRAINT "Wish_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Wish" DROP CONSTRAINT "Wish_userId_fkey";

-- AddForeignKey
ALTER TABLE "CardI18n" ADD CONSTRAINT "CardI18n_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedBooster" ADD CONSTRAINT "OwnedBooster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedBooster" ADD CONSTRAINT "OwnedBooster_boosterId_fkey" FOREIGN KEY ("boosterId") REFERENCES "Booster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
