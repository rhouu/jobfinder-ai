import { runJobSourcesSync } from "../src/lib/sources/sync-manager";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("== Starting Real Live Data Sync (Adzuna + Google Places) ==");
  const result = await runJobSourcesSync();
  console.log("Sync completed successfully!");
  console.log("Total jobs fetched:", result.totalFetched);
  console.log("Total jobs saved:", result.totalSaved);
  console.log("Companies ingested from Google Places:", result.companiesIngested);
  console.log("Logs:\n", result.logs.join("\n"));

  const totalJobs = await prisma.job.count();
  const totalCompanies = await prisma.company.count();
  console.log(`\nDatabase current stats: ${totalJobs} total jobs, ${totalCompanies} total companies.`);
}

main()
  .catch((e) => {
    console.error("Sync error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
