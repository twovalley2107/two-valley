-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_phone_key" ON "Profile"("phone");
