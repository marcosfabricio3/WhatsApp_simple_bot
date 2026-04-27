-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Scheduledmessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "recurrence" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KeywordTrigger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "chatJid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
