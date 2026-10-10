# JobFinder AI 🚀

**Plateforme intelligente d'orientation, de découverte d'opportunités et de matching IA d'emplois et de stages au Maroc et à l'international.**

---

## 🌟 Présentation du Projet

**JobFinder AI** est une application web full-stack de production conçue pour répondre aux défis du recrutement des étudiants, jeunes diplômés et professionnels au Maroc et à l'international.

La plateforme intègre :
- **Recherche multicritère et en langage naturel** : requêtes précises ou expressions libres (ex: *"Stage PFE Python à Casablanca"*).
- **Matching IA de CV explicable & transparent** : extraction automatique de compétences (PDF/Word), analyse d'adéquation et recommandations personnalisées.
- **Triple méthode de candidature supervisée** :
  1. *Méthode A (Externe)* : Redirection sécurisée vers les sites officiels avec suivi automatique.
  2. *Méthode B (Assistée)* : Candidature directe avec lettre de motivation sur-mesure rédigée par l'IA et éditable.
  3. *Méthode C (Auto-Apply Supervisé)* : Pré-remplissage contrôlé nécessitant une validation humaine explicite.
- **Espaces dédiés par rôle (RBAC)** :
  - **Candidat** : Dépôt de CV, suivi des statuts de candidature, offres sauvegardées.
  - **Recruteur** : Profil entreprise vérifié, publication d'offres et analyse des candidatures.
  - **Administrateur** : Supervision des sources (Adzuna, Reed, Jooble), modération et importateur CSV.
- **Internationalisation & Accessibilité** : Support complet du Français (par défaut), de l'Anglais et de l'Arabe (avec support RTL natif).

---

## 🛠️ Stack Technologique

- **Frontend** : Next.js 16 (App Router), React 19, TypeScript
- **Styling & Design System** : Tailwind CSS, Glassmorphism, Thème sombre moderne SaaS
- **Animations** : Framer Motion
- **Iconographie** : Lucide React
- **Base de Données** : PostgreSQL 16 (Dockerisé en local, compatible Supabase/Neon/Railway en production)
- **ORM** : Prisma 6
- **Authentification** : JWT sécurisé via cookies `httpOnly`, hachage des mots de passe avec `bcryptjs`
- **Validation** : Zod
- **Extraction documentaire** : `pdf-parse`, `mammoth` (DOCX)
- **Intelligence Artificielle** : Adaptateur multi-fournisseur (Google Gemini 1.5, OpenAI GPT-4o-mini) avec repli déterministe certifié
- **Tests** : Vitest

---

## 🚀 Démarrage Rapide en Local

### 1. Prérequis
- Node.js >= 20.x
- Docker (ou une instance PostgreSQL active)

### 2. Démarrer la base de données PostgreSQL
Vous pouvez utiliser le conteneur Docker pré-configuré :
```bash
docker run -d --name jobfinder-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jobfinder_ai -p 5432:5432 postgres:16-alpine
```

### 3. Cloner et Installer les Dépendances
```bash
cd se3se3
npm install
```

### 4. Configurer l'environnement
Copiez `.env.example` vers `.env` et adaptez les variables :
```bash
cp .env.example .env
```

Variables clés :
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobfinder_ai?schema=public"
JWT_SECRET="jobfinder-ai-secure-jwt-secret-key-production-min-32-chars-2026"
NEXTAUTH_SECRET="jobfinder-ai-nextauth-secret-key-32-chars-minimum-token"
NEXTAUTH_URL="http://localhost:3000"

# Optionnel : IA Générative (Repli algorithmique déterministe actif par défaut)
GEMINI_API_KEY=""
OPENAI_API_KEY=""

# Optionnel : Clés des sources de données partenaires
ADZUNA_APP_ID=""
ADZUNA_APP_KEY=""
REED_API_KEY=""
JOOBLE_API_KEY=""
```

### 5. Synchroniser et Peupler la Base de Données
```bash
# Applique le schéma Prisma sur PostgreSQL
npx prisma db push

# Exécute le seed contenant des entreprises et opportunités réelles au Maroc & International
npm run seed
```

### 6. Lancer l'Application
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🔑 Comptes de Démonstration (Seed)

| Rôle | Email | Mot de passe | Description |
|---|---|---|---|
| **Candidat** | `candidat@alumni.ma` | `Password123!` | Profil ingénieur avec CV et candidatures actives |
| **Recruteur** | `recruteur@ocp.ma` | `Password123!` | Profil recruteur OCP Group avec gestion d'offres |
| **Administrateur** | `admin@jobfinder.ai` | `Password123!` | Accès complet console d'administration & synchronisation |

---

## 🧪 Tests & Assurance Qualité

Pour lancer la suite de tests unitaires et d'intégration :
```bash
npm run test
```

### Tests couverts :
- `tests/search.test.ts` : Parsing du langage naturel (détection ville, contrat, mot-clé).
- `tests/cv-parser.test.ts` : Extraction d'entités, compétences techniques, coordonnées.
- `tests/ai-matching.test.ts` : Calcul de correspondance, score global et détection des compétences manquantes.
- `tests/auth.test.ts` : Hachage de mot de passe bcrypt et tokens JWT signés.
- `tests/application.test.ts` : Règles de transition d'états pour les Méthodes A, B et C.

Pour compiler le build de production :
```bash
npm run build
```

---

## 🌐 Guide d'Intégration des Sources d'Emploi

JobFinder AI implémente une architecture modulaire d'adaptateurs (`JobSourceAdapter`) :

1. **Adzuna API** (`AdzunaAdapter`) :
   - *Couverture* : France, Royaume-Uni, USA, Afrique du Sud.
   - *Authentification* : `ADZUNA_APP_ID` et `ADZUNA_APP_KEY`.
2. **Reed API** (`ReedAdapter`) :
   - *Couverture* : International & UK.
   - *Authentification* : Basic Auth avec `REED_API_KEY`.
3. **Jooble API** (`JoobleAdapter`) :
   - *Couverture* : Maroc et international.
   - *Authentification* : `JOOBLE_API_KEY`.
4. **Partenaires & Employeurs Vérifiés** (`AuthorizedFeedAdapter`) :
   - Flux d'entreprises partenaires marocaines (OCP, Capgemini Maroc, Inwi, Attijariwafa, etc.).
5. **Importateur CSV Administrateur** :
   - Ingestion en masse de listes d'opportunités avec déduplication stricte.

---

## 🛡️ Sécurité & Protection de la Vie Privée

- **Confidentialité des CV** : Stockage sécurisé sans exécution de code, suppression intégrale sur demande (droit à l'oubli RGPD/CNDP).
- **Validation stricte** : Tous les endpoints et formulaires sont validés par des schémas Zod.
- **Déduplication robuste** : Comparaison croisée des identifiants externes et des signatures (titre, entreprise, localisation).
- **Consentement explicite** : Aucune candidature n'est transmise automatiquement sans l'accord préalable du candidat.

---

## 🚢 Déploiement en Production

1. **Hébergement Frontend / API** : Déployable directement sur **Vercel**, **Railway** ou **Render**.
2. **Base de Données** : Managed PostgreSQL sur **Neon**, **Supabase** ou **AWS RDS**.
3. **Variables d'environnement** : Renseigner les variables de `.env.example` dans le tableau de bord de l'hébergeur.
4. **Script de build** : `npx prisma generate && next build`.
