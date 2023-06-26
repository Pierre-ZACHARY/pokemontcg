/*
  Warnings:

  - You are about to drop the column `langage` on the `CardI18n` table. All the data in the column will be lost.
  - You are about to drop the column `langage` on the `User` table. All the data in the column will be lost.
  - Added the required column `language` to the `CardI18n` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CardI18n" DROP COLUMN "langage",
ADD COLUMN     "language" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "langage",
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'fr';
