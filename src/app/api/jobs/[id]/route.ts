import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/lib/services/job-service";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const job = await getJobById(id, session?.userId);

    if (!job) {
      return NextResponse.json({ error: "Opportunité introuvable." }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Job detail error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement de l'offre." }, { status: 500 });
  }
}
