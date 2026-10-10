import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise pour signaler une offre." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { reason, details } = body;

    if (!reason) {
      return NextResponse.json({ error: "Le motif du signalement est obligatoire." }, { status: 400 });
    }

    const report = await prisma.reportedJob.create({
      data: {
        jobId: id,
        reporterUserId: session.userId,
        reason,
        details,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Report job error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement du signalement." }, { status: 500 });
  }
}
