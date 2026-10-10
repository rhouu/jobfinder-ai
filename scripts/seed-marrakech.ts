import { prisma } from "../src/lib/prisma";
import { OpportunityType, WorkArrangement, ApplicationMethod, JobStatus } from "@prisma/client";

async function main() {
  console.log("== Adding High-Tech Opportunities in Marrakech ==");

  // 1. Marrakech AI & Data Solutions
  const marrakechAiCompany = await prisma.company.upsert({
    where: { slug: "atlas-ai-solutions-marrakech" },
    update: {},
    create: {
      name: "Atlas AI Solutions",
      slug: "atlas-ai-solutions-marrakech",
      city: "Marrakech",
      location: "Gueliz, Marrakech, Maroc",
      address: "Bd Mohammed VI, Gueliz, Marrakech 40000, Maroc",
      country: "Morocco",
      industry: "Intelligence Artificielle & Big Data",
      description: "Cabinet de pointe spécialisé en vision par ordinateur, IA générative et solutions Business Intelligence pour l'hôtellerie et l'industrie.",
      isVerified: true,
      rating: 4.8,
      phone: "+212 5 24 43 12 00",
      website: "https://atlas-ai.ma",
    },
  });

  await prisma.job.create({
    data: {
      externalId: "MRK-AI-001",
      sourceProvider: "LOCAL",
      title: "Ingénieur IA, Data Science & Machine Learning",
      slug: "ingenieur-ia-data-science-machine-learning-atlas-ai",
      companyId: marrakechAiCompany.id,
      companyName: marrakechAiCompany.name,
      description: "Rattaché au laboratoire R&D de Marrakech, vous concevez des modèles d'intelligence artificielle avancés (LLM, NLP, Computer Vision) pour nos clients marocains et internationaux.",
      responsibilities: [
        "Développer et déployer des architectures d'apprentissage profond (PyTorch, TensorFlow)",
        "Intégrer les pipelines d'IA avec des API FastAPI et Next.js",
        "Optimiser l'inférence des modèles sur serveurs GPU et cloud (AWS / GCP)",
      ],
      qualifications: [
        "Diplôme d'ingénieur ou Master en Informatique / Data Science / IA",
        "Maîtrise éprouvée de Python, PyTorch, Docker et des modèles de fondation",
        "Bonne capacité d'analyse et sens de l'innovation",
      ],
      category: "Data & Intelligence Artificielle",
      opportunityType: OpportunityType.JOB,
      workArrangement: WorkArrangement.HYBRID,
      location: "Marrakech, Maroc",
      country: "Morocco",
      city: "Marrakech",
      salaryMin: 14000,
      salaryMax: 22000,
      salaryCurrency: "MAD",
      applicationMethod: ApplicationMethod.INTERNAL,
      isVerified: true,
      status: JobStatus.ACTIVE,
      skills: {
        create: [
          { skill: "AI" },
          { skill: "Machine Learning" },
          { skill: "Python" },
          { skill: "PyTorch" },
          { skill: "Docker" },
          { skill: "Deep Learning" },
        ],
      },
    },
  });

  // 2. Marrakech Business Intelligence & IT Consultant
  const marrakechItCompany = await prisma.company.upsert({
    where: { slug: "marrakech-digital-consulting" },
    update: {},
    create: {
      name: "Marrakech Digital Consulting",
      slug: "marrakech-digital-consulting",
      city: "Marrakech",
      location: "Hivernage, Marrakech, Maroc",
      address: "Avenue Echouhada, Hivernage, Marrakech 40000, Maroc",
      country: "Morocco",
      industry: "IT & Business Intelligence",
      description: "Société de conseil en transformation digitale et Business Intelligence accompagnant les grandes entreprises du Maroc.",
      isVerified: true,
      rating: 4.6,
      phone: "+212 5 24 42 88 50",
      website: "https://marrakechdigital.ma",
    },
  });

  await prisma.job.create({
    data: {
      externalId: "MRK-BI-002",
      sourceProvider: "LOCAL",
      title: "Consultant Business Intelligence (BI) & Power BI",
      slug: "consultant-business-intelligence-bi-power-bi-marrakech",
      companyId: marrakechItCompany.id,
      companyName: marrakechItCompany.name,
      description: "Nous recherchons un consultant BI talentueux pour concevoir des dashboards décisionnels, modéliser des datawarehouses et valoriser les données métiers pour nos clients.",
      responsibilities: [
        "Concevoir des tableaux de bord interactifs sous Power BI et Tableau",
        "Modéliser des bases de données SQL / ETL et automatiser les flux d'extraction",
        "Animer les ateliers d'expression de besoins avec les directions métiers",
      ],
      qualifications: [
        "Formation Bac+5 en Business Intelligence, Informatique décisionnelle ou Statistiques",
        "Excellente maîtrise de Power BI, DAX, SQL et Data Modeling",
        "Sens de la communication et rigueur analytique",
      ],
      category: "Data & Intelligence Artificielle",
      opportunityType: OpportunityType.JOB,
      workArrangement: WorkArrangement.ONSITE,
      location: "Marrakech, Maroc",
      country: "Morocco",
      city: "Marrakech",
      salaryMin: 12000,
      salaryMax: 18000,
      salaryCurrency: "MAD",
      applicationMethod: ApplicationMethod.INTERNAL,
      isVerified: true,
      status: JobStatus.ACTIVE,
      skills: {
        create: [
          { skill: "BI" },
          { skill: "Business Intelligence" },
          { skill: "Power BI" },
          { skill: "SQL" },
          { skill: "DAX" },
          { skill: "Data Analysis" },
        ],
      },
    },
  });

  // 3. Stage PFE Informatique / IT à Marrakech
  await prisma.job.create({
    data: {
      externalId: "MRK-IT-003",
      sourceProvider: "LOCAL",
      title: "Stage PFE : Développeur Web & Systèmes IT",
      slug: "stage-pfe-developpeur-web-systemes-it-marrakech",
      companyId: marrakechItCompany.id,
      companyName: marrakechItCompany.name,
      description: "Opportunité de stage de fin d'études avec possibilité de pré-embauche. Vous intégrerez notre équipe technique à Marrakech pour développer des applications web modernes.",
      responsibilities: [
        "Développement de modules front-end et back-end (React / Node.js)",
        "Rédaction de la documentation technique et tests unitaires",
        "Participation aux rituels Scrum quotidiens",
      ],
      qualifications: [
        "Étudiant en dernière année d'école d'ingénieurs ou Master IT",
        "Bases solides en JavaScript, React, SQL et Git",
        "Motivation et curiosité technique",
      ],
      category: "Informatique & Tech",
      opportunityType: OpportunityType.INTERNSHIP,
      workArrangement: WorkArrangement.HYBRID,
      location: "Marrakech, Maroc",
      country: "Morocco",
      city: "Marrakech",
      isPaidInternship: true,
      salaryMin: 3500,
      salaryMax: 5000,
      salaryCurrency: "MAD",
      applicationMethod: ApplicationMethod.INTERNAL,
      isVerified: true,
      status: JobStatus.ACTIVE,
      skills: {
        create: [
          { skill: "IT" },
          { skill: "React" },
          { skill: "Node.js" },
          { skill: "JavaScript" },
          { skill: "SQL" },
          { skill: "Git" },
        ],
      },
    },
  });

  console.log("Successfully added Marrakech AI, IT, and BI opportunities!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
