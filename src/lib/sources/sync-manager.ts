import { prisma } from "../prisma";
import { NormalizedJob } from "./types";
import { AdzunaAdapter, ReedAdapter, JoobleAdapter } from "./adapters";
import { JobStatus } from "@prisma/client";

function generateSlug(title: string, company: string): string {
  const base = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `${base}-${Math.random().toString(36).substring(2, 7)}`;
}

export async function upsertNormalizedJob(job: NormalizedJob, jobSourceId?: string) {
  // Deduplication check:
  // 1. Check exact match on sourceProvider + externalId
  const existingByExternal = await prisma.job.findUnique({
    where: {
      sourceProvider_externalId: {
        sourceProvider: job.sourceProvider,
        externalId: job.externalId,
      },
    },
  });

  if (existingByExternal) {
    // Update freshness timestamp and status
    return prisma.job.update({
      where: { id: existingByExternal.id },
      data: {
        lastCheckedAt: new Date(),
        officialApplyUrl: job.officialApplyUrl,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
      },
    });
  }

  // 2. Fuzzy deduplication check by title + companyName + city (case-insensitive)
  const existingFuzzy = await prisma.job.findFirst({
    where: {
      title: { equals: job.title, mode: "insensitive" },
      companyName: { equals: job.companyName, mode: "insensitive" },
      city: { equals: job.city, mode: "insensitive" },
      status: JobStatus.ACTIVE,
    },
  });

  if (existingFuzzy) {
    // Already exists from another source; update last checked
    return prisma.job.update({
      where: { id: existingFuzzy.id },
      data: { lastCheckedAt: new Date() },
    });
  }

  // Create or connect Company
  let companyId: string | undefined = undefined;
  if (job.companyName) {
    const companySlug = job.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const company = await prisma.company.upsert({
      where: { slug: companySlug },
      update: {
        logoUrl: job.companyLogo || undefined,
        website: job.companyWebsite || undefined,
      },
      create: {
        name: job.companyName,
        slug: companySlug,
        logoUrl: job.companyLogo,
        website: job.companyWebsite,
        location: job.location,
        country: job.country,
        city: job.city,
        isVerified: job.isVerified,
      },
    });
    companyId = company.id;
  }

  // Create new Job listing
  const newJob = await prisma.job.create({
    data: {
      externalId: job.externalId,
      sourceProvider: job.sourceProvider,
      jobSourceId,
      title: job.title,
      slug: generateSlug(job.title, job.companyName),
      companyId,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      description: job.description,
      responsibilities: job.responsibilities,
      qualifications: job.qualifications,
      category: job.category,
      opportunityType: job.opportunityType,
      workArrangement: job.workArrangement,
      location: job.location,
      country: job.country,
      city: job.city,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency || "MAD",
      isPaidInternship: job.isPaidInternship,
      deadline: job.deadline,
      publicationDate: job.publicationDate || new Date(),
      applicationMethod: job.applicationMethod,
      officialApplyUrl: job.officialApplyUrl,
      sourceUrl: job.sourceUrl,
      isVerified: job.isVerified,
      status: JobStatus.ACTIVE,
      skills: {
        create: (job.skills || []).map((skill) => ({ skill })),
      },
    },
  });

  return newJob;
}

export async function runJobSourcesSync(): Promise<{
  totalFetched: number;
  totalSaved: number;
  companiesIngested: number;
  logs: string[];
}> {
  const logs: string[] = [];
  let totalFetched = 0;
  let totalSaved = 0;
  let companiesIngested = 0;

  // 1. Sync real opportunities from Adzuna API
  const adzuna = new AdzunaAdapter();
  logs.push(`Starting sync for provider: ${adzuna.providerName}`);
  if (adzuna.isConfigured()) {
    try {
      // Ingest tech jobs
      const techJobs = await adzuna.fetchJobs({ query: "développeur", limit: 25, country: "fr" });
      // Ingest internships
      const internJobs = await adzuna.fetchJobs({ query: "stage informatique", limit: 15, country: "fr" });
      const combined = [...techJobs, ...internJobs];

      totalFetched += combined.length;
      logs.push(`Fetched ${combined.length} live jobs & internships from Adzuna API`);

      for (const job of combined) {
        try {
          await upsertNormalizedJob(job);
          totalSaved++;
        } catch (itemErr) {
          logs.push(`Failed to save job ${job.externalId}: ${String(itemErr)}`);
        }
      }
    } catch (err) {
      logs.push(`Error syncing Adzuna: ${String(err)}`);
    }
  } else {
    logs.push("Adzuna skipped: credentials missing.");
  }

  // 2. Ingest real enterprises from Google Places API
  const { googlePlacesService } = await import("../services/google-places-service");
  if (googlePlacesService.isConfigured()) {
    logs.push("Starting Google Places Enterprise Ingestion for Morocco tech ecosystems...");
    const cities = ["Casablanca", "Rabat", "Marrakech", "Tanger"];
    for (const city of cities) {
      try {
        const places = await googlePlacesService.searchEnterprises({
          query: "entreprises informatique et développement logiciel",
          city,
          pageSize: 10,
        });
        const saved = await googlePlacesService.ingestEnterprises(places);
        companiesIngested += saved;
        logs.push(`Ingested ${saved} verified enterprises in ${city} via Google Places API.`);
      } catch (placeErr) {
        logs.push(`Error fetching Google Places for ${city}: ${String(placeErr)}`);
      }
    }
  } else {
    logs.push("Google Places API skipped: key not configured.");
  }

  // Update audit log in database
  await prisma.auditLog.create({
    data: {
      action: "JOB_SOURCES_SYNC",
      resource: "JobSource",
      details: { totalFetched, totalSaved, companiesIngested, logs },
    },
  });

  return { totalFetched, totalSaved, companiesIngested, logs };
}
