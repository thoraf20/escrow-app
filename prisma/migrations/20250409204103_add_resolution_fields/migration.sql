-- CreateEnum
CREATE TYPE "ResolutionParty" AS ENUM ('BUYER', 'SELLER');

-- AlterTable
ALTER TABLE "EscrowTransaction" ADD COLUMN     "resolutionNotes" TEXT,
ADD COLUMN     "resolutionWinner" "ResolutionParty",
ADD COLUMN     "resolvedAt" TIMESTAMP(3);
