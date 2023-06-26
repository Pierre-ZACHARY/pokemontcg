-- CreateTable
CREATE TABLE "_CardToOwnedBooster" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CardToOwnedBooster_AB_unique" ON "_CardToOwnedBooster"("A", "B");

-- CreateIndex
CREATE INDEX "_CardToOwnedBooster_B_index" ON "_CardToOwnedBooster"("B");

-- AddForeignKey
ALTER TABLE "_CardToOwnedBooster" ADD CONSTRAINT "_CardToOwnedBooster_A_fkey" FOREIGN KEY ("A") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToOwnedBooster" ADD CONSTRAINT "_CardToOwnedBooster_B_fkey" FOREIGN KEY ("B") REFERENCES "OwnedBooster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
