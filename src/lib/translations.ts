export type Locale = "fr" | "en" | "ar";

export interface Translations {
  nav: {
    findJobs: string;
    internships: string;
    howItWorks: string;
    forEmployers: string;
    signIn: string;
    getStarted: string;
    dashboard: string;
    admin: string;
    logout: string;
  };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    categoryPlaceholder: string;
    typePlaceholder: string;
    searchButton: string;
    popularTags: string;
    naturalLanguageHint: string;
  };
  filters: {
    all: string;
    jobs: string;
    internships: string;
    apprenticeships: string;
    remote: string;
    hybrid: string;
    onsite: string;
    location: string;
    category: string;
    experience: string;
    paidOnly: string;
    verifiedOnly: string;
    sort: string;
    sortRelevance: string;
    sortRecent: string;
    sortSalary: string;
    sortMatch: string;
    clearFilters: string;
  };
  results: {
    found: string;
    opportunities: string;
    noResults: string;
    noResultsHint: string;
    applyNow: string;
    applyExternal: string;
    applyAssisted: string;
    applyAuto: string;
    saveJob: string;
    saved: string;
    viewDetails: string;
    matchScore: string;
    verified: string;
    unverified: string;
    source: string;
  };
  details: {
    responsibilities: string;
    qualifications: string;
    skills: string;
    compensation: string;
    deadline: string;
    postedOn: string;
    workType: string;
    applyModalTitle: string;
    similarJobs: string;
    aboutCompany: string;
  };
  cv: {
    uploadTitle: string;
    uploadDesc: string;
    dragDrop: string;
    chooseFile: string;
    supportedFormats: string;
    analyzing: string;
    matchAnalysis: string;
    score: string;
    matchedSkills: string;
    missingSkills: string;
    recommendations: string;
    deleteCv: string;
    editCv: string;
  };
  methods: {
    methodA: string;
    methodADesc: string;
    methodB: string;
    methodBDesc: string;
    methodC: string;
    methodCDesc: string;
    confirmSubmit: string;
    generateLetter: string;
    preview: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    close: string;
    submit: string;
    back: string;
    optional: string;
  };
}

export const translations: Record<Locale, Translations> = {
  fr: {
    nav: {
      findJobs: "Offres d'emploi",
      internships: "Stages & PFE",
      howItWorks: "Comment ça marche",
      forEmployers: "Espace Recruteurs",
      signIn: "Connexion",
      getStarted: "Commencer",
      dashboard: "Mon Espace",
      admin: "Administration",
      logout: "Déconnexion",
    },
    hero: {
      badge: "Plateforme IA de recrutement & stages nouvelle génération",
      title: "Votre prochaine opportunité",
      titleHighlight: "commence ici.",
      subtitle:
        "Découvrez les emplois et stages qui correspondent à vos compétences, ambitions et localisation — au Maroc et à l'international.",
      searchPlaceholder: "Poste, mot-clé (ex: Développeur Fullstack, Data Analyst...)",
      locationPlaceholder: "Ville, région ou Remote (ex: Casablanca, Marrakech...)",
      categoryPlaceholder: "Toutes les catégories",
      typePlaceholder: "Type de contrat",
      searchButton: "Rechercher",
      popularTags: "Populaires :",
      naturalLanguageHint: "Essayez : « Stage PFE Python ou React à Casablanca débutant »",
    },
    filters: {
      all: "Tout afficher",
      jobs: "Emplois",
      internships: "Stages",
      apprenticeships: "Alternance",
      remote: "Télétravail",
      hybrid: "Hybride",
      onsite: "Sur site",
      location: "Localisation",
      category: "Secteur",
      experience: "Expérience requise",
      paidOnly: "Stage rémunéré",
      verifiedOnly: "Source vérifiée",
      sort: "Trier par",
      sortRelevance: "Pertinence",
      sortRecent: "Plus récent",
      sortSalary: "Rémunération",
      sortMatch: "Score IA de mon CV",
      clearFilters: "Réinitialiser",
    },
    results: {
      found: "Trouvé",
      opportunities: "opportunités réelles",
      noResults: "Aucune opportunité trouvée",
      noResultsHint: "Essayez d'élargir vos filtres ou de modifier votre recherche.",
      applyNow: "Postuler",
      applyExternal: "Postuler sur le site officiel",
      applyAssisted: "Postuler avec JobFinder AI",
      applyAuto: "Candidature intelligente assistée",
      saveJob: "Sauvegarder",
      saved: "Enregistré",
      viewDetails: "Voir l'offre",
      matchScore: "Match CV",
      verified: "Source officielle vérifiée",
      unverified: "Non vérifié",
      source: "Source",
    },
    details: {
      responsibilities: "Missions & Responsabilités",
      qualifications: "Profil recherché & Exigences",
      skills: "Compétences clés",
      compensation: "Rémunération",
      deadline: "Date limite",
      postedOn: "Publié le",
      workType: "Mode de travail",
      applyModalTitle: "Postuler à cette opportunité",
      similarJobs: "Opportunités similaires",
      aboutCompany: "À propos de l'entreprise",
    },
    cv: {
      uploadTitle: "Déposez votre CV",
      uploadDesc: "Importez votre CV en PDF ou Word pour activer l'analyse IA de compatibilité.",
      dragDrop: "Glissez votre CV ici ou",
      chooseFile: "Parcourir vos fichiers",
      supportedFormats: "Formats acceptés : PDF, DOCX (Max 5 Mo). Vos données sont strictement confidentielles.",
      analyzing: "Extraction et analyse IA des compétences en cours...",
      matchAnalysis: "Analyse de correspondance IA",
      score: "Score global",
      matchedSkills: "Compétences validées",
      missingSkills: "Compétences manquantes recommandées",
      recommendations: "Conseils d'amélioration du CV",
      deleteCv: "Supprimer le CV",
      editCv: "Modifier les compétences extraites",
    },
    methods: {
      methodA: "Candidature externe officielle",
      methodADesc: "Redirection sécurisée vers le site officiel de l'employeur avec suivi automatique dans votre espace.",
      methodB: "Candidature assistée intégrée",
      methodBDesc: "Candidature directe avec sélection de CV et génération assistée de lettre de motivation personnalisée.",
      methodC: "Assistance Auto-Apply supervisée",
      methodCDesc: "Pré-remplissage intelligent et vérification explicite avant tout envoi légalement autorisé.",
      confirmSubmit: "Confirmer et envoyer la candidature",
      generateLetter: "Générer une lettre de motivation IA",
      preview: "Aperçu de la candidature",
    },
    common: {
      loading: "Chargement en cours...",
      error: "Une erreur est survenue",
      success: "Opération réussie",
      cancel: "Annuler",
      close: "Fermer",
      submit: "Valider",
      back: "Retour",
      optional: "Optionnel",
    },
  },
  en: {
    nav: {
      findJobs: "Find Jobs",
      internships: "Internships",
      howItWorks: "How It Works",
      forEmployers: "For Employers",
      signIn: "Sign In",
      getStarted: "Get Started",
      dashboard: "My Dashboard",
      admin: "Admin",
      logout: "Sign Out",
    },
    hero: {
      badge: "Next-generation AI job & internship matching platform",
      title: "Your next opportunity",
      titleHighlight: "starts here.",
      subtitle:
        "Discover jobs and internships that match your skills, ambitions, and location — in Morocco and around the world.",
      searchPlaceholder: "Job title, keywords (e.g., Fullstack Developer, Data Analyst...)",
      locationPlaceholder: "City, country, or Remote (e.g., Casablanca, Marrakech...)",
      categoryPlaceholder: "All Categories",
      typePlaceholder: "Contract Type",
      searchButton: "Search",
      popularTags: "Popular:",
      naturalLanguageHint: "Try: \"Entry-level Python or React internship in Casablanca\"",
    },
    filters: {
      all: "All",
      jobs: "Jobs",
      internships: "Internships",
      apprenticeships: "Apprenticeships",
      remote: "Remote",
      hybrid: "Hybrid",
      onsite: "On-site",
      location: "Location",
      category: "Industry",
      experience: "Experience Level",
      paidOnly: "Paid Only",
      verifiedOnly: "Verified Source",
      sort: "Sort by",
      sortRelevance: "Relevance",
      sortRecent: "Most Recent",
      sortSalary: "Salary",
      sortMatch: "AI CV Match Score",
      clearFilters: "Reset Filters",
    },
    results: {
      found: "Found",
      opportunities: "verified opportunities",
      noResults: "No opportunities found",
      noResultsHint: "Try expanding your filters or adjusting your search keywords.",
      applyNow: "Apply Now",
      applyExternal: "Apply on official website",
      applyAssisted: "Apply with JobFinder AI",
      applyAuto: "AI-Assisted Application",
      saveJob: "Save",
      saved: "Saved",
      viewDetails: "View Details",
      matchScore: "CV Match",
      verified: "Official verified source",
      unverified: "Unverified",
      source: "Source",
    },
    details: {
      responsibilities: "Key Responsibilities",
      qualifications: "Qualifications & Requirements",
      skills: "Required Skills",
      compensation: "Compensation",
      deadline: "Deadline",
      postedOn: "Posted on",
      workType: "Work Arrangement",
      applyModalTitle: "Apply for this opportunity",
      similarJobs: "Similar Opportunities",
      aboutCompany: "About the Company",
    },
    cv: {
      uploadTitle: "Upload Your CV",
      uploadDesc: "Upload your CV in PDF or Word to unlock AI matching and tailored suggestions.",
      dragDrop: "Drag and drop your CV here, or",
      chooseFile: "Browse files",
      supportedFormats: "Accepted formats: PDF, DOCX (Max 5MB). Your personal data remains strictly confidential.",
      analyzing: "Extracting skills and analyzing compatibility with AI...",
      matchAnalysis: "AI Compatibility Analysis",
      score: "Overall Match Score",
      matchedSkills: "Matched Skills",
      missingSkills: "Missing / Recommended Skills",
      recommendations: "Suggested CV Enhancements",
      deleteCv: "Delete CV",
      editCv: "Edit Extracted Skills",
    },
    methods: {
      methodA: "Official External Application",
      methodADesc: "Safe redirect to the official employer portal with automatic dashboard tracking.",
      methodB: "Assisted In-Platform Application",
      methodBDesc: "Direct application with CV selection and tailored AI cover letter generation.",
      methodC: "Supervised AI Auto-Apply",
      methodCDesc: "Smart pre-filling and explicit human review before any legally permitted submission.",
      confirmSubmit: "Confirm and Submit Application",
      generateLetter: "Generate AI Cover Letter",
      preview: "Preview Application",
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Action completed successfully",
      cancel: "Cancel",
      close: "Close",
      submit: "Submit",
      back: "Back",
      optional: "Optional",
    },
  },
  ar: {
    nav: {
      findJobs: "فرص العمل",
      internships: "فرص التدريب",
      howItWorks: "كيف يعمل؟",
      forEmployers: "فضاء المشغلين",
      signIn: "تسجيل الدخول",
      getStarted: "ابدأ الآن",
      dashboard: "لوحة التحكم",
      admin: "الإدارة",
      logout: "تسجيل الخروج",
    },
    hero: {
      badge: "منصة ذكية متطورة لمطابقة الوظائف والتدريب بالذكاء الاصطناعي",
      title: "فرصتك المهنية القادمة",
      titleHighlight: "تبدأ من هنا.",
      subtitle:
        "اكتشف الوظائف وفرص التدريب التي تلائم مهاراتك وطموحاتك وموقعك — في المغرب وحول العالم.",
      searchPlaceholder: "المسمى الوظيفي، الكلمات الدلالية (مثال: مطور ويب، مهندس بيانات...)",
      locationPlaceholder: "المدينة أو عن بعد (مثال: الدار البيضاء، مراكش، الرباط...)",
      categoryPlaceholder: "جميع المجالات",
      typePlaceholder: "نوع العقد",
      searchButton: "بحث",
      popularTags: "شائع:",
      naturalLanguageHint: "جرب: «تدريب بايثون أو رياكت في الدار البيضاء للمبتدئين»",
    },
    filters: {
      all: "الكل",
      jobs: "وظائف",
      internships: "تدريب",
      apprenticeships: "تكوين مهني",
      remote: "عن بعد",
      hybrid: "هجين",
      onsite: "حضوري",
      location: "الموقع",
      category: "المجال",
      experience: "الخبرة المطلوبة",
      paidOnly: "تدريب مدفوع الأجر",
      verifiedOnly: "مصادر موثوقة فقط",
      sort: "ترتيب حسب",
      sortRelevance: "الأكثر صلة",
      sortRecent: "الأحدث",
      sortSalary: "الراتب",
      sortMatch: "نسبة تطابق سيرتي الذاتية",
      clearFilters: "إعادة تعيين",
    },
    results: {
      found: "تم العثور على",
      opportunities: "فرصة حقيقية",
      noResults: "لم يتم العثور على أي نتائج",
      noResultsHint: "جرب تعديل كلمات البحث أو تقليل الفلاتر للحصول على نتائج أوسع.",
      applyNow: "التقديم الآن",
      applyExternal: "التقديم عبر الموقع الرسمي",
      applyAssisted: "التقديم عبر JobFinder AI",
      applyAuto: "تقديم ذكي بمساعدة الذكاء الاصطناعي",
      saveJob: "حفظ",
      saved: "محفوظ",
      viewDetails: "عرض التفاصيل",
      matchScore: "تطابق السيرة",
      verified: "مصدر رسمي موثق",
      unverified: "غير موثق",
      source: "المصدر",
    },
    details: {
      responsibilities: "المهام والمسؤوليات",
      qualifications: "المؤهلات والشروط",
      skills: "المهارات الأساسية",
      compensation: "الراتب / التعويض",
      deadline: "آخر أجل للتقديم",
      postedOn: "تاريخ النشر",
      workType: "نظام العمل",
      applyModalTitle: "التقديم على هذه الفرصة",
      similarJobs: "فرص مشابهة",
      aboutCompany: "عن الشركة",
    },
    cv: {
      uploadTitle: "ارفع سيرتك الذاتية",
      uploadDesc: "قم برفع سيرتك الذاتية بصيغة PDF أو DOCX لتحليلها ومطابقتها بالذكاء الاصطناعي.",
      dragDrop: "اسحب السيرة الذاتية هنا أو",
      chooseFile: "تصفح الملفات",
      supportedFormats: "الصيغ المدعومة: PDF, DOCX (أقصى حجم 5 ميغابايت). بياناتك مشفرة ومحمية بالكامل.",
      analyzing: "جار استخراج المهارات وتحليل التوافق بالذكاء الاصطناعي...",
      matchAnalysis: "تقرير المطابقة الذكي",
      score: "درجة التوافق العامة",
      matchedSkills: "المهارات المتطابقة",
      missingSkills: "المهارات المقترحة للتطوير",
      recommendations: "نصائح لتحسين سيرتك الذاتية",
      deleteCv: "حذف السيرة الذاتية",
      editCv: "تعديل المهارات المستخرجة",
    },
    methods: {
      methodA: "التقديم الخارجي الرسمي",
      methodADesc: "إعادة توجيه آمن إلى موقع المشغل الرسمي مع متابعة آلية في لوحة التحكم.",
      methodB: "التقديم المباشر داخل المنصة",
      methodBDesc: "تقديم مباشر مع اختيار السيرة الذاتية وتوليد خطاب تحفيزي مخصص بالذكاء الاصطناعي.",
      methodC: "التقديم التلقائي الذكي الموجه",
      methodCDesc: "ملء مسبق للبيانات مع مراجعة وموافقة صريحة منك قبل أي إرسال نظامي.",
      confirmSubmit: "تأكيد وإرسال الطلب",
      generateLetter: "توليد خطاب تحفيزي بالذكاء الاصطناعي",
      preview: "معاينة الطلب",
    },
    common: {
      loading: "جار التحميل...",
      error: "حدث خطأ ما",
      success: "تمت العملية بنجاح",
      cancel: "إلغاء",
      close: "إغلاق",
      submit: "تأكيد",
      back: "رجوع",
      optional: "اختياري",
    },
  },
};
