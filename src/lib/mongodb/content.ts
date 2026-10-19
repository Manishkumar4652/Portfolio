import { getDb } from "./client";
import { isMongoConfigured } from "./config";
import { personalData } from "@/data/personal";
import type {
  HeroContent,
  AboutContent,
  SkillItem,
  ExperienceItem,
  PortfolioContentDocument,
  PortfolioContentDisplay,
  EmploymentType,
} from "./types";
import type { Collection } from "mongodb";

const CONTENT_COLLECTION = "portfolio_content";
const GLOBAL_CONTENT_KEY = "portfolio_global";

let indexesEnsured = false;

/**
 * Returns the MongoDB collection for portfolio content.
 * Ensures the unique index on `{ key: 1 }` is created.
 */
export async function getContentCollection(): Promise<Collection<PortfolioContentDocument> | null> {
  const db = await getDb();
  if (!db) return null;

  const collection = db.collection<PortfolioContentDocument>(CONTENT_COLLECTION);

  if (!indexesEnsured) {
    try {
      await collection.createIndex({ key: 1 }, { unique: true });
      indexesEnsured = true;
    } catch (err) {
      console.warn("Could not ensure index on portfolio_content:", err);
    }
  }

  return collection;
}

/**
 * Constructs the canonical default content derived from personalData.
 * Used for initial seeding and resilient local fallback.
 */
export function getDefaultPortfolioContent(): PortfolioContentDisplay {
  const defaultHero: HeroContent = {
    eyebrow: "Phase 3A • Verified Portfolio",
    heading: "Hi, I'm Manish Kumar Prajapat",
    highlightText: "Aspiring Full Stack Web Developer",
    subtitle: `Hello, I'm ${personalData.identity.preferredName} (${personalData.identity.fullName}). ${personalData.identity.shortBio}`,
    primaryCtaLabel: "Explore Projects",
    primaryCtaUrl: "#featured-projects",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
    tertiaryCtaLabel: "Get in Touch",
    tertiaryCtaUrl: "/contact",
  };

  const defaultAbout: AboutContent = {
    introduction:
      "Aspiring Full Stack Web Developer and Computer Science student passionate about data structures, scalable web applications, and AI technologies.",
    biography: `I am a Computer Science undergraduate student pursuing my Bachelor of Technology (B.Tech) at The ICFAI University, Jaipur (2024–2028) with an 8.0 CGPA. I have hands-on experience in building responsive and user-friendly web applications, skilled in React.js, Next.js, Node.js, Express.js, MongoDB, HTML, CSS, and JavaScript.

With over 350+ problems solved on LeetCode, I focus heavily on algorithmic problem solving and data structures. On the engineering side, I design and build production-ready applications such as GPAHub (an Indian university grade conversion platform), PixOptimize (a zero-server client-side image compression tool), and AquaAlert AI (a water scarcity early warning system developed during my AICTE/1M1B internship).`,
    careerObjective: "",
    location: personalData.identity.location,
    academicsText: "B.Tech CSE (8.0 CGPA), The ICFAI University, Jaipur",
    problemSolvingText: "350+ LeetCode Solved, Data Structures & Algorithms",
  };

  // Flatten personalData.skills into typed SkillItem records
  const defaultSkills: SkillItem[] = [];
  let skillCounter = 1;

  for (const cat of personalData.skills) {
    for (const skillName of cat.skills) {
      const cleaned = skillName
        .toLowerCase()
        .replace(/\+\+/g, "plusplus")
        .replace(/#/g, "sharp")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const slugId = `skill-${cleaned || skillCounter}`;
      defaultSkills.push({
        id: slugId,
        name: skillName,
        category: cat.title,
        proficiency: "Proficient",
        featured: true,
        displayOrder: skillCounter++,
      });
    }
  }

  // Map personalData.experience into typed ExperienceItem records
  const defaultExperiences: ExperienceItem[] = personalData.experience.map((exp, idx) => {
    const isInternship = exp.role.toLowerCase().includes("intern") || exp.employmentType === "Internship";
    const dates = exp.period.split(/[–-]/).map((s) => s.trim());
    return {
      id: `exp-${idx + 1}`,
      organization: exp.organization,
      role: exp.role,
      employmentType: (exp.employmentType as EmploymentType) || (isInternship ? "Internship" : "Independent"),
      startDate: dates[0] || "2024",
      endDate: dates[1] || "Present",
      currentRole: !isInternship && dates[1]?.toLowerCase() === "present",
      location: exp.location,
      description: exp.description,
      skills: exp.skills || (isInternship
        ? ["HTML5", "CSS3", "JavaScript", "HTML5 Canvas", "Responsive Web Design"]
        : ["React.js", "Next.js", "Express.js", "MongoDB", "Tailwind CSS", "LeetCode"]),
      displayOrder: idx + 1,
    };
  });

  return {
    hero: defaultHero,
    about: defaultAbout,
    skills: defaultSkills,
    experiences: defaultExperiences,
    source: "local",
  };
}

/**
 * Idempotently initializes the global portfolio content in MongoDB Atlas
 * only if it does not yet exist. Never overwrites existing user modifications.
 */
export async function autoSeedContentIfMissing(): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) return;

  try {
    const existing = await collection.findOne({ key: GLOBAL_CONTENT_KEY });
    if (!existing) {
      const defaultContent = getDefaultPortfolioContent();
      const doc: PortfolioContentDocument = {
        key: GLOBAL_CONTENT_KEY,
        hero: defaultContent.hero,
        about: defaultContent.about,
        skills: defaultContent.skills,
        experiences: defaultContent.experiences,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await collection.insertOne(doc);
      console.log("Successfully initialized default portfolio content in MongoDB Atlas.");
    }
  } catch (err) {
    console.error("Error checking or seeding portfolio content:", err);
  }
}

/**
 * Retrieves the global portfolio content.
 * Falls back to default local data if database is unavailable.
 */
export async function getPortfolioContent(): Promise<PortfolioContentDisplay> {
  if (!isMongoConfigured()) {
    return getDefaultPortfolioContent();
  }

  try {
    const collection = await getContentCollection();
    if (!collection) return getDefaultPortfolioContent();

    let doc = await collection.findOne({ key: GLOBAL_CONTENT_KEY });

    if (!doc) {
      await autoSeedContentIfMissing();
      doc = await collection.findOne({ key: GLOBAL_CONTENT_KEY });
    }

    if (!doc) return getDefaultPortfolioContent();

    // Auto-migrate legacy heading if present
    if (doc.hero && (doc.hero.heading === "Engineering modern web apps with" || !doc.hero.heading)) {
      doc.hero.heading = "Aspiring";
      doc.hero.highlightText = "Full Stack Web Developer";
      collection.updateOne(
        { key: GLOBAL_CONTENT_KEY },
        { $set: { "hero.heading": "Aspiring", "hero.highlightText": "Full Stack Web Developer" } }
      ).catch(() => {});
    }

    return {
      hero: doc.hero,
      about: doc.about,
      skills: (doc.skills || []).sort((a, b) => a.displayOrder - b.displayOrder),
      experiences: (doc.experiences || []).sort((a, b) => a.displayOrder - b.displayOrder),
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : undefined,
      source: "mongodb",
    };
  } catch (err) {
    console.error("Failed to fetch portfolio content from MongoDB:", err);
    return getDefaultPortfolioContent();
  }
}

/**
 * Server-side input validation helper for URLs.
 * Accepts valid relative URLs (starts with / or #) or absolute URLs (http:// or https://).
 */
export function isValidContentUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Updates the Homepage Hero content section in MongoDB Atlas.
 */
export async function updateHeroContentInDb(heroData: HeroContent): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  // Validate URLs
  if (heroData.primaryCtaUrl && !isValidContentUrl(heroData.primaryCtaUrl)) {
    throw new Error("Primary CTA URL must be a valid relative path (e.g. /projects or #section) or http(s) URL.");
  }
  if (heroData.secondaryCtaUrl && !isValidContentUrl(heroData.secondaryCtaUrl)) {
    throw new Error("Secondary CTA URL must be a valid relative path or http(s) URL.");
  }
  if (heroData.tertiaryCtaUrl && !isValidContentUrl(heroData.tertiaryCtaUrl)) {
    throw new Error("Tertiary CTA URL must be a valid relative path or http(s) URL.");
  }

  // Ensure record exists
  await autoSeedContentIfMissing();

  await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY },
    {
      $set: {
        hero: {
          eyebrow: (heroData.eyebrow || "").trim(),
          heading: (heroData.heading || "").trim(),
          highlightText: (heroData.highlightText || "").trim(),
          subtitle: (heroData.subtitle || "").trim(),
          primaryCtaLabel: (heroData.primaryCtaLabel || "").trim(),
          primaryCtaUrl: (heroData.primaryCtaUrl || "").trim(),
          secondaryCtaLabel: (heroData.secondaryCtaLabel || "").trim(),
          secondaryCtaUrl: (heroData.secondaryCtaUrl || "").trim(),
          tertiaryCtaLabel: (heroData.tertiaryCtaLabel || "").trim(),
          tertiaryCtaUrl: (heroData.tertiaryCtaUrl || "").trim(),
        },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

/**
 * Updates the About page content in MongoDB Atlas.
 */
export async function updateAboutContentInDb(aboutData: AboutContent): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  await autoSeedContentIfMissing();

  await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY },
    {
      $set: {
        about: {
          introduction: (aboutData.introduction || "").trim(),
          biography: (aboutData.biography || "").trim(),
          careerObjective: (aboutData.careerObjective || "").trim(),
          location: (aboutData.location || "").trim(),
          academicsText: (aboutData.academicsText || "").trim(),
          problemSolvingText: (aboutData.problemSolvingText || "").trim(),
        },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

/**
 * Saves the entire list of skills, preserving order and ids.
 */
export async function updateSkillsInDb(skills: SkillItem[]): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  // Validate each skill
  for (const s of skills) {
    if (!s.name || !s.name.trim()) {
      throw new Error("Each skill must have a valid non-empty name.");
    }
    if (!s.category || !s.category.trim()) {
      throw new Error("Each skill must belong to a category.");
    }
  }

  await autoSeedContentIfMissing();

  await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY },
    {
      $set: {
        skills,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Adds a new skill to the collection.
 */
export async function addSkillToDb(skill: Omit<SkillItem, "id">): Promise<SkillItem> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  if (!skill.name || !skill.name.trim()) {
    throw new Error("Skill name cannot be empty.");
  }
  if (!skill.category || !skill.category.trim()) {
    throw new Error("Skill category is required.");
  }

  await autoSeedContentIfMissing();

  const id = `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newSkill: SkillItem = {
    id,
    name: skill.name.trim(),
    category: skill.category.trim(),
    proficiency: skill.proficiency?.trim() || "Proficient",
    featured: Boolean(skill.featured),
    displayOrder: Number(skill.displayOrder) || 1,
  };

  await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY },
    {
      $push: { skills: newSkill },
      $set: { updatedAt: new Date() },
    }
  );

  return newSkill;
}

/**
 * Updates a specific skill by id.
 */
export async function updateSkillInDb(skillId: string, updates: Partial<SkillItem>): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  await autoSeedContentIfMissing();

  const setFields: Record<string, unknown> = { updatedAt: new Date() };
  if (updates.name !== undefined) setFields["skills.$.name"] = updates.name.trim();
  if (updates.category !== undefined) setFields["skills.$.category"] = updates.category.trim();
  if (updates.proficiency !== undefined) setFields["skills.$.proficiency"] = updates.proficiency.trim();
  if (updates.featured !== undefined) setFields["skills.$.featured"] = Boolean(updates.featured);
  if (updates.displayOrder !== undefined) setFields["skills.$.displayOrder"] = Number(updates.displayOrder);

  const res = await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY, "skills.id": skillId },
    { $set: setFields }
  );

  if (res.matchedCount === 0) {
    throw new Error(`Skill with ID '${skillId}' was not found.`);
  }
}

/**
 * Deletes a skill by id.
 */
export async function deleteSkillFromDb(skillId: string): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  await autoSeedContentIfMissing();

  await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY },
    {
      $pull: { skills: { id: skillId } },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Saves the entire list of experiences.
 */
export async function updateExperiencesInDb(experiences: ExperienceItem[]): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  for (const exp of experiences) {
    if (!exp.role || !exp.role.trim()) {
      throw new Error("Experience role is required.");
    }
    if (!exp.organization || !exp.organization.trim()) {
      throw new Error("Experience organization is required.");
    }
  }

  await autoSeedContentIfMissing();

  await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY },
    {
      $set: {
        experiences,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Adds an experience entry.
 */
export async function addExperienceToDb(exp: Omit<ExperienceItem, "id">): Promise<ExperienceItem> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  if (!exp.role || !exp.role.trim()) {
    throw new Error("Role title is required.");
  }
  if (!exp.organization || !exp.organization.trim()) {
    throw new Error("Organization name is required.");
  }

  await autoSeedContentIfMissing();

  const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const validEmploymentTypes: EmploymentType[] = [
    "Internship",
    "Independent",
    "Full-time",
    "Part-time",
    "Contract",
  ];
  const employmentType = validEmploymentTypes.includes(exp.employmentType)
    ? exp.employmentType
    : "Independent";

  const newExp: ExperienceItem = {
    id,
    organization: exp.organization.trim(),
    role: exp.role.trim(),
    employmentType,
    startDate: (exp.startDate || "").trim(),
    endDate: (exp.endDate || "").trim(),
    currentRole: Boolean(exp.currentRole),
    location: exp.location?.trim() || undefined,
    description: Array.isArray(exp.description)
      ? exp.description.map((d) => d.trim()).filter(Boolean)
      : [],
    skills: Array.isArray(exp.skills)
      ? exp.skills.map((s) => s.trim()).filter(Boolean)
      : [],
    displayOrder: Number(exp.displayOrder) || 1,
  };

  await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY },
    {
      $push: { experiences: newExp },
      $set: { updatedAt: new Date() },
    }
  );

  return newExp;
}

/**
 * Updates an experience entry by id.
 */
export async function updateExperienceInDb(
  expId: string,
  updates: Partial<ExperienceItem>
): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  await autoSeedContentIfMissing();

  const setFields: Record<string, unknown> = { updatedAt: new Date() };
  if (updates.role !== undefined) setFields["experiences.$.role"] = updates.role.trim();
  if (updates.organization !== undefined)
    setFields["experiences.$.organization"] = updates.organization.trim();
  if (updates.employmentType !== undefined)
    setFields["experiences.$.employmentType"] = updates.employmentType;
  if (updates.startDate !== undefined) setFields["experiences.$.startDate"] = updates.startDate.trim();
  if (updates.endDate !== undefined) setFields["experiences.$.endDate"] = updates.endDate.trim();
  if (updates.currentRole !== undefined)
    setFields["experiences.$.currentRole"] = Boolean(updates.currentRole);
  if (updates.location !== undefined)
    setFields["experiences.$.location"] = updates.location.trim();
  if (updates.description !== undefined)
    setFields["experiences.$.description"] = updates.description.map((d) => d.trim()).filter(Boolean);
  if (updates.skills !== undefined)
    setFields["experiences.$.skills"] = updates.skills.map((s) => s.trim()).filter(Boolean);
  if (updates.displayOrder !== undefined)
    setFields["experiences.$.displayOrder"] = Number(updates.displayOrder);

  const res = await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY, "experiences.id": expId },
    { $set: setFields }
  );

  if (res.matchedCount === 0) {
    throw new Error(`Experience with ID '${expId}' was not found.`);
  }
}

/**
 * Deletes an experience entry by id.
 */
export async function deleteExperienceFromDb(expId: string): Promise<void> {
  const collection = await getContentCollection();
  if (!collection) {
    throw new Error("MongoDB database is not available.");
  }

  await autoSeedContentIfMissing();

  await collection.updateOne(
    { key: GLOBAL_CONTENT_KEY },
    {
      $pull: { experiences: { id: expId } },
      $set: { updatedAt: new Date() },
    }
  );
}
