/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Worker` table. All the data in the column will be lost.
  - Added the required column `comment` to the `Worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salaryPerOne` to the `Worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerCount` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Worker_phone_key";

-- AlterTable
ALTER TABLE "public"."Worker" DROP COLUMN "createdAt",
DROP COLUMN "fullName",
DROP COLUMN "note",
DROP COLUMN "phone",
DROP COLUMN "position",
DROP COLUMN "updatedAt",
ADD COLUMN     "comment" TEXT NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "salaryPerOne" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalSalary" DOUBLE PRECISION,
ADD COLUMN     "workerCount" INTEGER NOT NULL;
