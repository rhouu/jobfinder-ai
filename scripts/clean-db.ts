import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanAllData() {
  console.log("Cleaning all application accounts, candidatures, and demo history...");

  // Delete all user related activity
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.searchHistory.deleteMany({});
  await prisma.coverLetter.deleteMany({});
  await prisma.applicationEvent.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.cVAnalysis.deleteMany({});
  await prisma.cVDocument.deleteMany({});
  await prisma.savedJob.deleteMany({});
  await prisma.reportedJob.deleteMany({});

  // Delete all candidate and employer profiles and accounts
  await prisma.employerProfile.deleteMany({});
  await prisma.candidateProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("All users, candidate accounts, employer accounts, and application histories have been deleted successfully.");
}

cleanAllData()
  .catch((e) => {
    console.error("Error cleaning database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
