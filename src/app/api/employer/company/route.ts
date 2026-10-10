import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "EMPLOYER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: session.userId },
      include: { company: true },
    });

    return NextResponse.json({ company: employer?.company });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "EMPLOYER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!employer) {
      return NextResponse.json({ error: "Entreprise non trouvée." }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, website, location, city, logoUrl, industry } = body;

    const updated = await prisma.company.update({
      where: { id: employer.companyId },
      data: {
        name: name || undefined,
        description: description || undefined,
        website: website || undefined,
        location: location || undefined,
        city: city || undefined,
        logoUrl: logoUrl || undefined,
        industry: industry || undefined,
      },
    });

    return NextResponse.json({ success: true, company: updated });
  } catch (error) {
    console.error("Update company error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 400 });
  }
}
