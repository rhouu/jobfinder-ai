import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/ai/ai-service";
import { CVParsedData } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise pour générer une lettre." }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Identifiant du poste manquant." }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "Poste introuvable." }, { status: 404 });
    }

    const cv = await prisma.cVDocument.findFirst({
      where: { userId: session.userId, isDeleted: false },
      orderBy: { createdAt: "desc" },
    });

    const cvData = (cv?.parsedData as unknown as CVParsedData) || {
      skills: ["Développement Web", "JavaScript", "Python"],
      education: [],
      experience: [],
      programmingLanguages: [],
      certifications: [],
      projects: [],
      languages: ["Français", "Anglais"],
      careerInterests: [],
    };

    const result = await generateCoverLetter(
      session.name,
      cvData,
      job.title,
      job.companyName,
      job.description
    );

    // Persist cover letter draft
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: session.userId,
        jobId: job.id,
        title: `Lettre de motivation - ${job.title}`,
        content: result.content,
        isAIGenerated: result.isAIGenerated,
      },
    });

    return NextResponse.json({
      success: true,
      coverLetter,
      content: result.content,
      isAIGenerated: result.isAIGenerated,
    });
  } catch (error) {
    console.error("Generate cover letter error:", error);
    return NextResponse.json({ error: "Erreur lors de la génération de la lettre." }, { status: 500 });
  }
}
