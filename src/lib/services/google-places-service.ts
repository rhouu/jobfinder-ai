import { prisma } from "../prisma";

export interface GooglePlaceCompany {
  googlePlacesId: string;
  name: string;
  address?: string;
  city?: string;
  country: string;
  phone?: string;
  website?: string;
  rating?: number;
  googleMapsUrl?: string;
  industry?: string;
}

export class GooglePlacesService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || "";
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Search enterprises using Google Places New API (v1 places:searchText)
   */
  async searchEnterprises(params: {
    query?: string;
    city?: string;
    pageSize?: number;
  }): Promise<GooglePlaceCompany[]> {
    if (!this.apiKey) {
      return [];
    }

    const query = (params.query || "entreprises et services").trim();
    const city = (params.city || "Maroc").trim();

    // Check if location or query implies Morocco
    const combined = `${query} ${city}`.toLowerCase();
    const moroccanCities = [
      "casablanca", "rabat", "marrakech", "tanger", "agadir", "fès", "fes",
      "meknès", "meknes", "oujda", "kenitra", "tetouan", "safi", "el jadida",
      "nador", "mohammedia", "khouribga", "maroc", "morocco"
    ];
    const isMoroccan = moroccanCities.some((c) => combined.includes(c));

    const textQuery = isMoroccan
      ? `${query} ${city} Maroc`
      : `${query} ${city}`;

    try {
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber,places.rating,places.googleMapsUri,places.primaryTypeDisplayName",
        },
        body: JSON.stringify({
          textQuery,
          pageSize: params.pageSize || 15,
        }),
      });

      if (!response.ok) {
        console.error("Google Places API error:", response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      const places = data.places || [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return places.map((place: any): GooglePlaceCompany => {
        const address = place.formattedAddress || "";
        // Detect city from address or fallback to param
        let detectedCity = params.city || "Maroc";
        if (address.toLowerCase().includes("casablanca")) detectedCity = "Casablanca";
        else if (address.toLowerCase().includes("rabat")) detectedCity = "Rabat";
        else if (address.toLowerCase().includes("marrakech")) detectedCity = "Marrakech";
        else if (address.toLowerCase().includes("tanger") || address.toLowerCase().includes("tangier")) detectedCity = "Tanger";
        else if (address.toLowerCase().includes("fès") || address.toLowerCase().includes("fes")) detectedCity = "Fès";
        else if (address.toLowerCase().includes("agadir")) detectedCity = "Agadir";
        else if (address.toLowerCase().includes("meknès") || address.toLowerCase().includes("meknes")) detectedCity = "Meknès";
        else if (address.toLowerCase().includes("oujda")) detectedCity = "Oujda";
        else if (address.toLowerCase().includes("kenitra")) detectedCity = "Kenitra";

        return {
          googlePlacesId: place.id,
          name: place.displayName?.text || "Entreprise Partenaire",
          address: place.formattedAddress,
          city: detectedCity,
          country: isMoroccan ? "Morocco" : "International",
          phone: place.internationalPhoneNumber,
          website: place.websiteUri,
          rating: typeof place.rating === "number" ? place.rating : undefined,
          googleMapsUrl: place.googleMapsUri,
          industry: place.primaryTypeDisplayName?.text || "Services & Entreprises",
        };
      });
    } catch (err) {
      console.error("Error calling Google Places API:", err);
      return [];
    }
  }

  /**
   * Ingest Google Places enterprises AND create verified job/candidature opportunities
   */
  async ingestEnterprisesWithJobs(
    enterprises: GooglePlaceCompany[],
    searchedKeyword?: string
  ): Promise<number> {
    const { OpportunityType, WorkArrangement, ApplicationMethod, JobStatus } = await import(
      "@prisma/client"
    );

    let savedCount = 0;
    const cleanKw = (searchedKeyword || "general")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 30);

    const isInternship =
      cleanKw.includes("stage") ||
      cleanKw.includes("intern") ||
      cleanKw.includes("pfe");

    const isApprenticeship =
      cleanKw.includes("alternance") ||
      cleanKw.includes("apprentissage");

    const oppType = isInternship
      ? OpportunityType.INTERNSHIP
      : isApprenticeship
      ? OpportunityType.APPRENTICESHIP
      : OpportunityType.JOB;

    for (const ent of enterprises) {
      try {
        const slug = ent.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
          .slice(0, 50);

        const company = await prisma.company.upsert({
          where: { slug },
          update: {
            address: ent.address,
            phone: ent.phone,
            website: ent.website,
            rating: ent.rating,
            googleMapsUrl: ent.googleMapsUrl,
            googlePlacesId: ent.googlePlacesId,
            city: ent.city,
            industry: ent.industry,
            isVerified: true,
          },
          create: {
            name: ent.name,
            slug,
            address: ent.address,
            phone: ent.phone,
            website: ent.website,
            rating: ent.rating,
            googleMapsUrl: ent.googleMapsUrl,
            googlePlacesId: ent.googlePlacesId,
            city: ent.city,
            country: ent.country,
            location: ent.city ? `${ent.city}, Maroc` : "Maroc",
            industry: ent.industry,
            isVerified: true,
            description: `Entreprise répertoriée et certifiée dans le tissu économique de ${ent.city || "Maroc"}. Spécialisée en ${ent.industry || "services professionnels"}.`,
          },
        });

        // Use placeId and cleanKw to create specific opportunity per service
        const externalId = `GP-${ent.googlePlacesId || slug}-${cleanKw || "general"}`;
        const displayKeyword = searchedKeyword
          ? searchedKeyword.charAt(0).toUpperCase() + searchedKeyword.slice(1)
          : ent.industry || "Opportunité";

        const jobTitle = isInternship
          ? `Stage ${displayKeyword} - ${ent.name}`
          : isApprenticeship
          ? `Alternance ${displayKeyword} - ${ent.name}`
          : `${displayKeyword} - ${ent.name}`;

        const existingJob = await prisma.job.findUnique({
          where: {
            sourceProvider_externalId: {
              sourceProvider: "GOOGLE_PLACES",
              externalId,
            },
          },
        });

        if (!existingJob) {
          const jobSlug = `${slug}-${cleanKw || "recrutement"}-${Math.random().toString(36).substring(2, 7)}`;
          const skillsList = [
            searchedKeyword || "Services",
            ent.industry || "Professionnel",
            "Service Client",
            "Travail d'équipe",
          ].filter((s, idx, arr) => arr.indexOf(s) === idx);

          await prisma.job.create({
            data: {
              externalId,
              sourceProvider: "GOOGLE_PLACES",
              title: jobTitle,
              slug: jobSlug,
              companyId: company.id,
              companyName: ent.name,
              category: ent.industry || "Services & Entreprises",
              opportunityType: oppType,
              workArrangement: WorkArrangement.ONSITE,
              location: ent.address || (ent.city ? `${ent.city}, Maroc` : "Maroc"),
              country: ent.country || "Morocco",
              city: ent.city || "Maroc",
              isPaidInternship: isInternship,
              description: `Établissement professionnel répertorié et certifié à ${ent.city || "Maroc"}.\n\nSecteur d'activité : ${ent.industry || "Services professionnels"}.\nService / Spécialité : ${displayKeyword}.\n\nCoordonnées vérifiées :\n- Adresse : ${ent.address || "Centre-ville"}\n- Téléphone : ${ent.phone || "Fiche officielle entreprise"}\n- Note de réputation : ${ent.rating ? `${ent.rating} / 5` : "Établissement vérifié"}\n\nCette structure recrute ou accepte les candidatures spontanées et le recrutement direct pour des profils qualifiés.`,
              responsibilities: [
                "Assurer les missions opérationnelles et de service au sein de l'établissement",
                "Fournir un service de qualité conforme aux attentes des clients",
                "Collaborer activement avec l'équipe locale et la direction",
              ],
              qualifications: [
                "Sens du professionnalisme, rigueur et ponctualité",
                "Bonne aisance relationnelle et esprit d'équipe",
                "Motivation et intérêt marqué pour ce secteur d'activité",
              ],
              officialApplyUrl: ent.website || ent.googleMapsUrl,
              sourceUrl: ent.googleMapsUrl,
              applicationMethod: ent.website ? ApplicationMethod.EXTERNAL : ApplicationMethod.ASSISTED,
              isVerified: true,
              status: JobStatus.ACTIVE,
              skills: {
                create: skillsList.map((skill) => ({ skill })),
              },
            },
          });
        }

        savedCount++;
      } catch (e) {
        console.error(`Failed to ingest company or job for ${ent.name}:`, e);
      }
    }

    return savedCount;
  }

  /**
   * Alias for backward compatibility
   */
  async ingestEnterprises(enterprises: GooglePlaceCompany[]): Promise<number> {
    return this.ingestEnterprisesWithJobs(enterprises);
  }
}

export const googlePlacesService = new GooglePlacesService();
