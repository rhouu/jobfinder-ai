import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé Gemini API non configurée." },
        { status: 500 }
      );
    }

    // Fetch context snippets from database to ground the AI: top jobs and companies
    const [recentJobs, featuredCompanies] = await Promise.all([
      prisma.job.findMany({
        where: { status: "ACTIVE" },
        take: 6,
        orderBy: { publicationDate: "desc" },
        select: {
          title: true,
          companyName: true,
          city: true,
          opportunityType: true,
          workArrangement: true,
        },
      }),
      prisma.company.findMany({
        take: 5,
        orderBy: { rating: "desc" },
        select: {
          name: true,
          city: true,
          industry: true,
          phone: true,
          rating: true,
        },
      }),
    ]);

    const platformContext = `
Données réelles de la plateforme JobFinder AI (Maroc & International) :
- Exemples d'offres récentes actives : ${recentJobs
      .map(
        (j) =>
          `"${j.title}" chez ${j.companyName} (${j.city || "Maroc"}, ${j.opportunityType}, ${j.workArrangement})`
      )
      .join("; ")}
- Exemples d'entreprises vérifiées : ${featuredCompanies
      .map(
        (c) =>
          `${c.name} (${c.industry || "Services"} à ${c.city}, Note: ${c.rating || "4.5"}★, Tel: ${c.phone || "Vérifié"})`
      )
      .join("; ")}
`;

    const systemPrompt = `Tu es "JobFinder AI Assistant", le conseiller carrière, coach en recrutement et expert B2B officiel de la plateforme JobFinder AI & LeadFinder au Maroc.

Tes missions :
1. Aider les étudiants, lauréats et professionnels à trouver des emplois et stages au Maroc (Casablanca, Rabat, Marrakech, Tanger, etc.) et en Télétravail.
2. Conseiller sur la rédaction de CV, lettres de motivation, entretiens d'embauche et négociation salariale.
3. Répondre aux questions sur les entreprises répertoriées, la prospection B2B (LeadFinder), et la digitalisation des entreprises.
4. Répondre en Français ou en Darija marocain selon la langue de l'utilisateur, avec un ton professionnel, encourageant, courtois et dynamique.
5. Être précis, concis et formater tes réponses avec des puces élégantes et du markdown clair.

${platformContext}
${userContext ? `Profil utilisateur actuel : ${JSON.stringify(userContext)}` : ""}
`;

    // Convert messages to Gemini contents format
    // Map conversation history
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Bonjour ! Je suis JobFinder AI Assistant, votre conseiller carrière et recrutement au Maroc. Comment puis-je vous aider aujourd'hui ?",
          },
        ],
      },
      ...messages.slice(-8).map((m: ChatMessage) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    // Priority models with live fallback
    const models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let replyText = "";
    let lastError: Error | null = null;
    const cleanApiKey = apiKey.replace(/^["']|["']$/g, "").trim();

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanApiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        });

        if (!response.ok) {
          throw new Error(`Gemini ${model} HTTP ${response.status}`);
        }

        const data = await response.json();
        replyText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Je suis là pour vous accompagner. Que recherchez-vous comme opportunité ?";
        if (replyText) break;
      } catch (err) {
        lastError = err as Error;
      }
    }

    if (!replyText) {
      throw lastError || new Error("Gemini generation failed");
    }

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply:
          "Je rencontre une brève difficulté de connexion avec le service IA. N'hésitez pas à reformuler votre question ou à explorer directement les offres sur la page /jobs !",
      },
      { status: 200 }
    );
  }
}
