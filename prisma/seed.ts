import { PrismaClient, Role, OpportunityType, WorkArrangement, ApplicationMethod, JobStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding development database for JobFinder AI...");

  // Clear existing development data safely
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.coverLetter.deleteMany();
  await prisma.applicationEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.cVAnalysis.deleteMany();
  await prisma.cVDocument.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.reportedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.jobSource.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Job Sources
  const adzunaSource = await prisma.jobSource.create({
    data: {
      name: "Adzuna Jobs API",
      code: "ADZUNA",
      baseUrl: "https://api.adzuna.com",
      apiKeyConfigured: false,
      isActive: true,
      syncStatus: "READY",
    },
  });

  const reedSource = await prisma.jobSource.create({
    data: {
      name: "Reed Career Portal",
      code: "REED",
      baseUrl: "https://api.reed.co.uk",
      apiKeyConfigured: false,
      isActive: true,
      syncStatus: "READY",
    },
  });

  const joobleSource = await prisma.jobSource.create({
    data: {
      name: "Jooble API",
      code: "JOOBLE",
      baseUrl: "https://jooble.org",
      apiKeyConfigured: false,
      isActive: true,
      syncStatus: "READY",
    },
  });

  // 2. Create Users (Admin, Employer, Candidate)
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@jobfinder.ai",
      name: "Super Administrator",
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const employerUser = await prisma.user.create({
    data: {
      email: "recruteur@ocp.ma",
      name: "Nadia Benali",
      passwordHash,
      role: Role.EMPLOYER,
      emailVerified: new Date(),
    },
  });

  const candidateUser = await prisma.user.create({
    data: {
      email: "candidat@alumni.ma",
      name: "Yassine Mansouri",
      passwordHash,
      role: Role.CANDIDATE,
      emailVerified: new Date(),
    },
  });

  // 3. Create Companies
  const ocpCompany = await prisma.company.create({
    data: {
      name: "OCP Group",
      slug: "ocp-group",
      logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=128&auto=format&fit=crop&q=80",
      description: "Leader mondial des produits phosphatés et acteur majeur de l'innovation industrielle et technologique au Maroc.",
      website: "https://www.ocpgroup.ma",
      industry: "Industrie & Mining & Agritech",
      location: "Casablanca, Maroc",
      city: "Casablanca",
      isVerified: true,
    },
  });

  const capgeminiCompany = await prisma.company.create({
    data: {
      name: "Capgemini Engineering Maroc",
      slug: "capgemini-engineering-maroc",
      logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80",
      description: "Leader mondial du conseil, des services informatiques et de la transformation numérique, présent à Casablanca et Rabat.",
      website: "https://www.capgemini.com",
      industry: "Technologies de l'Information & Conseil",
      location: "Casablanca & Rabat, Maroc",
      city: "Casablanca",
      isVerified: true,
    },
  });

  const attijariCompany = await prisma.company.create({
    data: {
      name: "Attijariwafa Bank",
      slug: "attijariwafa-bank",
      logoUrl: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=128&auto=format&fit=crop&q=80",
      description: "Premier groupe bancaire et financier du Maghreb et acteur de référence en Afrique.",
      website: "https://www.attijariwafabank.com",
      industry: "Banque & Fintech",
      location: "Casablanca, Maroc",
      city: "Casablanca",
      isVerified: true,
    },
  });

  const inwiCompany = await prisma.company.create({
    data: {
      name: "inwi Telecom",
      slug: "inwi-telecom",
      logoUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=128&auto=format&fit=crop&q=80",
      description: "Opérateur digital global de télécommunications au Maroc, accélérateur d'inclusion technologique.",
      website: "https://www.inwi.ma",
      industry: "Télécommunications & Cloud",
      location: "Casablanca, Maroc",
      city: "Casablanca",
      isVerified: true,
    },
  });

  const leytonCompany = await prisma.company.create({
    data: {
      name: "Leyton Maroc",
      slug: "leyton-maroc",
      logoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=128&auto=format&fit=crop&q=80",
      description: "Cabinet international de conseil en performance opérationnelle et transition technologique.",
      website: "https://leyton.com",
      industry: "Conseil & Finance",
      location: "Casablanca, Maroc",
      city: "Casablanca",
      isVerified: true,
    },
  });

  // Connect employer profile
  await prisma.employerProfile.create({
    data: {
      userId: employerUser.id,
      companyId: ocpCompany.id,
      position: "Responsable Recrutement & Talent Acquisition",
      phone: "+212 522 99 88 00",
    },
  });

  // Candidate Profile
  await prisma.candidateProfile.create({
    data: {
      userId: candidateUser.id,
      headline: "Ingénieur d'État en Informatique & Intelligence Artificielle",
      bio: "Passionné par l'architecture logicielle moderne, React/Next.js, Python et les modèles d'IA générative.",
      location: "Casablanca, Maroc",
      country: "Morocco",
      city: "Casablanca",
      phone: "+212 661 23 45 67",
      preferredLocation: "Casablanca / Remote",
      preferredTypes: ["JOB", "INTERNSHIP"],
      yearsExperience: 1,
      educationLevel: "Bac +5 (Ingénieur)",
      skills: ["React", "Next.js", "TypeScript", "Python", "PostgreSQL", "Docker", "Tailwind CSS", "Git"],
      languages: ["Français", "Anglais", "Arabe"],
    },
  });

  // Candidate CV Document
  const sampleCv = await prisma.cVDocument.create({
    data: {
      userId: candidateUser.id,
      fileName: "CV_Yassine_Mansouri_Fullstack_IA.pdf",
      fileUrl: "/uploads/cv-sample.pdf",
      fileSize: 245000,
      mimeType: "application/pdf",
      rawText: "Yassine Mansouri - Ingénieur Fullstack & IA. Compétences: React, Next.js, TypeScript, Python, PostgreSQL, Docker, Git. Expérience: Stage Développeur Web chez TechMaroc. Formation: Diplôme d'ingénieur en génie informatique (2024).",
      parsedData: {
        name: "Yassine Mansouri",
        email: "candidat@alumni.ma",
        phone: "+212 661 23 45 67",
        skills: ["React", "Next.js", "TypeScript", "Python", "PostgreSQL", "Docker", "Git", "Tailwind CSS"],
        programmingLanguages: ["TypeScript", "JavaScript", "Python", "SQL"],
        education: [
          { degree: "Diplôme d'Ingénieur d'État en Génie Informatique", institution: "École Nationale des Sciences Appliquées", year: "2024" }
        ],
        experience: [
          { title: "Stagiaire Développeur Fullstack", company: "Tech Maroc Solutions", period: "Fév 2024 - Août 2024", description: "Conception et réalisation d'une application Next.js et API REST." }
        ],
        certifications: ["AWS Certified Cloud Practitioner"],
        projects: ["JobFinder AI Platform", "Smart CV Parser"],
        languages: ["Français", "Anglais", "Arabe"],
        preferredLocation: "Casablanca, Maroc",
        careerInterests: ["Fullstack Development", "Artificial Intelligence", "Cloud Computing"]
      },
      consentGiven: true,
    },
  });

  // 4. Create Realistic Jobs and Internships in Morocco & International
  const jobsData = [
    {
      title: "Développeur Full Stack Next.js / TypeScript",
      slug: "developpeur-full-stack-nextjs-typescript-ocp",
      companyId: ocpCompany.id,
      companyName: ocpCompany.name,
      companyLogo: ocpCompany.logoUrl,
      description: "Dans le cadre de l'accélération de nos plateformes digitales pour l'agritech et la supply chain, OCP Group recrute un développeur Full Stack passionné par les architectures modernes.",
      responsibilities: [
        "Développer des interfaces utilisateur réactives avec Next.js 15, React et Tailwind CSS",
        "Concevoir des APIs robustes et scalables avec Node.js, Prisma et PostgreSQL",
        "Assurer la couverture de tests unitaires et d'intégration",
        "Collaborer au sein d'une équipe Agile pluridisciplinaire"
      ],
      qualifications: [
        "Diplôme d'Ingénieur ou Bac+5 en informatique",
        "Minimum 2 ans d'expérience sur React/Next.js et TypeScript",
        "Maîtrise des bases de données relationnelles (PostgreSQL)",
        "Sensibilité éprouvée à l'UX et aux performances web"
      ],
      skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Docker", "Git"],
      category: "Informatique & Tech",
      opportunityType: OpportunityType.JOB,
      workArrangement: WorkArrangement.HYBRID,
      location: "Casablanca, Maroc",
      city: "Casablanca",
      salaryMin: 18000,
      salaryMax: 26000,
      salaryCurrency: "MAD",
      applicationMethod: ApplicationMethod.ASSISTED,
      isInternalApply: true,
      isVerified: true,
    },
    {
      title: "Stage PFE : Développeur IA & Data Science",
      slug: "stage-pfe-developpeur-ia-data-science-capgemini",
      companyId: capgeminiCompany.id,
      companyName: capgeminiCompany.name,
      companyLogo: capgeminiCompany.logoUrl,
      description: "Capgemini Engineering propose un stage de Projet de Fin d'Études (PFE) d'excellence sur les applications de l'IA générative et de l'analyse prédictive pour des clients internationaux.",
      responsibilities: [
        "Explorer et prototyper des pipelines RAG (Retrieval-Augmented Generation)",
        "Développer des scripts de traitement NLP en Python",
        "Évaluer les performances des modèles et créer des dashboards interactifs",
        "Rédiger la documentation technique et préparer la soutenance"
      ],
      qualifications: [
        "Étudiant en dernière année d'école d'ingénieur ou Master 2 (Génie Informatique / Data / IA)",
        "Solides compétences en Python et bibliothèques d'IA (PyTorch, LangChain, Transformers)",
        "Esprit d'analyse et curiosité technologique",
        "Bon niveau de communication en français et anglais"
      ],
      skills: ["Python", "Machine Learning", "NLP", "PyTorch", "Docker", "Git", "Data Analysis"],
      category: "Data & Intelligence Artificielle",
      opportunityType: OpportunityType.INTERNSHIP,
      workArrangement: WorkArrangement.HYBRID,
      location: "Rabat & Casablanca, Maroc",
      city: "Rabat",
      salaryMin: 4500,
      salaryMax: 6500,
      salaryCurrency: "MAD",
      isPaidInternship: true,
      applicationMethod: ApplicationMethod.AUTO_APPLY,
      isInternalApply: true,
      isVerified: true,
    },
    {
      title: "Stage Pré-Embauche : Développeur Python Backend",
      slug: "stage-pre-embauche-developpeur-python-backend-inwi",
      companyId: inwiCompany.id,
      companyName: inwiCompany.name,
      companyLogo: inwiCompany.logoUrl,
      description: "Rejoignez la Direction Digitale d'inwi pour concevoir les microservices de notre nouvelle génération d'applications mobiles et portails clients.",
      responsibilities: [
        "Développer des services REST et GraphQL haute performance avec FastAPI / Django",
        "Optimiser les requêtes SQL et la mise en cache Redis",
        "Participer à la mise en place des pipelines CI/CD sur GitLab",
        "Intégrer les bonnes pratiques de sécurité OWASP"
      ],
      qualifications: [
        "Formation Bac+4/5 en informatique",
        "Maîtrise de Python et des frameworks web asynchrones",
        "Compréhension des architectures orientées services et Docker",
        "Autonomie, rigueur et dynamisme"
      ],
      skills: ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "Git", "REST API"],
      category: "Informatique & Tech",
      opportunityType: OpportunityType.INTERNSHIP,
      workArrangement: WorkArrangement.ONSITE,
      location: "Casablanca, Maroc",
      city: "Casablanca",
      salaryMin: 4000,
      salaryMax: 6000,
      salaryCurrency: "MAD",
      isPaidInternship: true,
      applicationMethod: ApplicationMethod.EXTERNAL,
      officialApplyUrl: "https://carrieres.inwi.ma/offres-stage-python",
      isVerified: true,
    },
    {
      title: "Senior Cloud & DevOps Engineer (Remote)",
      slug: "senior-cloud-devops-engineer-remote-leyton",
      companyId: leytonCompany.id,
      companyName: leytonCompany.name,
      companyLogo: leytonCompany.logoUrl,
      description: "Leyton recrute un(e) Senior Cloud & DevOps Engineer en télétravail complet ou hybride pour piloter nos infrastructures multi-cloud (AWS/Azure) et l'automatisation Kubernetes.",
      responsibilities: [
        "Concevoir et maintenir nos clusters Kubernetes et notre Infrastructure as Code (Terraform)",
        "Améliorer la résilience, la scalabilité et le monitoring (Prometheus, Grafana)",
        "Gérer les déploiements continus zéro interruption",
        "Sensibiliser les équipes de développement aux pratiques DevSecOps"
      ],
      qualifications: [
        "5+ ans d'expérience en ingénierie DevOps ou Cloud",
        "Expertise AWS ou Azure, Terraform et Kubernetes",
        "Excellente maîtrise de Linux et du scripting (Bash, Python)",
        "Anglais professionnel courant"
      ],
      skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Python"],
      category: "Cloud & DevOps",
      opportunityType: OpportunityType.JOB,
      workArrangement: WorkArrangement.REMOTE,
      location: "Remote / Maroc & International",
      city: "Remote",
      salaryMin: 32000,
      salaryMax: 45000,
      salaryCurrency: "MAD",
      applicationMethod: ApplicationMethod.ASSISTED,
      isInternalApply: true,
      isVerified: true,
    },
    {
      title: "Stage Développement Mobile Flutter / iOS",
      slug: "stage-developpement-mobile-flutter-ios-marrakech",
      companyId: ocpCompany.id,
      companyName: "InnovTech Marrakech Hub",
      companyLogo: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=128&auto=format&fit=crop&q=80",
      description: "Opportunité exceptionnelle de stage à Marrakech au sein d'un incubateur technologique pour développer des applications mobiles cross-platform pour le tourisme et l'artisanat marocain.",
      responsibilities: [
        "Développer des écrans fluides avec Flutter et Dart",
        "Intégrer les APIs RESTful et la géolocalisation",
        "Optimiser les temps de rendu et la réactivité mobile",
        "Tester l'application sur terminaux iOS et Android"
      ],
      qualifications: [
        "Étudiant(e) en informatique ou passionné(e) de développement mobile",
        "Bonnes bases en Flutter/Dart ou React Native",
        "Sensibilité UI/UX mobile et souci du détail",
        "Motivation et esprit d'équipe"
      ],
      skills: ["Flutter", "Dart", "REST API", "Git", "UI/UX", "Mobile"],
      category: "Mobile & Application",
      opportunityType: OpportunityType.INTERNSHIP,
      workArrangement: WorkArrangement.ONSITE,
      location: "Marrakech, Maroc",
      city: "Marrakech",
      salaryMin: 3500,
      salaryMax: 5000,
      salaryCurrency: "MAD",
      isPaidInternship: true,
      applicationMethod: ApplicationMethod.ASSISTED,
      isInternalApply: true,
      isVerified: true,
    },
    {
      title: "Data Analyst & Business Intelligence (PFE / Débutant)",
      slug: "data-analyst-business-intelligence-attijari",
      companyId: attijariCompany.id,
      companyName: attijariCompany.name,
      companyLogo: attijariCompany.logoUrl,
      description: "Au sein du pôle Risque et Décisionnel d'Attijariwafa Bank, vous exploiterez les données financières pour créer des modèles d'analyse et des dashboards décisionnels de pointe.",
      responsibilities: [
        "Extraire et nettoyer les données à l'aide de SQL et Python",
        "Créer des dashboards Power BI / Tableau interactifs",
        "Participer à la modélisation statistique et aux études prédictives",
        "Présenter les insights aux directions métiers"
      ],
      qualifications: [
        "Master ou diplôme d'ingénieur en Data / Économétrie / Informatique",
        "Excellente maîtrise de SQL, Python (Pandas) et Power BI",
        "Rigueur analytique et curiosité",
        "Aisance relationnelle et esprit de synthèse"
      ],
      skills: ["SQL", "Python", "Power BI", "Data Analysis", "Pandas", "Scikit-Learn"],
      category: "Data & Intelligence Artificielle",
      opportunityType: OpportunityType.JOB,
      workArrangement: WorkArrangement.HYBRID,
      location: "Casablanca, Maroc",
      city: "Casablanca",
      salaryMin: 12000,
      salaryMax: 17000,
      salaryCurrency: "MAD",
      applicationMethod: ApplicationMethod.EXTERNAL,
      officialApplyUrl: "https://recrutement.attijariwafabank.com/poste-data-analyst",
      isVerified: true,
    },
    {
      title: "Frontend Engineer React / TypeScript (Paris & Remote)",
      slug: "frontend-engineer-react-typescript-paris-remote",
      companyId: capgeminiCompany.id,
      companyName: "TechCorp Global Europe",
      companyLogo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&auto=format&fit=crop&q=80",
      description: "Opportunité internationale pour développeurs seniors ou confirmés souhaitant travailler sur une suite SaaS européenne à fort trafic avec possibilité de visa ou travail remote.",
      responsibilities: [
        "Développer des composants d'interface design system accessibles et performants",
        "Collaborer avec les designers produit Figma",
        "Optimiser le Core Web Vitals (LCP, INP, CLS)",
        "Participer aux revues de code et au mentoring technique"
      ],
      qualifications: [
        "3+ ans d'expérience solide sur React et TypeScript",
        "Maîtrise approfondie de Tailwind CSS, Zustand ou Redux Toolkit",
        "Expérience des tests automatisés (Vitest, Playwright, RTL)",
        "Anglais courant indispensable"
      ],
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Git", "CI/CD"],
      category: "Informatique & Tech",
      opportunityType: OpportunityType.JOB,
      workArrangement: WorkArrangement.REMOTE,
      location: "Paris, France & Remote",
      country: "France",
      city: "Paris",
      salaryMin: 45000,
      salaryMax: 65000,
      salaryCurrency: "EUR",
      applicationMethod: ApplicationMethod.EXTERNAL,
      officialApplyUrl: "https://techcorp-europe.careers/jobs/fe-react",
      isVerified: true,
    },
    {
      title: "Alternance / Stage : Cybersécurité & SOC Analyst",
      slug: "alternance-stage-cybersecurite-soc-analyst-tanger",
      companyId: inwiCompany.id,
      companyName: "CyberShield Maroc Tanger",
      companyLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&auto=format&fit=crop&q=80",
      description: "Rejoignez le Security Operations Center (SOC) à Tanger pour surveiller les infrastructures critiques, détecter les intrusions et auditer les vulnérabilités.",
      responsibilities: [
        "Analyser les alertes SIEM et logs réseau",
        "Participer aux investigations sur les incidents de sécurité",
        "Effectuer des scans de vulnérabilités et proposer des remédiations",
        "Participer à la rédaction des fiches réflexes de sécurité"
      ],
      qualifications: [
        "Formation en Réseaux & Sécurité informatique (Bac+4/5)",
        "Connaissances des protocoles réseau (TCP/IP, DNS, TLS) et systèmes Linux",
        "Notions sur les outils SIEM et frameworks MITRE ATT&CK",
        "Intégrité, discrétion et réactivité"
      ],
      skills: ["Linux", "Cybersécurité", "Python", "Git", "Réseaux"],
      category: "Cybersécurité & Réseaux",
      opportunityType: OpportunityType.APPRENTICESHIP,
      workArrangement: WorkArrangement.ONSITE,
      location: "Tanger, Maroc",
      city: "Tanger",
      salaryMin: 4000,
      salaryMax: 5500,
      salaryCurrency: "MAD",
      isPaidInternship: true,
      applicationMethod: ApplicationMethod.ASSISTED,
      isInternalApply: true,
      isVerified: true,
    }
  ];

  for (const job of jobsData) {
    const createdJob = await prisma.job.create({
      data: {
        title: job.title,
        slug: job.slug,
        companyId: job.companyId,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        description: job.description,
        responsibilities: job.responsibilities,
        qualifications: job.qualifications,
        category: job.category,
        opportunityType: job.opportunityType,
        workArrangement: job.workArrangement,
        location: job.location,
        country: job.country || "Morocco",
        city: job.city,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        isPaidInternship: job.isPaidInternship,
        applicationMethod: job.applicationMethod,
        officialApplyUrl: job.officialApplyUrl,
        isInternalApply: job.isInternalApply || false,
        isVerified: job.isVerified,
        status: JobStatus.ACTIVE,
        publicationDate: new Date(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // in 30 days
        skills: {
          create: job.skills.map((skill) => ({ skill })),
        },
      },
    });

    // Create a pre-computed match for candidate
    await prisma.cVAnalysis.create({
      data: {
        cvId: sampleCv.id,
        jobId: createdJob.id,
        overallScore: Math.floor(Math.random() * 25) + 75, // 75-99%
        matchedSkills: job.skills.slice(0, 4),
        missingSkills: job.skills.slice(4),
        experienceScore: 85,
        educationScore: 90,
        explanation: `Forte adéquation avec le profil d'ingénieur de Yassine Mansouri (${job.skills.slice(0, 3).join(", ")}).`,
        suggestions: ["Valoriser les projets similaires réalisés dans le portfolio."],
      },
    });
  }

  // 5. Add a saved job and an application for testing candidate flows
  const firstJob = await prisma.job.findFirst();
  if (firstJob) {
    await prisma.savedJob.create({
      data: {
        userId: candidateUser.id,
        jobId: firstJob.id,
      },
    });

    await prisma.application.create({
      data: {
        userId: candidateUser.id,
        jobId: firstJob.id,
        cvDocumentId: sampleCv.id,
        status: "APPLIED",
        method: ApplicationMethod.ASSISTED,
        appliedAt: new Date(),
        candidateApproved: true,
        notes: "Entretien technique planifié pour la semaine prochaine.",
        events: {
          create: [
            {
              eventType: "SUBMITTED",
              description: "Candidature envoyée avec succès sur JobFinder AI.",
            },
            {
              eventType: "STATUS_CHANGE",
              description: "Candidature passée au statut En cours de traitement par le recruteur.",
            },
          ],
        },
      },
    });
  }

  console.log("Seeding completed successfully!");
  console.log("Test accounts created:");
  console.log("- Admin: admin@jobfinder.ai / Password123!");
  console.log("- Employer: recruteur@ocp.ma / Password123!");
  console.log("- Candidate: candidat@alumni.ma / Password123!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
