import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toggleSaveJob } from "@/lib/services/saved-jobs-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Veuillez vous connecter pour sauvegarder une offre." }, { status: 401 });
    }

    const { id } = await params;
    const result = await toggleSaveJob(session.userId, id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Save job error:", error);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde." }, { status: 500 });
  }
}
