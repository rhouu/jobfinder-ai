import { CVParsedData, CVAnalysisResponse, cvAnalysisResponseSchema } from "../validations";

export interface JobMatchInput {
  title: string;
  companyName: string;
  description: string;
  skills: string[];
  category: string;
  location: string;
  opportunityType: string;
  educationRequirements?: string | null;
  experienceRequirements?: string | null;
}

export interface MatchResult extends CVAnalysisResponse {
  isAiPowered: boolean;
  provider: "gemini" | "openai" | "deterministic-fallback";
}

export async function matchCVWithJob(
  cvData: CVParsedData,
  job: JobMatchInput
): Promise<MatchResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const result = await matchWithGemini(cvData, job, geminiKey);
      return { ...result, isAiPowered: true, provider: "gemini" };
    } catch (e) {
      console.error("Gemini AI matching error, using deterministic fallback:", e);
    }
  }

  if (openAiKey) {
    try {
      const result = await matchWithOpenAI(cvData, job, openAiKey);
      return { ...result, isAiPowered: true, provider: "openai" };
    } catch (e) {
      console.error("OpenAI matching error, using deterministic fallback:", e);
    }
  }

  // Transparent, non-hallucinating deterministic fallback
  const fallbackResult = matchDeterministic(cvData, job);
  return {
    ...fallbackResult,
    isAiPowered: false,
    provider: "deterministic-fallback",
  };
}

export function matchDeterministic(
  cvData: CVParsedData,
  job: JobMatchInput
): CVAnalysisResponse {
  const cvSkills = (cvData.skills || []).map((s) => s.toLowerCase());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of job.skills) {
    const isMatched = cvSkills.some(
      (cs) => cs === skill.toLowerCase() || cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs)
    );
    if (isMatched) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  // Skill score calculation
  const totalJobSkills = job.skills.length || 1;
  const skillRatio = matched.length / totalJobSkills;
  const skillScore = Math.round(skillRatio * 60); // 60% weight

  // Location compatibility check
  const cvLoc = (cvData.preferredLocation || "").toLowerCase();
  const jobLoc = (job.location || "").toLowerCase();
  const locationMatch =
    jobLoc.includes("remote") ||
    cvLoc.includes(jobLoc) ||
    jobLoc.includes(cvLoc) ||
    cvLoc.includes("maroc") ||
    cvLoc.includes("morocco");
  const locationScore = locationMatch ? 15 : 5; // 15% weight

  // Experience level estimation
  const experienceScore = cvData.experience && cvData.experience.length > 0 ? 15 : 10; // 15% weight
  const educationScore = cvData.education && cvData.education.length > 0 ? 10 : 5; // 10% weight

  const overallScore = Math.min(100, Math.max(10, skillScore + locationScore + experienceScore + educationScore));

  const explanation =
    matched.length > 0
      ? `Correspondance déterministe basée sur ${matched.length} compétence(s) en commun (${matched.slice(0, 3).join(", ")}). La localisation et l'expérience concordent.`
      : `Correspondance partielle basée sur les mots-clés du profil. Les compétences spécifiques requises (${missing.slice(0, 3).join(", ")}) méritent d'être approfondies.`;

  const suggestions: string[] = [];
  if (missing.length > 0) {
    suggestions.push(`Acquérir ou valoriser les compétences suivantes : ${missing.slice(0, 3).join(", ")}.`);
  }
  suggestions.push("Mettre en valeur des projets concrets démontrant la maîtrise des technologies requises.");
  suggestions.push("Adapter les mots-clés du CV au descriptif précis du poste pour maximiser l'impact.");

  return {
    overallScore,
    matchedSkills: matched,
    missingSkills: missing,
    experienceScore: Math.round((experienceScore / 15) * 100),
    educationScore: Math.round((educationScore / 10) * 100),
    explanation,
    suggestions,
  };
}

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];

async function callGemini(prompt: string, apiKey: string, jsonMode = false): Promise<string> {
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: Record<string, unknown> = {
        contents: [{ parts: [{ text: prompt }] }],
      };
      if (jsonMode) {
        payload.generationConfig = { responseMimeType: "application/json" };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Gemini ${model} failed with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      lastError = err as Error;
      // Try next model in list
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

async function matchWithGemini(
  cvData: CVParsedData,
  job: JobMatchInput,
  apiKey: string
): Promise<CVAnalysisResponse> {
  const prompt = `You are a recruitment AI assistant for JobFinder AI. Compare the candidate's CV data with the job posting requirements objectively. Return ONLY a valid JSON object without markdown or code fences.

JSON structure:
{
  "overallScore": number (0-100),
  "matchedSkills": string[],
  "missingSkills": string[],
  "experienceScore": number (0-100),
  "educationScore": number (0-100),
  "explanation": string,
  "suggestions": string[]
}

Candidate CV data:
${JSON.stringify(cvData)}

Job Posting:
${JSON.stringify(job)}`;

  const rawText = await callGemini(prompt, apiKey, true);
  const cleanJson = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleanJson);
  return cvAnalysisResponseSchema.parse(parsed);
}

async function matchWithOpenAI(
  cvData: CVParsedData,
  job: JobMatchInput,
  apiKey: string
): Promise<CVAnalysisResponse> {
  const prompt = `Compare candidate CV and job posting. Return ONLY JSON matching:
{
  "overallScore": number (0-100),
  "matchedSkills": string[],
  "missingSkills": string[],
  "experienceScore": number (0-100),
  "educationScore": number (0-100),
  "explanation": string,
  "suggestions": string[]
}

Candidate: ${JSON.stringify(cvData)}
Job: ${JSON.stringify(job)}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty OpenAI response");

  const parsed = JSON.parse(text);
  return cvAnalysisResponseSchema.parse(parsed);
}

export async function generateCoverLetter(
  candidateName: string,
  cvData: CVParsedData,
  jobTitle: string,
  companyName: string,
  jobDescription: string
): Promise<{ content: string; isAIGenerated: boolean }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const prompt = `Rédige une lettre de motivation professionnelle, élégante et percutante en français pour le poste de "${jobTitle}" chez "${companyName}".
Le candidat s'appelle "${candidateName}".
Ses compétences et expériences clés : ${cvData.skills.join(", ")}.
Descriptif du poste : ${jobDescription.slice(0, 500)}.
La lettre doit comporter une introduction captivante, l'adéquation des compétences avec les missions, et une conclusion chaleureuse invitant à un entretien. Rédige directement le corps de la lettre sans préambule ni métadonnées.`;

      const letterText = await callGemini(prompt, geminiKey, false);
      if (letterText && letterText.trim().length > 50) {
        return { content: letterText.trim(), isAIGenerated: true };
      }
    } catch (e) {
      console.warn("Gemini cover letter generation failed, falling back to template:", e);
    }
  }

  // High quality structured template fallback
  const skillsList = cvData.skills.slice(0, 4).join(", ") || "développement web et technologies modernes";
  const letter = `Madame, Monsieur,

Je vous adresse ma candidature avec un vif enthousiasme pour le poste de ${jobTitle} au sein de ${companyName}.

Fort(e) de mon parcours et de ma passion pour l'innovation, j'ai développé une solide maîtrise technique dans des domaines clés tels que : ${skillsList}. Vos réalisations récentes et la culture d'excellence de ${companyName} résonnent parfaitement avec mes aspirations professionnelles.

Motivé(e) par la perspective de contribuer activement à vos projets et de relever ensemble de nouveaux défis stimulants, je serais ravi(e) d'échanger avec vous lors d'un entretien pour vous exposer plus en détail mes motivations et ma vision.

En vous remerciant pour l'attention portée à ma candidature, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${candidateName || "Le Candidat"}`;

  return { content: letter, isAIGenerated: false };
}
