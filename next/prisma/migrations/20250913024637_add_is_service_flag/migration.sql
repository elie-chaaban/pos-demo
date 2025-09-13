-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isService" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "averageCost" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_items" ("averageCost", "categoryId", "createdAt", "description", "id", "name", "price", "stock", "updatedAt") SELECT "averageCost", "categoryId", "createdAt", "description", "id", "name", "price", "stock", "updatedAt" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
