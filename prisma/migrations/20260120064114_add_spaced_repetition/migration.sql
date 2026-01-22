-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "nextReview" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "lastStudied" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Progress_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Progress" ("cardId", "id", "lastStudied", "mastery", "userId") SELECT "cardId", "id", "lastStudied", "mastery", "userId" FROM "Progress";
DROP TABLE "Progress";
ALTER TABLE "new_Progress" RENAME TO "Progress";
CREATE UNIQUE INDEX "Progress_userId_cardId_key" ON "Progress"("userId", "cardId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" DATETIME,
    "totalXp" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password") SELECT "createdAt", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
