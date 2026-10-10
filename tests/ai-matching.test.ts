import { describe, it, expect } from "vitest";
import { matchDeterministic } from "@/lib/ai/ai-service";

describe("CV AI Matching Engine", () => {
  it("calculates high score when skills and location overlap strongly", () => {
    const cvData = {
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
      programmingLanguages: ["TypeScript", "JavaScript"],
      education: [{ degree: "Ingénieur", institution: "ENSIAS" }],
      experience: [{ title: "Développeur", company: "StartUp" }],
      certifications: [],
      projects: [],
      languages: ["Français", "Anglais"],
      preferredLocation: "Casablanca, Maroc",
      careerInterests: ["Web Development"],
    };

    const job = {
      title: "Développeur Fullstack React / TypeScript",
      companyName: "Tech Corp",
      description: "Poste Fullstack basé à Casablanca",
      skills: ["React", "TypeScript", "PostgreSQL"],
      category: "Informatique & Tech",
      location: "Casablanca, Maroc",
      opportunityType: "JOB",
    };

    const result = matchDeterministic(cvData, job);

    expect(result.overallScore).toBeGreaterThanOrEqual(70);
    expect(result.matchedSkills).toContain("React");
    expect(result.matchedSkills).toContain("TypeScript");
    expect(result.matchedSkills).toContain("PostgreSQL");
    expect(result.missingSkills.length).toBe(0);
  });

  it("identifies missing skills accurately", () => {
    const cvData = {
      skills: ["Python", "Pandas"],
      programmingLanguages: ["Python"],
      education: [],
      experience: [],
      certifications: [],
      projects: [],
      languages: [],
      careerInterests: [],
    };

    const job = {
      title: "Mobile Flutter Engineer",
      companyName: "Mobile Agency",
      description: "Flutter application development",
      skills: ["Flutter", "Dart", "Swift"],
      category: "Mobile",
      location: "Rabat",
      opportunityType: "JOB",
    };

    const result = matchDeterministic(cvData, job);

    expect(result.matchedSkills.length).toBe(0);
    expect(result.missingSkills).toContain("Flutter");
    expect(result.missingSkills).toContain("Dart");
    expect(result.overallScore).toBeLessThan(50);
  });
});
