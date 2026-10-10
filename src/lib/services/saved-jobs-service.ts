import { prisma } from "../prisma";

export async function toggleSaveJob(userId: string, jobId: string) {
  const existing = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: { userId, jobId },
    },
  });

  if (existing) {
    await prisma.savedJob.delete({
      where: { id: existing.id },
    });
    return { isSaved: false };
  } else {
    await prisma.savedJob.create({
      data: { userId, jobId },
    });
    return { isSaved: true };
  }
}

export async function getSavedJobs(userId: string) {
  return prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: {
        include: {
          skills: true,
          company: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
