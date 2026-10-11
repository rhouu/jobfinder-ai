import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface InterviewQuestion {
  question: string;
  category: "Technique" | "Comportemental / RH" | "Mise en situation";
  recommendedAnswer: string;
  trapToAvoid: string;
}

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Identifiant du poste manquant" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { skills: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `Tu es le Directeur des Ressources Humaines et Lead Recruteur au Maroc pour une grande entreprise (style Capgemini, OCP, SG ABS, CDG, Devoteam).
Génère une simulation d'entretien d'embauche pour le poste suivant :
Titre : ${job.title}
Entreprise : ${job.companyName}
Compétences requises : ${job.skills.map((s) => s.skill).join(", ") || job.category}
Description : ${job.description.slice(0, 500)}

Retourne STRICTEMENT un tableau JSON de 5 questions/réponses au format suivant, sans balises markdown ni code fences :
[
  {
    "question": "Intitulé précis de la question",
    "category": "Technique" ou "Comportemental / RH" ou "Mise en situation",
    "recommendedAnswer": "La structure idéale de réponse en valorisant des exemples concrets marocains et internationaux",
    "trapToAvoid": "L'erreur classique des candidats à éviter absolument"
  }
]`;

    let questions: InterviewQuestion[] = [];

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            questions = JSON.parse(text);
          }
        }
      } catch (aiErr) {
        console.warn("AI generation error, using curated Moroccan templates:", aiErr);
      }
    }

    // High quality deterministic fallback if AI key missing or rate-limited
    if (!questions || questions.length === 0) {
      questions = [
        {
          question: `Pouvez-vous nous parler d'un projet où vous avez utilisé ${job.skills[0]?.skill || "les technologies clés du poste"} ?`,
          category: "Technique",
          recommendedAnswer: "Utilisez la méthode STAR (Situation, Tâche, Action, Résultat). Décrivez les défis techniques rencontrés et l'impact mesurable (performance, fiabilité).",
          trapToAvoid: "Rester trop théorique sans mentionner de chiffres, d'architecture ou de résultat concret.",
        },
        {
          question: `Comment abordez-vous le travail en équipe sous méthodologie Agile chez ${job.companyName} ?`,
          category: "Comportemental / RH",
          recommendedAnswer: "Valorisez votre communication, la participation active aux cérémonies (Daily, Sprint Review), et votre capacité d'écoute et d'entraide.",
          trapToAvoid: "Donner l'impression de travailler de manière isolée sans chercher le feedback de l'équipe.",
        },
        {
          question: "Face à un bug critique en production à quelques heures d'une livraison, comment réagissez-vous ?",
          category: "Mise en situation",
          recommendedAnswer: "Gardez votre sang-froid : isoler le problème, rollback si nécessaire, communiquer avec les parties prenantes, puis documenter la résolution (Post-mortem).",
          trapToAvoid: "Paniquer ou accuser un collègue sans proposer de plan d'action immédiat.",
        },
        {
          question: `Pourquoi souhaitez-vous rejoindre ${job.companyName} et quelles sont vos prétentions salariales en MAD ?`,
          category: "Comportemental / RH",
          recommendedAnswer: "Démontrez que vous connaissez les projets et l'écosystème de l'entreprise. Donnez une fourchette salariale réaliste basée sur les standards du marché au Maroc.",
          trapToAvoid: "Dire 'n'importe quel salaire me convient' ou au contraire donner un montant déconnecté du marché marocain.",
        },
        {
          question: "Comment assurez-vous votre veille technologique et la montée en compétences ?",
          category: "Technique",
          recommendedAnswer: "Citez des blogs techniques, certifications récentes, contributions open-source ou projets personnels d'exploration.",
          trapToAvoid: "Dire que vous n'apprenez que ce que l'entreprise vous demande d'apprendre.",
        },
      ];
    }

    return NextResponse.json({ success: true, jobTitle: job.title, questions });
  } catch (error) {
    console.error("Interview prep error:", error);
    return NextResponse.json({ error: "Erreur lors de la simulation d'entretien" }, { status: 500 });
  }
}
