import { NextRequest, NextResponse } from "next/server";
import { searchParamsSchema } from "@/lib/validations";
import { searchJobs } from "@/lib/services/job-service";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = {
      q: searchParams.get("q") || undefined,
      location: searchParams.get("location") || undefined,
      country: searchParams.get("country") || undefined,
      city: searchParams.get("city") || undefined,
      category: searchParams.get("category") || undefined,
      type: searchParams.get("type") || undefined,
      arrangement: searchParams.get("arrangement") || undefined,
      experience: searchParams.get("experience") || undefined,
      paidOnly: searchParams.get("paidOnly") === "true",
      verifiedOnly: searchParams.get("verifiedOnly") === "true",
      sort: searchParams.get("sort") || "relevance",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 12,
      refresh: searchParams.get("refresh") === "true",
    };

    const parsed = searchParamsSchema.parse(rawParams);
    const session = await getSession();

    // If query exists and user is logged in, log search history
    if (session && parsed.q && parsed.q.trim().length > 1) {
      prisma.searchHistory.create({
        data: {
          userId: session.userId,
          query: parsed.q.trim(),
          filters: rawParams,
        },
      }).catch(() => {});
    }

    const results = await searchJobs(parsed, session?.userId);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Jobs search error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche." }, { status: 400 });
  }
}
