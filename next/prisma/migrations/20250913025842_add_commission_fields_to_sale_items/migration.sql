-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN "commissionAmount" REAL DEFAULT 0;
ALTER TABLE "sale_items" ADD COLUMN "commissionRate" REAL DEFAULT 0;
ALTER TABLE "sale_items" ADD COLUMN "salonOwnerAmount" REAL DEFAULT 0;
ALTER TABLE "sale_items" ADD COLUMN "salonOwnerRate" REAL DEFAULT 0;
