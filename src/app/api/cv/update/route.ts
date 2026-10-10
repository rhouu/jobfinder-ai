import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json();
    const { cvId, parsedData } = body;

    const cv = await prisma.cVDocument.findUnique({ where: { id: cvId } });
    if (!cv || cv.userId !== session.userId) {
      return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
    }

    const updatedCv = await prisma.cVDocument.update({
      where: { id: cvId },
      data: {
        parsedData,
      },
    });

    // Update profile
    if (parsedData.skills) {
      await prisma.candidateProfile.update({
        where: { userId: session.userId },
        data: {
          skills: parsedData.skills,
        },
      });
    }

    return NextResponse.json({ success: true, cv: updatedCv });
  } catch (error) {
    console.error("Update CV error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
}
