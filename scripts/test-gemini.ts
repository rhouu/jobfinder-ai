import "dotenv/config";
import { matchCVWithJob, generateCoverLetter } from "../src/lib/ai/ai-service";

async function testGemini() {
  console.log("== Testing Gemini 3.6 Flash Integration ==");
  
  const testCV = {
    fullName: "Youssef El Amrani",
    email: "youssef@alumni.ma",
    skills: ["React", "TypeScript", "Node.js", "Docker", "Tailwind CSS", "PostgreSQL"],
    experience: [
      {
        title: "Fullstack Developer Intern",
        company: "Tech Morocco",
        duration: "6 months",
        description: "Built scalable web apps with React and Node.js"
      }
    ],
    education: [
      {
        degree: "Master en Ingénierie Logicielle",
        institution: "ENSIAS Rabat",
        year: "2025"
      }
    ],
    preferredLocation: "Casablanca, Maroc",
  };

  const testJob = {
    title: "Développeur Full Stack React / Node.js",
    companyName: "OCP Group",
    description: "Recherche un développeur talentueux pour concevoir des applications web modernes avec React, Node.js et PostgreSQL.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    category: "Informatique & Digital",
    location: "Casablanca, Maroc",
    opportunityType: "JOB",
  };

  console.log("Calling matchCVWithJob...");
  const matchResult = await matchCVWithJob(testCV, testJob);
  console.log("Match Result:", JSON.stringify(matchResult, null, 2));

  console.log("\nCalling generateCoverLetter...");
  const letterResult = await generateCoverLetter(
    testCV.fullName,
    testCV,
    testJob.title,
    testJob.companyName,
    testJob.description
  );
  console.log("Cover Letter Result (AIGenerated: " + letterResult.isAIGenerated + "):");
  console.log(letterResult.content.slice(0, 300) + "...");
}

testGemini().catch(console.error);
