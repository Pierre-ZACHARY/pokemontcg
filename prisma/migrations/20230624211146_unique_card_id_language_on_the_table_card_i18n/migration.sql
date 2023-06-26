/*
  Warnings:

  - A unique constraint covering the columns `[cardId,language]` on the table `CardI18n` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CardI18n_cardId_language_key" ON "CardI18n"("cardId", "language");
