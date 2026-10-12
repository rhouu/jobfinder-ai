import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { GeminiChatWidget } from "@/components/GeminiChatWidget";
import { MotionProvider } from "@/components/motion/MotionProvider";

export const metadata: Metadata = {
  title: "JobFinder AI | Emplois, Stages & Matching CV par Intelligence Artificielle",
  description:
    "Découvrez les meilleures offres d'emploi et stages au Maroc et à l'international. Analysez la compatibilité de votre CV grâce à l'IA et postulez facilement.",
  keywords: [
    "Emploi Maroc",
    "Stage Maroc",
    "Stage PFE",
    "Recrutement IT Maroc",
    "JobFinder AI",
    "Matching CV",
    "Offres d'emploi Casablanca Rabat",
  ],
  openGraph: {
    title: "JobFinder AI | Emplois & Stages avec Matching IA",
    description: "Plateforme intelligente d'orientation et de recrutement pour étudiants et professionnels.",
    url: "https://jobfinder.ai",
    siteName: "JobFinder AI",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-blue-600 selection:text-white">
        <MotionProvider>
          <I18nProvider>
            {children}
            <GeminiChatWidget />
          </I18nProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
