-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '匿名',
    "email" TEXT,
    "content" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("approved", "author", "content", "createdAt", "email", "id", "postId") SELECT "approved", "author", "content", "createdAt", "email", "id", "postId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_postId_approved_idx" ON "Comment"("postId", "approved");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Post_status_weekNumber_idx" ON "Post"("status", "weekNumber");

-- CreateIndex
CREATE INDEX "Post_seriesId_idx" ON "Post"("seriesId");

-- CreateIndex
CREATE INDEX "PostFile_postId_idx" ON "PostFile"("postId");

-- CreateIndex
CREATE INDEX "VisitLog_createdAt_idx" ON "VisitLog"("createdAt");

-- CreateIndex
CREATE INDEX "VisitLog_postId_idx" ON "VisitLog"("postId");

