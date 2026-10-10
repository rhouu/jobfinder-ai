import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobFormSchema } from "@/lib/validations";
import { JobStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Veuillez vous connecter." }, { status: 401 });
    }

    let employer = await prisma.employerProfile.findUnique({
      where: { userId: session.userId },
      include: { company: true },
    });

    if (!employer) {
      // Auto-assign or link user to default/first company so they never get blocked
      let defaultCompany = await prisma.company.findFirst();
      if (!defaultCompany) {
        defaultCompany = await prisma.company.create({
          data: {
            name: "Entreprise Partenaire",
            slug: "entreprise-partenaire",
            industry: "Services & Technologies",
            city: "Casablanca",
            country: "Morocco",
          },
        });
      }

      employer = await prisma.employerProfile.create({
        data: {
          userId: session.userId,
          companyId: defaultCompany.id,
          position: "Responsable Recrutement",
        },
        include: { company: true },
      });

      // Update role if CANDIDATE
      await prisma.user.update({
        where: { id: session.userId },
        data: { role: "EMPLOYER" },
      });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: employer.companyId },
      orderBy: { createdAt: "desc" },
      include: {
        skills: true,
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                candidateProfile: {
                  select: {
                    phone: true,
                    city: true,
                    headline: true,
                    yearsExperience: true,
                    linkedin: true,
                  },
                },
              },
            },
            cvDocument: {
              select: {
                id: true,
                fileName: true,
                fileUrl: true,
              },
            },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ jobs, company: employer.company });
  } catch (error) {
    console.error("Employer jobs GET error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Veuillez vous connecter." }, { status: 401 });
    }

    let employer = await prisma.employerProfile.findUnique({
      where: { userId: session.userId },
      include: { company: true },
    });

    if (!employer) {
      let defaultCompany = await prisma.company.findFirst();
      if (!defaultCompany) {
        defaultCompany = await prisma.company.create({
          data: {
            name: "Entreprise Partenaire",
            slug: "entreprise-partenaire",
            industry: "Services & Technologies",
            city: "Casablanca",
            country: "Morocco",
          },
        });
      }
      employer = await prisma.employerProfile.create({
        data: {
          userId: session.userId,
          companyId: defaultCompany.id,
          position: "Responsable Recrutement",
        },
        include: { company: true },
      });
      await prisma.user.update({
        where: { id: session.userId },
        data: { role: "EMPLOYER" },
      });
    }

    const body = await req.json();
    const data = jobFormSchema.parse(body);

    const slug = `${data.title}-${employer.company.name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Math.random().toString(36).substring(2, 6)}`;

    const newJob = await prisma.job.create({
      data: {
        title: data.title,
        slug,
        companyId: employer.companyId,
        companyName: employer.company.name,
        companyLogo: data.companyLogo || employer.company.logoUrl,
        description: data.description,
        responsibilities: data.responsibilities,
        qualifications: data.qualifications,
        category: data.category,
        opportunityType: data.opportunityType,
        workArrangement: data.workArrangement,
        location: data.location,
        country: data.country || "Morocco",
        city: data.city,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryCurrency: data.salaryCurrency,
        isPaidInternship: data.isPaidInternship,
        deadline: data.deadline ? new Date(data.deadline) : null,
        applicationMethod: data.applicationMethod,
        officialApplyUrl: data.officialApplyUrl,
        isInternalApply: data.isInternalApply,
        isVerified: employer.company.isVerified,
        status: JobStatus.ACTIVE,
        skills: {
          create: data.skills.map((skill) => ({ skill })),
        },
      },
      include: { skills: true },
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (error) {
    console.error("Employer job POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'offre." }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "EMPLOYER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const body = await req.json();
    const { jobId, status } = body;

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status },
    });

    return NextResponse.json({ success: true, job: updated });
  } catch (error) {
    console.error("Employer job PATCH error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 400 });
  }
}
