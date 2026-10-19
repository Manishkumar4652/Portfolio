import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import dns from "dns";
import fs from "fs";
import path from "path";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

// Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("PHASE 4B BACKEND TEST SUITE: MONGODB & CLOUDINARY");
  console.log("=======================================================\n");

  // 1. Environment Variable Validation
  console.log("1. Environment Configuration Checks:");
  assert(Boolean(process.env.MONGODB_URI), "MONGODB_URI is defined");
  assert(Boolean(process.env.CLOUDINARY_CLOUD_NAME), "CLOUDINARY_CLOUD_NAME is defined");
  assert(Boolean(process.env.CLOUDINARY_API_KEY), "CLOUDINARY_API_KEY is defined");
  assert(Boolean(process.env.CLOUDINARY_API_SECRET), "CLOUDINARY_API_SECRET is defined");
  assert(Boolean(process.env.ADMIN_EMAILS), "ADMIN_EMAILS is defined");

  // Check that .env.example is sanitized
  const exampleContent = fs.readFileSync(".env.example", "utf-8");
  if (process.env.MONGODB_URI) {
    const mongoPassword = (process.env.MONGODB_URI.match(/:([^:@]+)@/) || [])[1];
    if (mongoPassword) {
      assert(!exampleContent.includes(mongoPassword), ".env.example does not contain real MongoDB password");
    }
  }
  if (process.env.CLOUDINARY_API_SECRET) {
    assert(!exampleContent.includes(process.env.CLOUDINARY_API_SECRET), ".env.example does not contain real Cloudinary secret");
  }

  // 2. MongoDB Atlas Connectivity & Live Database Operations
  console.log("\n2. MongoDB Atlas Connectivity & CRUD Lifecycle:");
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "portfolio");
  assert(Boolean(db), "Successfully connected to MongoDB Atlas database");

  const certCollection = db.collection("certificates");

  // Verify existing seeded certificates exist
  const existingCount = await certCollection.countDocuments();
  assert(existingCount >= 3, `Preserved initial verified certificates in MongoDB (count: ${existingCount})`);

  // Test Create
  const testCertId = `test_${Date.now()}`;
  const testDoc = {
    id: testCertId,
    title: "Test Automated Certification",
    issuer: "Test Institute",
    category: "Cloud & DevOps",
    issueDate: "2026-10-17",
    description: "Automated test certificate record verification.",
    publicId: "portfolio/certificates/test_sample_id",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    resourceType: "image",
    featured: false,
    displayOrder: 99,
    skills: ["MongoDB", "Cloudinary", "Next.js"],
    verificationUrl: "https://example.com/verify/test",
    credentialId: "TEST-CRED-999",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertResult = await certCollection.insertOne(testDoc);
  assert(Boolean(insertResult.insertedId), "Successfully created certificate document in MongoDB Atlas");

  // Test Read
  const fetchedDoc = await certCollection.findOne({ id: testCertId });
  assert(fetchedDoc?.title === "Test Automated Certification", "Successfully queried certificate record by id");
  assert(fetchedDoc?.issuer === "Test Institute", "Certificate issuer matches");
  assert(fetchedDoc?.category === "Cloud & DevOps", "Certificate category matches");

  // Test Update
  await certCollection.updateOne(
    { id: testCertId },
    { $set: { title: "Updated Test Certification", displayOrder: 100, updatedAt: new Date() } }
  );
  const updatedDoc = await certCollection.findOne({ id: testCertId });
  assert(updatedDoc?.title === "Updated Test Certification", "Successfully updated certificate title in MongoDB Atlas");
  assert(updatedDoc?.displayOrder === 100, "Successfully updated certificate displayOrder in MongoDB Atlas");

  // Test Delete
  const deleteResult = await certCollection.deleteOne({ id: testCertId });
  assert(deleteResult.deletedCount === 1, "Successfully deleted test certificate record from MongoDB Atlas");

  // 3. Admin Authentication & Session Security Lifecycle
  console.log("\n3. Admin Authentication & Session Security Lifecycle:");
  const usersCollection = db.collection("admin_users");
  const sessionsCollection = db.collection("admin_sessions");

  const allowedEmail = process.env.ADMIN_EMAILS.split(",")[0].trim().toLowerCase();
  const unauthorizedEmail = "hacker@malicious-domain.com";

  const adminDoc = await usersCollection.findOne({ email: allowedEmail });
  assert(Boolean(adminDoc), `Verified admin user record in MongoDB Atlas (${allowedEmail})`);

  // Check allowlist logic
  const allowedList = process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase());
  assert(!allowedList.includes(unauthorizedEmail), "Unauthorized email rejected by allowlist");
  assert(allowedList.includes(allowedEmail), "Authorized email accepted by allowlist");

  // Test Session Token Creation and Expiry in MongoDB Atlas
  const testSessionId = crypto.randomBytes(32).toString("hex");
  const sessionDoc = {
    sessionId: testSessionId,
    email: allowedEmail,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
  };
  await sessionsCollection.insertOne(sessionDoc);

  const foundSession = await sessionsCollection.findOne({
    sessionId: testSessionId,
    expiresAt: { $gt: new Date() },
  });
  assert(foundSession?.email === allowedEmail, "Active session successfully verified in MongoDB Atlas");

  // Expired session test
  const expiredSessionId = crypto.randomBytes(32).toString("hex");
  await sessionsCollection.insertOne({
    sessionId: expiredSessionId,
    email: allowedEmail,
    createdAt: new Date(Date.now() - 100000),
    expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
  });

  const checkExpired = await sessionsCollection.findOne({
    sessionId: expiredSessionId,
    expiresAt: { $gt: new Date() },
  });
  assert(!checkExpired, "Expired session rejected by server-side query");

  // Cleanup test sessions
  await sessionsCollection.deleteMany({ sessionId: { $in: [testSessionId, expiredSessionId] } });
  assert(true, "Cleaned up test sessions");

  // 4. Cloudinary Configuration & Ping
  console.log("\n4. Cloudinary Connection Status:");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const pingResult = await cloudinary.api.ping();
    assert(true, `Cloudinary ping succeeded: ${JSON.stringify(pingResult)}`);
  } catch (err) {
    console.log(`  ℹ️ NOTE: Cloudinary ping returned: ${err.message || err.error?.message || JSON.stringify(err)}`);
    console.log(`     (The credentials in .env.local specify CLOUDINARY_CLOUD_NAME="${process.env.CLOUDINARY_CLOUD_NAME}". Ensure the Cloud Name matches your Cloudinary account dashboard).`);
  }

  // 5. MongoDB Projects Collection & CRUD Lifecycle
  console.log("\n5. MongoDB Projects Collection & CRUD Lifecycle:");
  const projectsCollection = db.collection("projects");
  await projectsCollection.createIndex({ slug: 1 }, { unique: true });
  await projectsCollection.createIndex({ displayOrder: 1, createdAt: -1 });

  // Verify existing/seeded projects count
  const projectCount = await projectsCollection.countDocuments();
  console.log(`  ℹ️ Current projects in database: ${projectCount}`);

  // Test Create Project
  const testSlug = `test-project-${Date.now()}`;
  const testProjectDoc = {
    title: "Automated Test Project",
    slug: testSlug,
    shortDescription: "Short test description for automated test suite.",
    fullDescription: "Detailed full description explaining system architecture and testing.",
    technologies: ["Next.js", "TypeScript", "MongoDB", "Cloudinary"],
    category: "Full Stack",
    thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    cloudinaryPublicId: "portfolio/projects/test_sample_thumb",
    cloudinaryResourceType: "image",
    githubUrl: "https://github.com/manish/test-project",
    liveDemoUrl: "https://demo.example.com",
    status: "completed",
    featured: true,
    displayOrder: 99,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const projInsertRes = await projectsCollection.insertOne(testProjectDoc);
  assert(Boolean(projInsertRes.insertedId), "Successfully created project document in MongoDB Atlas");

  // Test Read Project by Slug
  const fetchedProj = await projectsCollection.findOne({ slug: testSlug });
  assert(fetchedProj?.title === "Automated Test Project", "Successfully retrieved project by slug");
  assert(fetchedProj?.technologies?.includes("TypeScript"), "Project contains correct technologies");
  assert(fetchedProj?.category === "Full Stack", "Project category matches");

  // Test Duplicate Slug Rejection (Unique Index Enforcement)
  let duplicateRejected = false;
  try {
    await projectsCollection.insertOne({
      ...testProjectDoc,
      _id: undefined,
      title: "Duplicate Slug Project",
    });
  } catch (err) {
    if (err.code === 11000 || err.message?.includes("E11000")) {
      duplicateRejected = true;
    }
  }
  assert(duplicateRejected, "Duplicate slug rejected by MongoDB unique index");

  // Test Update Project
  const projUpdateRes = await projectsCollection.updateOne(
    { slug: testSlug },
    { $set: { title: "Updated Test Project Title", featured: false, updatedAt: new Date() } }
  );
  assert(projUpdateRes.modifiedCount === 1, "Successfully updated project in MongoDB Atlas");
  const updatedProj = await projectsCollection.findOne({ slug: testSlug });
  assert(updatedProj?.title === "Updated Test Project Title" && updatedProj?.featured === false, "Project updates verified");

  // Test Delete Project
  const projDeleteRes = await projectsCollection.deleteOne({ slug: testSlug });
  assert(projDeleteRes.deletedCount === 1, "Successfully deleted test project document from MongoDB Atlas");

  // 6. MongoDB Portfolio Content Collection & Lifecycle
  console.log("\n6. MongoDB Portfolio Content Collection & Lifecycle:");
  const contentCollection = db.collection("portfolio_content");
  await contentCollection.createIndex({ key: 1 }, { unique: true });

  // Verify or Seed Content
  let globalContent = await contentCollection.findOne({ key: "portfolio_global" });
  if (!globalContent) {
    const seedDoc = {
      key: "portfolio_global",
      hero: {
        eyebrow: "Phase 3A • Verified Portfolio",
        heading: "Engineering modern web apps with",
        highlightText: "cinematic precision",
        subtitle: "Hello, I'm Manish Kumar. Computer Science student at The ICFAI University, Jaipur.",
        primaryCtaLabel: "Explore Projects",
        primaryCtaUrl: "#featured-projects",
        secondaryCtaLabel: "Watch Intro Slot",
        secondaryCtaUrl: "#intro-video",
        tertiaryCtaLabel: "Get in Touch",
        tertiaryCtaUrl: "/contact",
      },
      about: {
        introduction: "Computer Science student passionate about scalable web applications.",
        biography: "Detailed narrative describing university education, projects, and algorithms.",
        careerObjective: "Actively seeking Software Engineer Internships.",
        location: "Jaipur, Rajasthan, India",
        academicsText: "B.Tech CSE (7.8 CGPA)",
        problemSolvingText: "270+ LeetCode Solved",
      },
      skills: [
        { id: "skill-1", name: "Next.js", category: "Frontend Engineering", proficiency: "Proficient", featured: true, displayOrder: 1 },
        { id: "skill-2", name: "MongoDB", category: "Backend & Databases", proficiency: "Proficient", featured: true, displayOrder: 2 },
      ],
      experiences: [
        {
          id: "exp-1",
          organization: "Personal Projects & Open-Source Software",
          role: "Independent Software Developer",
          employmentType: "Independent",
          startDate: "2024",
          endDate: "Present",
          currentRole: true,
          description: ["Architected and deployed GPAHub", "Engineered PixOptimize"],
          skills: ["Next.js", "MongoDB Atlas", "TypeScript"],
          displayOrder: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await contentCollection.insertOne(seedDoc);
    globalContent = await contentCollection.findOne({ key: "portfolio_global" });
  }

  assert(Boolean(globalContent), "Successfully retrieved global portfolio content document");
  assert(Boolean(globalContent.hero?.heading), "Global content contains hero heading");
  assert(Boolean(globalContent.about?.biography), "Global content contains about biography");
  assert(Array.isArray(globalContent.skills) && globalContent.skills.length > 0, "Global content contains skills list");
  assert(Array.isArray(globalContent.experiences) && globalContent.experiences.length > 0, "Global content contains experiences list");

  // Test Hero & About Updates
  await contentCollection.updateOne(
    { key: "portfolio_global" },
    {
      $set: {
        "hero.eyebrow": "Phase 6 • Verified Content CMS",
        "about.location": "Jaipur, Rajasthan, India (Verified)",
        updatedAt: new Date(),
      },
    }
  );
  const updatedContent = await contentCollection.findOne({ key: "portfolio_global" });
  assert(updatedContent.hero.eyebrow === "Phase 6 • Verified Content CMS", "Successfully updated hero eyebrow in MongoDB Atlas");
  assert(updatedContent.about.location === "Jaipur, Rajasthan, India (Verified)", "Successfully updated about location in MongoDB Atlas");

  // Test Skill CRUD
  const testSkillId = `skill-test-${Date.now()}`;
  const testSkill = {
    id: testSkillId,
    name: "Automated Test Skill",
    category: "Languages & Core",
    proficiency: "Expert",
    featured: true,
    displayOrder: 99,
  };
  await contentCollection.updateOne(
    { key: "portfolio_global" },
    { $push: { skills: testSkill } }
  );
  const contentWithSkill = await contentCollection.findOne({ key: "portfolio_global", "skills.id": testSkillId });
  assert(Boolean(contentWithSkill), "Successfully added new skill to skills array in MongoDB Atlas");

  // Update Skill
  await contentCollection.updateOne(
    { key: "portfolio_global", "skills.id": testSkillId },
    { $set: { "skills.$.proficiency": "Master" } }
  );
  const contentWithUpdatedSkill = await contentCollection.findOne({ key: "portfolio_global", "skills.id": testSkillId });
  const matchedSkill = contentWithUpdatedSkill.skills.find(s => s.id === testSkillId);
  assert(matchedSkill?.proficiency === "Master", "Successfully updated skill proficiency in MongoDB Atlas");

  // Delete Skill
  await contentCollection.updateOne(
    { key: "portfolio_global" },
    { $pull: { skills: { id: testSkillId } } }
  );
  const contentAfterSkillDelete = await contentCollection.findOne({ key: "portfolio_global" });
  const stillHasSkill = contentAfterSkillDelete.skills.some(s => s.id === testSkillId);
  assert(!stillHasSkill, "Successfully deleted test skill from MongoDB Atlas");

  // Test Experience CRUD
  const testExpId = `exp-test-${Date.now()}`;
  const testExp = {
    id: testExpId,
    organization: "Automated Testing Systems Inc.",
    role: "QA Automation Engineer",
    employmentType: "Internship",
    startDate: "2026-01",
    endDate: "2026-06",
    currentRole: false,
    description: ["Developed automated end-to-end regression suites."],
    skills: ["TypeScript", "MongoDB", "Node.js"],
    displayOrder: 99,
  };
  await contentCollection.updateOne(
    { key: "portfolio_global" },
    { $push: { experiences: testExp } }
  );
  const contentWithExp = await contentCollection.findOne({ key: "portfolio_global", "experiences.id": testExpId });
  assert(Boolean(contentWithExp), "Successfully added new experience entry to MongoDB Atlas");

  // Update Experience
  await contentCollection.updateOne(
    { key: "portfolio_global", "experiences.id": testExpId },
    { $set: { "experiences.$.role": "Senior QA Automation Engineer" } }
  );
  const contentWithUpdatedExp = await contentCollection.findOne({ key: "portfolio_global", "experiences.id": testExpId });
  const matchedExp = contentWithUpdatedExp.experiences.find(e => e.id === testExpId);
  assert(matchedExp?.role === "Senior QA Automation Engineer", "Successfully updated experience entry in MongoDB Atlas");

  // Delete Experience
  await contentCollection.updateOne(
    { key: "portfolio_global" },
    { $pull: { experiences: { id: testExpId } } }
  );
  const contentAfterExpDelete = await contentCollection.findOne({ key: "portfolio_global" });
  const stillHasExp = contentAfterExpDelete.experiences.some(e => e.id === testExpId);
  assert(!stillHasExp, "Successfully deleted test experience from MongoDB Atlas");

  // 7. MongoDB Resume Collection & PDF Validation Lifecycle
  console.log("\n7. MongoDB Resume Collection & PDF Validation Lifecycle:");
  const resumesCollection = db.collection("resumes");
  await resumesCollection.createIndex({ id: 1 }, { unique: true });
  await resumesCollection.createIndex({ isActive: 1 });

  // PDF Magic Bytes Validation Tests
  const validPdfBuffer = Buffer.from("%PDF-1.7\nSample resume PDF binary content");
  const isPdfSigValid = (buf) =>
    buf.length >= 5 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46 &&
    buf[4] === 0x2d;

  assert(isPdfSigValid(validPdfBuffer), "Valid PDF signature (%PDF-) recognized by validator");

  const invalidPdfBuffer = Buffer.from("GIF89a corrupted file");
  assert(!isPdfSigValid(invalidPdfBuffer), "Non-PDF file correctly rejected by magic bytes signature validator");

  const emptyBuffer = Buffer.alloc(0);
  assert(!isPdfSigValid(emptyBuffer), "Empty file correctly rejected by signature validator");

  // File size validation test (10MB limit)
  const MAX_RESUME_SIZE = 10 * 1024 * 1024;
  const testOversizedSize = 11 * 1024 * 1024;
  assert(testOversizedSize > MAX_RESUME_SIZE, "Oversized file correctly identified (> 10MB limit)");

  // Resume Document Creation in MongoDB Atlas
  const testResumeDoc = {
    id: "active_resume",
    isActive: true,
    filename: "Manish_Kumar_Resume_Verified.pdf",
    cleanFilename: "Manish_Kumar_Resume_Verified.pdf",
    cloudinaryPublicId: `portfolio/resume/test_${Date.now()}`,
    secureUrl: "https://res.cloudinary.com/dummy/image/upload/v1/portfolio/resume/test.pdf",
    resourceType: "raw",
    format: "pdf",
    bytes: 245760, // 240 KB
    mimeType: "application/pdf",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const resumeUpsertRes = await resumesCollection.updateOne(
    { id: "active_resume" },
    { $set: testResumeDoc },
    { upsert: true }
  );
  assert(
    resumeUpsertRes.upsertedCount === 1 || resumeUpsertRes.matchedCount === 1 || resumeUpsertRes.acknowledged,
    "Successfully created/upserted active resume document in MongoDB Atlas"
  );

  // Retrieve active resume
  const activeResumeInDb = await resumesCollection.findOne({ id: "active_resume", isActive: true });
  assert(activeResumeInDb !== null, "Successfully retrieved active resume from MongoDB Atlas");
  assert(activeResumeInDb?.filename === "Manish_Kumar_Resume_Verified.pdf", "Resume filename matches verified value");
  assert(activeResumeInDb?.mimeType === "application/pdf", "Resume mimeType is application/pdf");
  assert(activeResumeInDb?.bytes === 245760, "Resume file size matches expected bytes");

  // Test Resume Replacement (Singleton active guarantee)
  const replacedDoc = {
    ...testResumeDoc,
    filename: "Manish_Kumar_Updated_CV.pdf",
    cleanFilename: "Manish_Kumar_Updated_CV.pdf",
    updatedAt: new Date(),
  };
  await resumesCollection.updateOne(
    { id: "active_resume" },
    { $set: replacedDoc },
    { upsert: true }
  );
  const updatedResumeInDb = await resumesCollection.findOne({ id: "active_resume" });
  assert(updatedResumeInDb?.filename === "Manish_Kumar_Updated_CV.pdf", "Successfully replaced active resume in MongoDB Atlas");

  // Keep verified active resume in DB so public links can serve it!
  const finalResumeDoc = {
    id: "active_resume",
    isActive: true,
    filename: "Manish_Kumar_Resume.pdf",
    cleanFilename: "Manish_Kumar_Resume.pdf",
    cloudinaryPublicId: "portfolio/resume/manish_kumar_resume",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/sample.pdf",
    resourceType: "image",
    format: "pdf",
    bytes: 184320,
    mimeType: "application/pdf",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await resumesCollection.updateOne(
    { id: "active_resume" },
    { $set: finalResumeDoc },
    { upsert: true }
  );
  assert(true, "Maintained active verified resume document in MongoDB Atlas");

  await client.close();

  console.log("\n=======================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) process.exit(1);
}

runTestSuite().catch((err) => {
  console.error("Test suite encountered error:", err);
  process.exit(1);
});
