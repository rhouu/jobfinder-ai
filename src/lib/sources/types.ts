import { OpportunityType, WorkArrangement, ApplicationMethod } from "@prisma/client";

export interface NormalizedJob {
  externalId: string;
  sourceProvider: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  category: string;
  opportunityType: OpportunityType;
  workArrangement: WorkArrangement;
  location: string;
  country: string;
  city: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  isPaidInternship?: boolean;
  publicationDate: Date;
  deadline?: Date;
  applicationMethod: ApplicationMethod;
  officialApplyUrl?: string;
  sourceUrl?: string;
  isVerified: boolean;
}

export interface JobSourceAdapter {
  providerName: string;
  isConfigured(): boolean;
  healthCheck(): Promise<{ ok: boolean; message: string }>;
  fetchJobs(params?: { query?: string; location?: string; limit?: number }): Promise<NormalizedJob[]>;
}
