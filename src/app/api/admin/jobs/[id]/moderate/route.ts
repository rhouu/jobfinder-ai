import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, isVerified, resolveReportId } = body;

    const updated = await prisma.job.update({
      where: { id },
      data: {
        status: status as JobStatus | undefined,
        isVerified: isVerified !== undefined ? isVerified : undefined,
      },
    });

    if (resolveReportId) {
      await prisma.reportedJob.update({
        where: { id: resolveReportId },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });
    }

    // Log admin audit
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "MODERATE_JOB",
        resource: "Job",
        resourceId: id,
        details: { status, isVerified },
      },
    });

    return NextResponse.json({ success: true, job: updated });
  } catch (error) {
    console.error("Moderate job error:", error);
    return NextResponse.json({ error: "Erreur lors de la modération." }, { status: 500 });
  }
}
