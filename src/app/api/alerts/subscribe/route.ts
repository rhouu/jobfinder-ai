import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendApplicationEmail } from "@/lib/email/brevo";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, city, category } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Adresse email valide requise" }, { status: 400 });
    }

    // Confirmation email via Brevo
    await sendApplicationEmail({
      toEmail: email,
      candidateName: "Abonné JobFinder AI",
      candidateEmail: email,
      candidatePhone: phone || null,
      jobTitle: `Alerte Activée : ${category || "Toutes opportunités"} (${city || "Maroc"})`,
      companyName: "JobFinder AI Alerts",
      coverLetterHtml: `
        <h3>Votre Alerte Recrutement est désormais active !</h3>
        <p>Vous recevrez quotidiennement par email et WhatsApp les nouvelles opportunités correspondant à vos critères :</p>
        <ul>
          <li><strong>Domaine :</strong> ${category || "Toutes filières"}</li>
          <li><strong>Ville :</strong> ${city || "Toutes les villes du Maroc & Remote"}</li>
        </ul>
        <p>Merci de votre confiance et bonne réussite dans vos projets professionnels !</p>
      `,
    }).catch((err) => console.warn("Alert confirmation email dispatch error:", err));

    return NextResponse.json({
      success: true,
      message: `Alerte activée pour ${email}. Vous recevrez les prochaines opportunités automatiquement.`,
    });
  } catch (error) {
    console.error("Alert subscribe error:", error);
    return NextResponse.json({ error: "Erreur lors de l'activation de l'alerte" }, { status: 500 });
  }
}
