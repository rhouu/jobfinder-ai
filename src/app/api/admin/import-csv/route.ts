import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { upsertNormalizedJob } from "@/lib/sources/sync-manager";
import { OpportunityType, WorkArrangement, ApplicationMethod } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const { csvData } = await req.json();
    if (!csvData || typeof csvData !== "string") {
      return NextResponse.json({ error: "Contenu CSV invalide." }, { status: 400 });
    }

    const lines = csvData.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ error: "Le fichier CSV doit contenir un en-tête et au moins une ligne." }, { status: 400 });
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, index) => {
        row[h] = values[index] || "";
      });

      if (!row["title"] || !row["company"]) continue;

      const oppType =
        row["type"]?.toUpperCase() === "INTERNSHIP"
          ? OpportunityType.INTERNSHIP
          : OpportunityType.JOB;

      await upsertNormalizedJob({
        externalId: `csv-${Date.now()}-${i}`,
        sourceProvider: "ADMIN_CSV_IMPORT",
        title: row["title"],
        companyName: row["company"],
        description: row["description"] || `Opportunité chez ${row["company"]}`,
        responsibilities: [row["responsibilities"] || "Consulter l'offre détaillée"],
        qualifications: [row["qualifications"] || "Profil qualifié requis"],
        skills: row["skills"] ? row["skills"].split(";").map((s) => s.trim()) : ["Général"],
        category: row["category"] || "Autre",
        opportunityType: oppType,
        workArrangement: WorkArrangement.ONSITE,
        location: row["location"] || "Casablanca, Maroc",
        country: row["country"] || "Morocco",
        city: row["city"] || "Casablanca",
        publicationDate: new Date(),
        applicationMethod: ApplicationMethod.EXTERNAL,
        officialApplyUrl: row["url"] || undefined,
        isVerified: true,
      });

      importedCount++;
    }

    return NextResponse.json({ success: true, importedCount });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Erreur lors de l'import CSV." }, { status: 500 });
  }
}
