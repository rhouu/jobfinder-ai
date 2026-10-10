import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTextFromFile, parseCVTextDeterministic } from "@/lib/cv/cv-parser";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Veuillez vous connecter pour importer votre CV." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const consent = formData.get("consent") === "true";

    if (!consent) {
      return NextResponse.json(
        { error: "Vous devez accepter le traitement de vos données pour analyser votre CV." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Le fichier dépasse la taille maximale autorisée (5 Mo)." }, { status: 400 });
    }

    const mimeType = file.type;
    const fileName = file.name;
    const validExtensions = [".pdf", ".docx", ".doc"];
    const hasValidExt = validExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      return NextResponse.json(
        { error: "Format non supporté. Seuls les fichiers PDF et DOCX sont acceptés." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Secure extraction
    const rawText = await extractTextFromFile(buffer, mimeType, fileName);
    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "Impossible de lire le contenu texte du fichier. Vérifiez que le document n'est pas scanné comme une simple image." },
        { status: 400 }
      );
    }

    // Parse structured data
    const parsedData = parseCVTextDeterministic(rawText);

    // Save CV document
    const cvDoc = await prisma.cVDocument.create({
      data: {
        userId: session.userId,
        fileName,
        fileUrl: `/uploads/${session.userId}-${Date.now()}-${fileName}`,
        fileSize: file.size,
        mimeType,
        rawText,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parsedData: parsedData as any,
        consentGiven: true,
      },
    });

    // Update candidate profile skills with newly parsed skills
    if (parsedData.skills.length > 0) {
      await prisma.candidateProfile.upsert({
        where: { userId: session.userId },
        update: {
          skills: parsedData.skills,
          preferredLocation: parsedData.preferredLocation,
        },
        create: {
          userId: session.userId,
          skills: parsedData.skills,
          preferredLocation: parsedData.preferredLocation,
        },
      });
    }

    return NextResponse.json({
      success: true,
      cvDocument: cvDoc,
      parsedData,
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json({ error: "Erreur lors du traitement du document." }, { status: 500 });
  }
}
