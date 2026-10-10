import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const { cvId } = await req.json();
    const cv = await prisma.cVDocument.findUnique({ where: { id: cvId } });
    if (!cv || cv.userId !== session.userId) {
      return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
    }

    // Permanently remove CV and associated analysis data
    await prisma.cVAnalysis.deleteMany({ where: { cvId } });
    await prisma.cVDocument.delete({ where: { id: cvId } });

    return NextResponse.json({ success: true, message: "CV et données associées supprimés avec succès." });
  } catch (error) {
    console.error("Delete CV error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}
