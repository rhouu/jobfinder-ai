import { describe, it, expect } from "vitest";
import { parseCVTextDeterministic } from "@/lib/cv/cv-parser";

describe("CV Parser Engine", () => {
  it("extracts email, phone, and technical skills from CV text", () => {
    const sampleText = `
      Ahmed El Idrissi
      Email: ahmed.idrissi@gmail.com
      Téléphone: +212 661 23 45 67
      Compétences: React, Next.js, TypeScript, Python, Docker, PostgreSQL, Git.
      Formation: Diplôme d'ingénieur en génie informatique (2024).
      Expérience: Stage développeur web chez TechMaroc.
      Langues: Français, Anglais, Arabe.
    `;

    const parsed = parseCVTextDeterministic(sampleText);

    expect(parsed.email).toBe("ahmed.idrissi@gmail.com");
    expect(parsed.phone).toBe("+212 661 23 45 67");
    expect(parsed.skills).toContain("React");
    expect(parsed.skills).toContain("TypeScript");
    expect(parsed.skills).toContain("Python");
    expect(parsed.skills).toContain("Docker");
    expect(parsed.languages).toContain("French");
    expect(parsed.languages).toContain("Arabic");
  });
});
