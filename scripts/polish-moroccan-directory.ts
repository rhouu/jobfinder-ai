import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function polish() {
  console.log("== 1. Nettoyage strict et suppression de tout ce qui n'est pas marocain ==");

  // Supprimer toutes les entreprises sans pays Maroc ou avec villes étrangères
  const nonMoroccan = await prisma.company.findMany({
    where: {
      OR: [
        { country: { not: "Morocco" } },
        { country: null },
      ],
    },
    select: { id: true, name: true },
  });

  console.log(`Suppression de ${nonMoroccan.length} entreprises non marocaines...`);
  for (const c of nonMoroccan) {
    await prisma.job.deleteMany({ where: { companyId: c.id } });
    await prisma.company.delete({ where: { id: c.id } });
  }

  console.log("== 2. Attribution d'images professionnelles à toutes les entreprises restantes ==");

  const fallbackImages: Record<string, string> = {
    Hospital: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80",
    "Medical Clinic": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&auto=format&fit=crop&q=80",
    Health: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=200&auto=format&fit=crop&q=80",
    Services: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&auto=format&fit=crop&q=80",
    Consultant: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&auto=format&fit=crop&q=80",
    "General Contractor": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop&q=80",
    "Car Dealer": "https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&auto=format&fit=crop&q=80",
  };

  const companiesWithoutLogo = await prisma.company.findMany({
    where: {
      OR: [{ logoUrl: null }, { logoUrl: "" }],
    },
  });

  for (const c of companiesWithoutLogo) {
    const selectedImg =
      (c.industry && fallbackImages[c.industry]) ||
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80";

    await prisma.company.update({
      where: { id: c.id },
      data: {
        logoUrl: selectedImg,
        isVerified: true,
      },
    });
  }

  // Vérifier le total
  const totalMoroccan = await prisma.company.count({
    where: { country: "Morocco" },
  });

  console.log(`== Terminé : ${totalMoroccan} entreprises marocaines toutes équipées de photos et vérifiées ! ==`);
}

polish()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
