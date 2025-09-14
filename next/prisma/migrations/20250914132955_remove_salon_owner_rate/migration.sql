/*
  Warnings:

  - You are about to drop the column `salonOwnerRate` on the `employee_services` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_employee_services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "commissionRate" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "employee_services_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employee_services_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_employee_services" ("commissionRate", "createdAt", "employeeId", "id", "isActive", "itemId", "updatedAt") SELECT "commissionRate", "createdAt", "employeeId", "id", "isActive", "itemId", "updatedAt" FROM "employee_services";
DROP TABLE "employee_services";
ALTER TABLE "new_employee_services" RENAME TO "employee_services";
CREATE UNIQUE INDEX "employee_services_employeeId_itemId_key" ON "employee_services"("employeeId", "itemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
