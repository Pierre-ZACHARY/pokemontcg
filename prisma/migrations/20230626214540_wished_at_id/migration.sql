-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Wish" ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "wishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "Wish_pkey" PRIMARY KEY ("id");
