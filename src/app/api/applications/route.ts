import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { applicationSubmitSchema } from "@/lib/validations";
import {
  submitApplication,
  getUserApplications,
  updateApplicationStatus,
} from "@/lib/services/application-service";
import { ApplicationStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const applications = await getUserApplications(session.userId);
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des candidatures." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Veuillez vous connecter pour postuler." }, { status: 401 });
    }

    const body = await req.json();
    const data = applicationSubmitSchema.parse(body);

    const application = await submitApplication({
      userId: session.userId,
      jobId: data.jobId,
      method: data.method,
      cvDocumentId: data.cvDocumentId,
      coverLetterText: data.coverLetterText,
      candidateApproved: data.candidateApproved,
      externalConfirmed: data.externalConfirmed,
      notes: data.notes,
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json({ error: "Erreur lors de la soumission de la candidature." }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    const updated = await updateApplicationStatus(
      session.userId,
      applicationId,
      status as ApplicationStatus,
      notes
    );

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Update application status error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 400 });
  }
}
