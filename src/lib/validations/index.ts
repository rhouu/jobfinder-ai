import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["JOB", "INTERNSHIP", "APPRENTICESHIP", "PART_TIME", "FREELANCE"]).optional(),
  arrangement: z.enum(["REMOTE", "HYBRID", "ONSITE"]).optional(),
  experience: z.string().optional(),
  paidOnly: z.coerce.boolean().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  sort: z.enum(["relevance", "recent", "salary", "match"]).default("relevance"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  refresh: z.coerce.boolean().optional(),
});

export type SearchParamsInput = z.infer<typeof searchParamsSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CANDIDATE", "EMPLOYER"]).default("CANDIDATE"),
  companyName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  companyName: z.string().min(2, "Company name is required"),
  companyLogo: z.string().url().optional().or(z.literal("")),
  description: z.string().min(20, "Description must be detailed"),
  responsibilities: z.array(z.string()).min(1, "At least one responsibility is required"),
  qualifications: z.array(z.string()).min(1, "At least one qualification is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  category: z.string().min(2, "Category is required"),
  opportunityType: z.enum(["JOB", "INTERNSHIP", "APPRENTICESHIP", "PART_TIME", "FREELANCE"]),
  workArrangement: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  location: z.string().min(2, "Location is required"),
  country: z.string().default("Morocco"),
  city: z.string().min(2, "City is required"),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryCurrency: z.string().default("MAD"),
  isPaidInternship: z.boolean().optional(),
  deadline: z.string().optional().nullable(),
  applicationMethod: z.enum(["EXTERNAL", "ASSISTED", "AUTO_APPLY"]).default("EXTERNAL"),
  officialApplyUrl: z.string().url().optional().or(z.literal("")),
  isInternalApply: z.boolean().default(false),
});

export const cvParsedDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).default([]),
  programmingLanguages: z.array(z.string()).default([]),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string().optional(),
      })
    )
    .default([]),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        period: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .default([]),
  certifications: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  preferredLocation: z.string().optional(),
  careerInterests: z.array(z.string()).default([]),
});

export type CVParsedData = z.infer<typeof cvParsedDataSchema>;

export const cvAnalysisResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  experienceScore: z.number().min(0).max(100),
  educationScore: z.number().min(0).max(100),
  explanation: z.string(),
  suggestions: z.array(z.string()),
});

export type CVAnalysisResponse = z.infer<typeof cvAnalysisResponseSchema>;

export const applicationSubmitSchema = z.object({
  jobId: z.string(),
  method: z.enum(["EXTERNAL", "ASSISTED", "AUTO_APPLY"]),
  cvDocumentId: z.string().optional(),
  coverLetterText: z.string().optional(),
  candidateApproved: z.boolean().default(true),
  externalConfirmed: z.boolean().default(false),
  notes: z.string().optional(),
});
