const fs = require('fs');
const path = require('path');

function updatePersonalCerts() {
  const readyPath = path.join(process.cwd(), 'all_certificates_ready.json');
  if (!fs.existsSync(readyPath)) {
    console.error('all_certificates_ready.json not found');
    return;
  }

  const certs = JSON.parse(fs.readFileSync(readyPath, 'utf8'));
  const personalPath = path.join(process.cwd(), 'src', 'data', 'personal.ts');
  let content = fs.readFileSync(personalPath, 'utf8');

  const mappedCerts = certs.map((c) => ({
    id: c.id,
    title: c.title,
    issuer: c.issuer,
    issueDate: c.issueDate || '2025–2026',
    category: c.category,
    skills: c.skills || [],
    featured: Boolean(c.featured),
    verificationUrl: c.verificationUrl || undefined,
    credentialId: c.credentialId || undefined,
    filePath: c.filePath || `/certificates/${encodeURIComponent(c.filename)}`,
  }));

  const certsJson = JSON.stringify(mappedCerts, null, 2);

  const startMarker = 'certificates: [';
  const endMarker = '] as CertificateEntry[],';

  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.error('Markers for certificates not found in personal.ts');
    return;
  }

  const newSection = `certificates: ${certsJson} as CertificateEntry[],`;
  content = content.slice(0, startIndex) + newSection + content.slice(endIndex + endMarker.length);

  fs.writeFileSync(personalPath, content, 'utf8');
  console.log(`Successfully updated personal.ts with ${mappedCerts.length} certificates!`);
}

updatePersonalCerts();
