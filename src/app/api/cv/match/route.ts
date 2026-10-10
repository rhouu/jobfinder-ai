import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchCVWithJob } from "@/lib/ai/ai-service";
import { CVParsedData } from "@/lib/validations";
import { JobStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Connexion requise pour lancer le matching IA." }, { status: 401 });
    }

    const body = await req.json();
    const { cvId, jobId } = body;

    const cv = await prisma.cVDocument.findFirst({
      where: {
        ...(cvId ? { id: cvId } : { userId: session.userId }),
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!cv) {
      return NextResponse.json({ error: "Aucun CV actif trouvé. Veuillez d'abord déposer un CV." }, { status: 404 });
    }

    const cvData = cv.parsedData as unknown as CVParsedData;

    // If specific jobId provided, match against that job
    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { skills: true },
      });

      if (!job) {
        return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
      }

      const matchResult = await matchCVWithJob(cvData, {
        title: job.title,
        companyName: job.companyName,
        description: job.description,
        skills: job.skills.map((s) => s.skill),
        category: job.category,
        location: job.location,
        opportunityType: job.opportunityType,
        educationRequirements: job.educationRequirements,
        experienceRequirements: job.experienceRequirements,
      });

      const analysis = await prisma.cVAnalysis.upsert({
        where: {
          cvId_jobId: { cvId: cv.id, jobId: job.id },
        },
        update: {
          overallScore: matchResult.overallScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          experienceScore: matchResult.experienceScore,
          educationScore: matchResult.educationScore,
          explanation: matchResult.explanation,
          suggestions: matchResult.suggestions,
        },
        create: {
          cvId: cv.id,
          jobId: job.id,
          overallScore: matchResult.overallScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          experienceScore: matchResult.experienceScore,
          educationScore: matchResult.educationScore,
          explanation: matchResult.explanation,
          suggestions: matchResult.suggestions,
        },
      });

      return NextResponse.json({ success: true, analysis, matchResult });
    }

    // Match against top active jobs for batch scoring
    const activeJobs = await prisma.job.findMany({
      where: { status: JobStatus.ACTIVE },
      include: { skills: true },
      take: 20,
    });

    const analyses = [];
    for (const job of activeJobs) {
      const matchResult = await matchCVWithJob(cvData, {
        title: job.title,
        companyName: job.companyName,
        description: job.description,
        skills: job.skills.map((s) => s.skill),
        category: job.category,
        location: job.location,
        opportunityType: job.opportunityType,
        educationRequirements: job.educationRequirements,
        experienceRequirements: job.experienceRequirements,
      });

      const saved = await prisma.cVAnalysis.upsert({
        where: {
          cvId_jobId: { cvId: cv.id, jobId: job.id },
        },
        update: {
          overallScore: matchResult.overallScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          experienceScore: matchResult.experienceScore,
          educationScore: matchResult.educationScore,
          explanation: matchResult.explanation,
          suggestions: matchResult.suggestions,
        },
        create: {
          cvId: cv.id,
          jobId: job.id,
          overallScore: matchResult.overallScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          experienceScore: matchResult.experienceScore,
          educationScore: matchResult.educationScore,
          explanation: matchResult.explanation,
          suggestions: matchResult.suggestions,
        },
      });
      analyses.push(saved);
    }

    return NextResponse.json({ success: true, count: analyses.length, analyses });
  } catch (error) {
    console.error("CV Match error:", error);
    return NextResponse.json({ error: "Erreur lors du calcul de correspondance." }, { status: 500 });
  }
}
