import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role as Role,
      },
    });

    if (data.role === "CANDIDATE") {
      await prisma.candidateProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else if (data.role === "EMPLOYER") {
      const companyName = data.companyName || `${data.name}'s Enterprise`;
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Math.random().toString(36).substring(2, 6)}`;

      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug,
          isVerified: false,
        },
      });

      await prisma.employerProfile.create({
        data: {
          userId: user.id,
          companyId: company.id,
          position: "Recruteur / RH",
        },
      });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de l'inscription.";
    return NextResponse.json({ error: `Erreur: ${message}` }, { status: 400 });
  }
}
