import { prisma } from "../prisma";
import { Role, JobStatus } from "@prisma/client";

export async function getCandidateStats(userId: string) {
  const [totalApplications, totalSaved, totalCvDocs, recentApplications] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.savedJob.count({ where: { userId } }),
    prisma.cVDocument.count({ where: { userId, isDeleted: false } }),
    prisma.application.findMany({
      where: { userId },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        job: { select: { id: true, title: true, companyName: true, city: true, status: true } },
      },
    }),
  ]);

  const interviewsCount = await prisma.application.count({
    where: { userId, status: "INTERVIEW" },
  });

  return {
    totalApplications,
    totalSaved,
    totalCvDocs,
    interviewsCount,
    recentApplications,
  };
}

export async function getEmployerStats(userId: string) {
  const employerProfile = await prisma.employerProfile.findUnique({
    where: { userId },
    include: { company: true },
  });

  if (!employerProfile) return null;

  const [activeJobsCount, totalApplicants, jobs] = await Promise.all([
    prisma.job.count({
      where: { companyId: employerProfile.companyId, status: JobStatus.ACTIVE },
    }),
    prisma.application.count({
      where: { job: { companyId: employerProfile.companyId } },
    }),
    prisma.job.findMany({
      where: { companyId: employerProfile.companyId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    }),
  ]);

  return {
    company: employerProfile.company,
    activeJobsCount,
    totalApplicants,
    jobs,
  };
}

export async function getAdminPlatformStats() {
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    totalCompanies,
    jobSources,
    recentAuditLogs,
    pendingReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.company.count(),
    prisma.jobSource.findMany(),
    prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: "desc" } }),
    prisma.reportedJob.findMany({
      where: { status: "PENDING" },
      include: { job: true, reporterUser: { select: { name: true, email: true } } },
    }),
  ]);

  const candidatesCount = await prisma.user.count({ where: { role: Role.CANDIDATE } });
  const employersCount = await prisma.user.count({ where: { role: Role.EMPLOYER } });

  return {
    totalUsers,
    candidatesCount,
    employersCount,
    totalJobs,
    totalApplications,
    totalCompanies,
    jobSources,
    recentAuditLogs,
    pendingReports,
  };
}
