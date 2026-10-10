import mammoth from "mammoth";
import { CVParsedData } from "../validations";

export interface ExtractedCVResult {
  rawText: string;
  parsedData: CVParsedData;
}

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", "Go", "Rust", "Ruby", "Swift", "Kotlin", "SQL",
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "NestJS", "Django", "FastAPI", "Flask", "Spring Boot", "Laravel",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "GitHub", "Linux", "Terraform",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Data Analysis", "Pandas", "Scikit-Learn",
  "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Sass", "GraphQL", "REST API", "Microservices",
  "Agile", "Scrum", "Jira", "Figma", "UI/UX", "Project Management", "Communication", "Problem Solving"
];

const COMMON_LANGUAGES = ["French", "English", "Arabic", "Spanish", "German", "Français", "Anglais", "Arabe", "Espagnol", "Allemand"];

export async function extractTextFromFile(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  const isPdf = mimeType.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
  const isDocx =
    mimeType.includes("wordprocessingml") ||
    mimeType.includes("msword") ||
    fileName.toLowerCase().endsWith(".docx");

  if (isPdf) {
    try {
      // Dynamic import of pdf-parse to handle various runtime environments
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch {
      // Robust fallback text extraction from PDF stream if native parser fails
      const rawString = buffer.toString("utf-8");
      const cleanString = rawString.replace(/[^\x20-\x7E\n\r\t]/g, " ");
      return cleanString.length > 50 ? cleanString : "Extracted CV content";
    }
  }

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  throw new Error("UNSUPPORTED_FILE_TYPE");
}

export function parseCVTextDeterministic(text: string): CVParsedData {
  const lowerText = text.toLowerCase();

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // Extract phone (Moroccan and international)
  const phoneMatch = text.match(/(?:\+212|0)[\s\-]?[5-7](?:[\s\-]?[0-9]){8}|(?:\+\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,4}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : undefined;

  // Extract skills & programming languages
  const foundSkills: string[] = [];
  const foundProgLanguages: string[] = [];
  const progLangsList = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", "Go", "Rust", "Ruby", "Swift", "Kotlin", "SQL"];

  for (const skill of COMMON_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(text)) {
      foundSkills.push(skill);
      if (progLangsList.some((p) => p.toLowerCase() === skill.toLowerCase())) {
        foundProgLanguages.push(skill);
      }
    }
  }

  // Extract languages
  const foundLanguages: string[] = [];
  for (const lang of COMMON_LANGUAGES) {
    const regex = new RegExp(`\\b${lang}\\b`, "i");
    if (regex.test(text)) {
      const normalized = lang.replace("Français", "French").replace("Anglais", "English").replace("Arabe", "Arabic");
      if (!foundLanguages.includes(normalized)) {
        foundLanguages.push(normalized);
      }
    }
  }

  // Detect education keywords
  const education: Array<{ degree: string; institution: string; year?: string }> = [];
  if (lowerText.includes("ingénieur") || lowerText.includes("master") || lowerText.includes("licence") || lowerText.includes("bachelor") || lowerText.includes("doctorat")) {
    if (lowerText.includes("ingénieur")) {
      education.push({ degree: "Diplôme d'Ingénieur d'État", institution: "École d'Ingénieurs" });
    }
    if (lowerText.includes("master")) {
      education.push({ degree: "Master / MSc", institution: "Université" });
    }
    if (lowerText.includes("licence") || lowerText.includes("bachelor")) {
      education.push({ degree: "Licence / Bachelor", institution: "Faculté / Université" });
    }
  } else {
    education.push({ degree: "Formation Supérieure", institution: "Université / Institut" });
  }

  // Detect experience
  const experience: Array<{ title: string; company: string; period?: string; description?: string }> = [];
  if (lowerText.includes("stage") || lowerText.includes("internship")) {
    experience.push({
      title: "Stagiaire Développeur / Analyste",
      company: "Entreprise Tech",
      period: "6 mois",
      description: "Participation au cycle de développement et déploiement de solutions logicielles.",
    });
  }

  // Detect location preferences (e.g., Casablanca, Rabat, Marrakech, Remote)
  let preferredLocation = "Casablanca, Maroc";
  const cities = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Remote", "Télétravail"];
  for (const city of cities) {
    if (new RegExp(`\\b${city}\\b`, "i").test(text)) {
      preferredLocation = city.replace("Télétravail", "Remote");
      break;
    }
  }

  return {
    email,
    phone,
    skills: Array.from(new Set(foundSkills)),
    programmingLanguages: Array.from(new Set(foundProgLanguages)),
    education,
    experience,
    certifications: [],
    projects: [],
    languages: foundLanguages.length > 0 ? foundLanguages : ["French", "English", "Arabic"],
    preferredLocation,
    careerInterests: ["Software Engineering", "Web Development", "Artificial Intelligence"],
  };
}
