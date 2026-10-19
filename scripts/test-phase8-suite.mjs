/**
 * Phase 8 Production Readiness, SEO & Security Verification Suite
 */

const BASE_URL = "http://localhost:3000";

async function fetchRoute(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const text = await res.text();
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    text,
  };
}

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

async function runPhase8Suite() {
  console.log("=======================================================");
  console.log("PHASE 8 TEST SUITE: SEO, SECURITY & PRODUCTION READINESS");
  console.log("=======================================================\n");

  console.log("1. Security Headers Verification:");
  try {
    const home = await fetchRoute("/");
    assert(home.status === 200, "Home route returns HTTP 200");
    assert(
      home.headers["x-content-type-options"] === "nosniff",
      "X-Content-Type-Options: nosniff header present"
    );
    assert(
      home.headers["x-frame-options"] === "SAMEORIGIN",
      "X-Frame-Options: SAMEORIGIN header present"
    );
    assert(
      home.headers["referrer-policy"] === "strict-origin-when-cross-origin",
      "Referrer-Policy: strict-origin-when-cross-origin present"
    );
    assert(
      home.headers["x-dns-prefetch-control"] === "on",
      "X-DNS-Prefetch-Control: on present"
    );
    assert(
      home.headers["permissions-policy"]?.includes("camera=(), microphone=()"),
      "Permissions-Policy restricts sensitive device APIs"
    );
  } catch (err) {
    assert(false, `Security headers check failed: ${err.message}`);
  }

  console.log("\n2. Robots.txt Configuration & Indexing Rules:");
  try {
    const robots = await fetchRoute("/robots.txt");
    assert(robots.status === 200, "robots.txt returns HTTP 200");
    assert(
      robots.headers["content-type"]?.includes("text/plain"),
      "robots.txt content-type is text/plain"
    );
    assert(robots.text.includes("Disallow: /admin"), "robots.txt disallows /admin");
    assert(robots.text.includes("Disallow: /admin/login"), "robots.txt disallows /admin/login");
    assert(robots.text.includes("Disallow: /api/"), "robots.txt disallows /api/");
    assert(robots.text.includes("Allow: /"), "robots.txt allows root public routes");
    assert(robots.text.includes("Sitemap:"), "robots.txt points to sitemap.xml");
  } catch (err) {
    assert(false, `robots.txt check failed: ${err.message}`);
  }

  console.log("\n3. Sitemap.xml Configuration & Public Routes:");
  try {
    const sitemap = await fetchRoute("/sitemap.xml");
    assert(sitemap.status === 200, "sitemap.xml returns HTTP 200");
    assert(
      sitemap.headers["content-type"]?.includes("xml"),
      "sitemap.xml content-type is XML"
    );
    assert(sitemap.text.includes("https://manishkumar.dev"), "sitemap contains base domain");
    assert(sitemap.text.includes("https://manishkumar.dev/skills"), "sitemap lists /skills");
    assert(sitemap.text.includes("https://manishkumar.dev/projects"), "sitemap lists /projects");
    assert(sitemap.text.includes("https://manishkumar.dev/certificates"), "sitemap lists /certificates");
    assert(sitemap.text.includes("https://manishkumar.dev/about"), "sitemap lists /about");
    assert(sitemap.text.includes("https://manishkumar.dev/education"), "sitemap lists /education");
    assert(sitemap.text.includes("https://manishkumar.dev/experience"), "sitemap lists /experience");
    assert(sitemap.text.includes("https://manishkumar.dev/contact"), "sitemap lists /contact");
    assert(!sitemap.text.includes("/admin"), "sitemap does NOT leak private /admin route");
    assert(!sitemap.text.includes("/api/"), "sitemap does NOT leak internal /api/ routes");
  } catch (err) {
    assert(false, `sitemap.xml check failed: ${err.message}`);
  }

  console.log("\n4. Metadata & Structured Data (JSON-LD):");
  try {
    const home = await fetchRoute("/");
    assert(home.text.includes("application/ld+json"), "Homepage contains JSON-LD structured data");
    assert(home.text.includes("Manish Kumar"), "JSON-LD contains author name");
    assert(home.text.includes("schema.org"), "JSON-LD uses standard schema.org context");
    assert(home.text.includes("canonical"), "Canonical link tag present in head");
  } catch (err) {
    assert(false, `JSON-LD check failed: ${err.message}`);
  }

  console.log("\n5. 404 Not Found Handling:");
  try {
    const missing = await fetchRoute("/non-existent-page-phase8-check");
    assert(missing.status === 404, "Unknown URL returns HTTP 404 status");
    assert(missing.text.includes("Page Not Found"), "404 page renders clear heading");
    assert(missing.text.includes("Back to Homepage"), "404 page provides safe return CTA");
  } catch (err) {
    assert(false, `404 check failed: ${err.message}`);
  }

  console.log("\n6. Admin Route Protection & Security Guards:");
  try {
    // Attempting unauthenticated access to /admin must redirect to /admin/login
    const admin = await fetchRoute("/admin", { redirect: "manual" });
    assert(
      admin.status === 307 || admin.status === 302 || admin.status === 303,
      `Unauthenticated /admin redirects (status: ${admin.status})`
    );
    assert(
      admin.headers["location"]?.includes("/admin/login"),
      "Redirect destination points to /admin/login"
    );
  } catch (err) {
    assert(false, `Admin guard check failed: ${err.message}`);
  }

  console.log("\n=======================================================");
  console.log(`PHASE 8 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Suite();
