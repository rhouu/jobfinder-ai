import { prisma } from "../prisma";
import { SearchParamsInput } from "../validations";
import { Prisma, JobStatus, OpportunityType, WorkArrangement } from "@prisma/client";

/**
 * Natural language search parser
 * Automatically detects type, city, and keywords from natural language prompts
 * e.g., "Stage PFE Python ou React à Casablanca débutant", "bghit khdma f restauration f marrakech"
 */
export function parseNaturalLanguageQuery(query: string): {
  keyword: string;
  detectedCity?: string;
  detectedType?: OpportunityType;
} {
  const lower = query.toLowerCase();
  let detectedCity: string | undefined = undefined;
  let detectedType: OpportunityType | undefined = undefined;

  // City detection (Morocco & international)
  const cities = [
    "casablanca", "rabat", "marrakech", "tanger", "tangier", "agadir",
    "fès", "fes", "meknès", "meknes", "oujda", "kenitra", "kénitra",
    "tétouan", "tetouan", "safi", "el jadida", "nador", "mohammedia",
    "khouribga", "béni mellal", "beni mellal", "dakhla", "laâyoune",
    "paris", "lyon", "remote"
  ];
  for (const city of cities) {
    if (lower.includes(city)) {
      detectedCity = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Contract type detection
  if (
    lower.includes("stage") ||
    lower.includes("internship") ||
    lower.includes("pfe") ||
    lower.includes("stagiaire")
  ) {
    detectedType = OpportunityType.INTERNSHIP;
  } else if (lower.includes("alternance") || lower.includes("apprentissage")) {
    detectedType = OpportunityType.APPRENTICESHIP;
  } else if (lower.includes("freelance") || lower.includes("indépendant")) {
    detectedType = OpportunityType.FREELANCE;
  } else if (lower.includes("temps partiel") || lower.includes("part-time")) {
    detectedType = OpportunityType.PART_TIME;
  } else if (
    lower.includes("emploi") ||
    lower.includes("cdi") ||
    lower.includes("cdd") ||
    lower.includes("job") ||
    lower.includes("recrutement")
  ) {
    detectedType = OpportunityType.JOB;
  }

  // Clean keyword: strip French & Darija filler words
  let cleaned = query
    .replace(
      /\b(stage|stagiaire|internship|pfe|alternance|apprentissage|emploi|cdi|cdd|job|recrutement|offres|offre|les offres|khdma|khedma|bghit|f|fi|dyal|dans|à|in|au|pour|débutant|junior|senior|cherche|recherche)\b/gi,
      ""
    )
    .trim();
  if (detectedCity) {
    cleaned = cleaned.replace(new RegExp(detectedCity, "gi"), "").trim();
  }

  return {
    keyword: cleaned || query,
    detectedCity,
    detectedType,
  };
}

const syncedCache = new Map<string, number>();

/**
 * Synchronize live opportunities from Google Places and Adzuna APIs
 * Ensures that any profession/service and any location yields real, live offers
 */
export async function syncLiveProviders(params: { keyword?: string; city?: string }) {
  const kw = (params.keyword || "").trim();
  const city = (params.city || "").trim();
  if (!kw && !city) return;

  const cacheKey = `${kw.toLowerCase()}:::${city.toLowerCase()}`;
  const now = Date.now();
  const lastSync = syncedCache.get(cacheKey);
  // Cache for 4 minutes to avoid redundant API queries during rapid pagination
  if (lastSync && now - lastSync < 4 * 60 * 1000) {
    return;
  }
  syncedCache.set(cacheKey, now);

  const tasks: Promise<unknown>[] = [];

  // 1. Google Places: search enterprises & generate verified opportunities in city/Morocco
  try {
    const { googlePlacesService } = await import("./google-places-service");
    if (googlePlacesService.isConfigured()) {
      tasks.push(
        (async () => {
          const places = await googlePlacesService.searchEnterprises({
            query: kw || "entreprises et services",
            city: city || "Casablanca",
            pageSize: 12,
          });
          if (places.length > 0) {
            await googlePlacesService.ingestEnterprisesWithJobs(places, kw);
          }
        })()
      );
    }
  } catch (err) {
    console.error("Google Places live sync error:", err);
  }

  // 2. Adzuna: search live jobs
  try {
    const { AdzunaAdapter } = await import("../sources/adapters");
    const { upsertNormalizedJob } = await import("../sources/sync-manager");
    const adzuna = new AdzunaAdapter();
    if (adzuna.isConfigured()) {
      tasks.push(
        (async () => {
          const adzunaJobs = await adzuna.fetchJobs({
            query: kw || "emploi",
            location: city,
            limit: 12,
          });
          for (const aj of adzunaJobs) {
            try {
              await upsertNormalizedJob(aj);
            } catch {
              // Ignore individual conflicts
            }
          }
        })()
      );
    }
  } catch (err) {
    console.error("Adzuna live sync error:", err);
  }

  if (tasks.length > 0) {
    await Promise.race([
      Promise.allSettled(tasks),
      new Promise((resolve) => setTimeout(resolve, 3800)),
    ]);
  }
}

export async function searchJobs(params: SearchParamsInput, userId?: string) {
  const {
    q,
    location,
    country,
    city,
    category,
    type,
    arrangement,
    paidOnly,
    verifiedOnly,
    sort,
    page = 1,
    limit = 12,
  } = params;

  let searchKeyword = q;
  let targetCity = city || location;
  let targetType = type;

  // If query is present, check for natural language patterns
  if (q && (!location || !type)) {
    const nl = parseNaturalLanguageQuery(q);
    if (!targetCity && nl.detectedCity) targetCity = nl.detectedCity;
    if (!targetType && nl.detectedType) targetType = nl.detectedType;
    if (nl.keyword.length > 2) searchKeyword = nl.keyword;
  }

  const where: Prisma.JobWhereInput = {
    status: JobStatus.ACTIVE,
  };

  const andFilters: Prisma.JobWhereInput[] = [];

  // Tokenize keywords (handles "AI,IT,BI", "React, Node", "stage python à marrakech", etc.)
  const rawTokens = searchKeyword
    ? searchKeyword
        .split(/[,;+/|]+/)
        .flatMap((part) => part.split(/\s+/))
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  if (rawTokens.length > 0) {
    const keywordOrClauses: Prisma.JobWhereInput[] = [];

    for (const token of rawTokens) {
      const up = token.toUpperCase();
      // Exact & substring matching
      keywordOrClauses.push(
        { title: { contains: token, mode: "insensitive" } },
        { companyName: { contains: token, mode: "insensitive" } },
        { description: { contains: token, mode: "insensitive" } },
        { category: { contains: token, mode: "insensitive" } },
        { skills: { some: { skill: { contains: token, mode: "insensitive" } } } }
      );

      // Smart semantic abbreviations expansion
      if (up === "AI" || up === "IA") {
        keywordOrClauses.push(
          { title: { contains: "IA", mode: "insensitive" } },
          { title: { contains: "Intelligence Artificielle", mode: "insensitive" } },
          { title: { contains: "Data Science", mode: "insensitive" } },
          { category: { contains: "Intelligence Artificielle", mode: "insensitive" } },
          { skills: { some: { skill: { contains: "Machine Learning", mode: "insensitive" } } } },
          { skills: { some: { skill: { contains: "Python", mode: "insensitive" } } } }
        );
      } else if (up === "IT") {
        keywordOrClauses.push(
          { title: { contains: "Développeur", mode: "insensitive" } },
          { title: { contains: "Informatique", mode: "insensitive" } },
          { title: { contains: "Engineer", mode: "insensitive" } },
          { category: { contains: "Informatique", mode: "insensitive" } },
          { category: { contains: "Tech", mode: "insensitive" } }
        );
      } else if (up === "BI") {
        keywordOrClauses.push(
          { title: { contains: "Business Intelligence", mode: "insensitive" } },
          { title: { contains: "Data Analyst", mode: "insensitive" } },
          { skills: { some: { skill: { contains: "Power BI", mode: "insensitive" } } } },
          { skills: { some: { skill: { contains: "SQL", mode: "insensitive" } } } }
        );
      }
    }

    andFilters.push({ OR: keywordOrClauses });
  }

  // Location / City filter
  if (targetCity && targetCity.trim().length > 0) {
    const loc = targetCity.trim();
    andFilters.push({
      OR: [
        { city: { contains: loc, mode: "insensitive" } },
        { location: { contains: loc, mode: "insensitive" } },
        { workArrangement: WorkArrangement.REMOTE },
      ],
    });
  }

  if (country && country.trim().length > 0) {
    andFilters.push({ country: { equals: country.trim(), mode: "insensitive" } });
  }

  if (category && category !== "all") {
    andFilters.push({ category: { equals: category, mode: "insensitive" } });
  }

  if (targetType) {
    andFilters.push({ opportunityType: targetType });
  }

  if (arrangement) {
    andFilters.push({ workArrangement: arrangement });
  }

  if (paidOnly) {
    andFilters.push({ isPaidInternship: true });
  }

  if (verifiedOnly) {
    andFilters.push({ isVerified: true });
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  // SOLUTION 1: DATABASE-FIRST / CACHE-FIRST STRATEGY (Save API Quota)
  // Check local PostgreSQL database first. If we already have matches, do NOT call external APIs!
  if (params.refresh && (searchKeyword || targetCity)) {
    // Explicit refresh requested by user
    await syncLiveProviders({ keyword: searchKeyword, city: targetCity });
  } else if (searchKeyword || targetCity) {
    const localMatchesCount = await prisma.job.count({ where });
    if (localMatchesCount === 0) {
      // Only call external APIs when database has 0 matches for these criteria
      await syncLiveProviders({ keyword: searchKeyword, city: targetCity });
    }
  }

  // Sorting
  let orderBy: Prisma.JobOrderByWithRelationInput = { publicationDate: "desc" };
  if (sort === "recent") {
    orderBy = { publicationDate: "desc" };
  } else if (sort === "salary") {
    orderBy = { salaryMax: "desc" };
  }

  const skip = (page - 1) * limit;
  let total = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jobs: any[] = [];

  [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        skills: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            isVerified: true,
            phone: true,
            address: true,
            rating: true,
            googleMapsUrl: true,
          },
        },
        ...(userId
          ? {
              savedBy: {
                where: { userId },
                select: { id: true },
              },
              cvAnalyses: {
                where: { cv: { userId } },
                select: { overallScore: true, matchedSkills: true, missingSkills: true },
                take: 1,
              },
            }
          : {}),
      },
    }),
  ]);

  let suggestedReason: string | undefined = undefined;

  // Relaxation fallback: if strict combination yielded 0 results, find matching opportunities in Morocco or open in that city
  if (total === 0 && (rawTokens.length > 0 || targetCity)) {
    // 1. Try relaxing location constraint: find matching skills nationwide & remote
    const relaxedWhere: Prisma.JobWhereInput = {
      status: JobStatus.ACTIVE,
    };
    if (rawTokens.length > 0) {
      const kwFilter = andFilters.find(f => (f as { OR?: unknown }).OR);
      if (kwFilter) relaxedWhere.AND = [kwFilter];
    } else if (targetCity) {
      relaxedWhere.OR = [
        { city: { contains: targetCity.trim(), mode: "insensitive" } },
        { location: { contains: targetCity.trim(), mode: "insensitive" } },
      ];
    }

    const [relaxedTotal, relaxedJobs] = await Promise.all([
      prisma.job.count({ where: relaxedWhere }),
      prisma.job.findMany({
        where: relaxedWhere,
        skip,
        take: limit,
        orderBy,
        include: {
          skills: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              isVerified: true,
              phone: true,
              address: true,
              rating: true,
              googleMapsUrl: true,
            },
          },
        },
      }),
    ]);

    if (relaxedTotal > 0) {
      total = relaxedTotal;
      jobs = relaxedJobs;
      suggestedReason = targetCity
        ? `Aucune offre locale exclusive à ${targetCity} pour ces termes exacts. Voici les opportunités correspondantes disponibles au Maroc & en Télétravail.`
        : `Suggestions élargies pour vos critères de recherche.`;
    }
  }

  // Transform results with saved state and match score
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let formattedJobs = jobs.map((job: any) => ({
    ...job,
    isSaved: !!(job.savedBy && job.savedBy.length > 0),
    matchScore: job.cvAnalyses?.[0]?.overallScore || null,
    matchedSkills: job.cvAnalyses?.[0]?.matchedSkills || [],
  }));

  // If sort by match requested, sort in memory
  if (sort === "match") {
    formattedJobs = formattedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  return {
    jobs: formattedJobs,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    suggestedReason,
  };
}

export async function getJobById(id: string, userId?: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      skills: true,
      company: true,
      jobSource: true,
      ...(userId
        ? {
            savedBy: {
              where: { userId },
              select: { id: true },
            },
            cvAnalyses: {
              where: { cv: { userId } },
              take: 1,
            },
          }
        : {}),
    },
  });

  if (!job) return null;

  // Increment views count asynchronously
  prisma.job.update({
    where: { id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  // Fetch similar jobs
  const similarJobs = await prisma.job.findMany({
    where: {
      id: { not: id },
      status: JobStatus.ACTIVE,
      OR: [
        { category: job.category },
        { city: job.city },
        { opportunityType: job.opportunityType },
      ],
    },
    take: 3,
    include: {
      skills: true,
      company: true,
    },
  });

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...job,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isSaved: !!((job as any).savedBy && (job as any).savedBy.length > 0),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matchAnalysis: (job as any).cvAnalyses?.[0] || null,
    similarJobs,
  };
}
