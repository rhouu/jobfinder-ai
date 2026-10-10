import { describe, it, expect } from "vitest";
import { parseNaturalLanguageQuery } from "@/lib/services/job-service";
import { OpportunityType } from "@prisma/client";

describe("Natural Language Query Parser", () => {
  it("detects city and opportunity type from French query", () => {
    const result = parseNaturalLanguageQuery("Stage Python à Marrakech pour débutant");
    expect(result.detectedCity).toBe("Marrakech");
    expect(result.detectedType).toBe(OpportunityType.INTERNSHIP);
    expect(result.keyword.toLowerCase()).toContain("python");
  });

  it("detects Casablanca and PFE internship", () => {
    const result = parseNaturalLanguageQuery("PFE Data Science à Casablanca");
    expect(result.detectedCity).toBe("Casablanca");
    expect(result.detectedType).toBe(OpportunityType.INTERNSHIP);
  });

  it("detects Remote and CDI job", () => {
    const result = parseNaturalLanguageQuery("Emploi Fullstack Remote");
    expect(result.detectedCity).toBe("Remote");
    expect(result.detectedType).toBe(OpportunityType.JOB);
  });
});
