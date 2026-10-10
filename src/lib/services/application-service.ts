import { prisma } from "../prisma";
import { ApplicationMethod, ApplicationStatus } from "@prisma/client";

export interface SubmitApplicationInput {
  userId: string;
  jobId: string;
  method: ApplicationMethod;
  cvDocumentId?: string;
  coverLetterText?: string;
  candidateApproved?: boolean;
  externalConfirmed?: boolean;
  notes?: string;
}

export async function submitApplication(input: SubmitApplicationInput) {
  const {
    userId,
    jobId,
    method,
    cvDocumentId,
    coverLetterText,
    candidateApproved = true,
    externalConfirmed = false,
    notes,
  } = input;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("JOB_NOT_FOUND");

  // Determine initial status based on method
  let status: ApplicationStatus = ApplicationStatus.PREPARING;
  if (method === ApplicationMethod.EXTERNAL) {
    status = externalConfirmed ? ApplicationStatus.APPLIED : ApplicationStatus.READY_TO_APPLY;
  } else if (method === ApplicationMethod.ASSISTED || method === ApplicationMethod.AUTO_APPLY) {
    if (candidateApproved) {
      status = ApplicationStatus.APPLIED;
    } else {
      status = ApplicationStatus.READY_TO_APPLY;
    }
  }

  // Upsert application record
  const application = await prisma.application.upsert({
    where: {
      userId_jobId: { userId, jobId },
    },
    update: {
      method,
      cvDocumentId: cvDocumentId || undefined,
      coverLetterText: coverLetterText || undefined,
      status,
      candidateApproved,
      externalConfirmed,
      notes: notes || undefined,
      appliedAt: status === ApplicationStatus.APPLIED ? new Date() : undefined,
    },
    create: {
      userId,
      jobId,
      method,
      cvDocumentId,
      coverLetterText,
      status,
      candidateApproved,
      externalConfirmed,
      notes,
      appliedAt: status === ApplicationStatus.APPLIED ? new Date() : undefined,
    },
  });

  // Increment application counter on Job
  if (status === ApplicationStatus.APPLIED) {
    await prisma.job.update({
      where: { id: jobId },
      data: { applicationsCount: { increment: 1 } },
    });
  }

  // Create audit event
  let eventDesc = `Candidature initiée via la méthode ${method}.`;
  if (method === ApplicationMethod.EXTERNAL) {
    eventDesc = externalConfirmed
      ? "L'utilisateur a confirmé avoir postulé sur le portail externe de l'employeur."
      : "Lien externe consulté. Candidature en attente de confirmation par le candidat.";
  } else if (method === ApplicationMethod.ASSISTED) {
    eventDesc = "Candidature assistée JobFinder AI soumise après validation explicite du dossier et de la lettre.";
  } else if (method === ApplicationMethod.AUTO_APPLY) {
    eventDesc = "Candidature Auto-Apply supervisée transmise après accord et validation humaine préalable.";
  }

  await prisma.applicationEvent.create({
    data: {
      applicationId: application.id,
      eventType: status,
      description: eventDesc,
    },
  });

  // Create user notification
  await prisma.notification.create({
    data: {
      userId,
      title: "Candidature enregistrée",
      message: `Votre candidature pour le poste "${job.title}" a bien été enregistrée (${status}).`,
      link: "/dashboard/applications",
    },
  });

  return application;
}

export async function getUserApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      job: {
        include: {
          company: true,
        },
      },
      cvDocument: {
        select: { id: true, fileName: true },
      },
      events: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  newStatus: ApplicationStatus,
  notes?: string
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          company: {
            include: {
              employers: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  // Check if caller is candidate OR an employer of the company that owns the job
  const isCandidate = application.userId === userId;
  const isEmployer = application.job.company?.employers.some((emp) => emp.userId === userId);

  if (!isCandidate && !isEmployer) {
    throw new Error("UNAUTHORIZED_APPLICATION_ACCESS");
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
      notes: notes !== undefined ? notes : application.notes,
    },
  });

  await prisma.applicationEvent.create({
    data: {
      applicationId,
      eventType: newStatus,
      description: `Statut mis à jour vers : ${newStatus}${notes ? ` - Message/Note : ${notes}` : ""}`,
    },
  });

  // Notify candidate if updated by employer
  if (isEmployer && !isCandidate) {
    const statusLabels: Record<string, string> = {
      REVIEWED: "Dossier en cours d'examen",
      INTERVIEW_SCHEDULED: "Entretien planifié",
      OFFERED: "Offre d'embauche proposée",
      ACCEPTED: "Candidature retenue",
      REJECTED: "Candidature non retenue",
    };
    const label = statusLabels[newStatus] || newStatus;

    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: `Mise à jour pour "${application.job.title}"`,
        message: `L'entreprise a mis à jour votre statut : ${label}.${notes ? ` Message du recruteur : "${notes}"` : ""}`,
        link: "/dashboard",
      },
    });
  }

  return updated;
}
