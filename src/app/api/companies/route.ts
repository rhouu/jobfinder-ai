import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { googlePlacesService } from "@/lib/services/google-places-service";
import { JobStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const explorePlaces = searchParams.get("places") === "true";

    // If explicit live Google Places exploration is requested
    if (explorePlaces && (query || city)) {
      try {
        const places = await googlePlacesService.searchEnterprises({
          query: query || "entreprises informatique et technologie",
          city: city || "Casablanca",
          pageSize: 10,
        });
        if (places.length > 0) {
          await googlePlacesService.ingestEnterprises(places);
        }
      } catch (err) {
        console.error("Live Google Places search error:", err);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { industry: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            jobs: {
              where: { status: JobStatus.ACTIVE },
            },
          },
        },
      },
      orderBy: [
        { isVerified: "desc" },
        { rating: "desc" },
        { createdAt: "desc" },
      ],
      take: 50,
    });

    return NextResponse.json({
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        logoUrl: c.logoUrl,
        description: c.description,
        website: c.website,
        industry: c.industry,
        location: c.location,
        city: c.city,
        country: c.country,
        address: c.address,
        phone: c.phone,
        rating: c.rating,
        googleMapsUrl: c.googleMapsUrl,
        isVerified: c.isVerified,
        jobsCount: c._count.jobs,
      })),
      total: companies.length,
    });
  } catch (error) {
    console.error("Get companies error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des entreprises." }, { status: 500 });
  }
}
