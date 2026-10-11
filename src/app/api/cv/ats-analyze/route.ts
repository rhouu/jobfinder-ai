import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CVParsedData } from "@/lib/validations";

export interface AtsAuditResult {
  score: number; // 0 - 100
  level: "Excellent" | "Très bon" | "Moyen" | "À améliorer";
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  breakdown: {
    formatting: number; // /25
    skillsImpact: number; // /35
    contactCompleteness: number; // /20
    educationExperience: number; // /20
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cvId = searchParams.get("cvId");

    const cv = await prisma.cVDocument.findFirst({
      where: {
        ...(cvId ? { id: cvId } : { userId: session.userId }),
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!cv) {
      return NextResponse.json({ error: "Aucun CV trouvé pour ce compte" }, { status: 404 });
    }

    const parsed = (cv.parsedData || {}) as unknown as CVParsedData;
    const rawText = cv.rawText || "";
    const lowerText = rawText.toLowerCase();

    // 1. Contact completeness (20 pts)
    let contactScore = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (parsed.email) {
      contactScore += 8;
      strengths.push("Adresse email professionnelle détectée");
    } else {
      weaknesses.push("Adresse email introuvable ou mal formatée");
      recommendations.push("Ajoutez une adresse email claire dans l'en-tête (ex: prenom.nom@gmail.com).");
    }

    if (parsed.phone) {
      contactScore += 8;
      strengths.push(`Numéro de téléphone marocain/international valide (${parsed.phone})`);
    } else {
      weaknesses.push("Numéro de téléphone manquant");
      recommendations.push("Indiquez votre numéro joignable au Maroc (+212 6... ou +212 7...).");
    }

    if (parsed.preferredLocation) {
      contactScore += 4;
      strengths.push(`Localisation géographique précisée (${parsed.preferredLocation})`);
    } else {
      recommendations.push("Mentionnez votre ville de résidence et votre mobilité (ex: Casablanca / Mobilité nationale).");
    }

    // 2. Formatting & Structure (25 pts)
    let formatScore = 15; // base for valid parsing
    if (rawText.length > 200 && rawText.length < 5000) {
      formatScore += 5;
      strengths.push("Longueur de document optimale pour les robots ATS (1 à 2 pages standard)");
    } else if (rawText.length < 200) {
      weaknesses.push("Contenu textuel trop court pour un filtrage efficace");
      recommendations.push("Enrichissez les descriptions de vos projets et de vos stages avec des verbes d'action.");
    }

    if (lowerText.includes("compétence") || lowerText.includes("skills") || lowerText.includes("technologies")) {
      formatScore += 5;
      strengths.push("Rubrique 'Compétences / Skills' bien identifiée par l'analyseur");
    } else {
      recommendations.push("Créez une section dédiée clairement titrée 'Compétences Techniques'.");
    }

    // 3. Skills Impact & Moroccan Market Relevance (35 pts)
    let skillsScore = 0;
    const numSkills = parsed.skills?.length || 0;
    if (numSkills >= 8) {
      skillsScore += 25;
      strengths.push(`Richesse des mots-clés techniques (${numSkills} compétences identifiées)`);
    } else if (numSkills >= 4) {
      skillsScore += 18;
      weaknesses.push(`Nombre modéré de technologies explicites (${numSkills} détectées)`);
      recommendations.push("Spécifiez plus de frameworks, outils et bibliothèques (ex: React, Docker, SQL, Git).");
    } else {
      skillsScore += 10;
      weaknesses.push("Peu de compétences clés détectées automatiquement");
      recommendations.push("Listez explicitement les technologies maîtrisées sans abréviations obscures.");
    }

    // Check languages (French, English, Arabic)
    const hasLang = (parsed.languages?.length || 0) >= 2;
    if (hasLang) {
      skillsScore += 10;
      strengths.push("Trilinguisme ou bilinguisme valorisé (atout majeur sur le marché marocain)");
    } else {
      weaknesses.push("Niveaux de langues peu visibles");
      recommendations.push("Indiquez clairement votre maîtrise du Français et de l'Anglais (ex: Français courant, Anglais technique).");
    }

    // 4. Education & Experience (20 pts)
    let eduExpScore = 0;
    const hasEdu = (parsed.education?.length || 0) > 0;
    const hasExp = (parsed.experience?.length || 0) > 0;

    if (hasEdu) {
      eduExpScore += 10;
      strengths.push("Formation académique ou diplôme d'études supérieures structuré");
    } else {
      weaknesses.push("Diplôme ou établissement formateur difficilement identifiable");
      recommendations.push("Mentionnez l'intitulé exact de votre diplôme (ex: Bac+5 Ingénieur, Master, DUT/BTS) et l'école (OFPPT, Faculté, ENSA...).");
    }

    if (hasExp) {
      eduExpScore += 10;
      strengths.push("Expérience professionnelle ou stages PFE/découverte bien répertoriés");
    } else {
      eduExpScore += 5;
      recommendations.push("Ajoutez vos projets académiques marquants ou stages même de courte durée.");
    }

    const totalScore = Math.min(100, Math.max(15, contactScore + formatScore + skillsScore + eduExpScore));

    let level: AtsAuditResult["level"] = "Moyen";
    if (totalScore >= 85) level = "Excellent";
    else if (totalScore >= 70) level = "Très bon";
    else if (totalScore >= 50) level = "Moyen";
    else level = "À améliorer";

    const audit: AtsAuditResult = {
      score: totalScore,
      level,
      strengths,
      weaknesses,
      recommendations,
      breakdown: {
        formatting: Math.min(25, formatScore),
        skillsImpact: Math.min(35, skillsScore),
        contactCompleteness: Math.min(20, contactScore),
        educationExperience: Math.min(20, eduExpScore),
      },
    };

    return NextResponse.json({ success: true, cvId: cv.id, fileName: cv.fileName, audit });
  } catch (error) {
    console.error("ATS audit error:", error);
    return NextResponse.json({ error: "Erreur lors de l'audit ATS du CV" }, { status: 500 });
  }
}
