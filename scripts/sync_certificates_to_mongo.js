const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { MongoClient } = require('mongodb');

const envFile = fs.readFileSync('.env.local', 'utf8');
const cldName = envFile.match(/CLOUDINARY_CLOUD_NAME=(.*)/)[1].trim();
const cldKey = envFile.match(/CLOUDINARY_API_KEY=(.*)/)[1].trim();
const cldSecret = envFile.match(/CLOUDINARY_API_SECRET=(.*)/)[1].trim();
const mongoUri = envFile.match(/MONGODB_URI=(.*)/)[1].trim();

cloudinary.config({
  cloud_name: cldName,
  api_key: cldKey,
  api_secret: cldSecret,
  secure: true,
});

async function run() {
  const certsList = JSON.parse(fs.readFileSync('all_certificates_ready.json', 'utf8'));
  console.log(`Syncing ${certsList.length} certificates to MongoDB Atlas...`);

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db('portfolio');
  const collection = db.collection('certificates');

  // Delete any document where id is null
  await collection.deleteMany({ id: null });
  // Also delete test unstop if any
  await collection.deleteMany({ title: 'unstop', issuer: 'unstop' });

  for (let i = 0; i < certsList.length; i++) {
    const cert = certsList[i];
    const safeBase = cert.filename
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 35);
    const publicId = `portfolio/certificates/cert_${String(cert.displayOrder).padStart(2, '0')}_${safeBase}`;

    // Get asset info from Cloudinary or upload if missing
    let secureUrl = `https://res.cloudinary.com/${cldName}/image/upload/${publicId}.pdf`;
    let resourceType = 'image';

    const filePath = path.join(process.cwd(), 'public', 'certificates', cert.filename);

    // Ensure Cloudinary upload is verified
    try {
      const res = await cloudinary.api.resource(publicId, { resource_type: 'image' });
      secureUrl = res.secure_url;
      resourceType = res.resource_type;
    } catch {
      // If not yet uploaded, upload now
      if (fs.existsSync(filePath)) {
        console.log(`Uploading missing asset to Cloudinary: ${cert.filename}...`);
        const up = await cloudinary.uploader.upload(filePath, {
          folder: 'portfolio/certificates',
          public_id: `cert_${String(cert.displayOrder).padStart(2, '0')}_${safeBase}`,
          resource_type: 'auto',
          overwrite: true,
        });
        secureUrl = up.secure_url;
        resourceType = up.resource_type;
      }
    }

    const certDoc = {
      id: cert.id,
      title: cert.title,
      issuer: cert.issuer,
      category: cert.category,
      issueDate: cert.issueDate,
      description: cert.description,
      skills: cert.skills || [],
      publicId,
      secureUrl,
      resourceType,
      featured: Boolean(cert.featured),
      displayOrder: cert.displayOrder,
      verificationUrl: cert.verificationUrl || null,
      credentialId: cert.credentialId || null,
      filePath: `/certificates/${encodeURIComponent(cert.filename)}`,
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { id: cert.id },
      {
        $set: certDoc,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    cert.secureUrl = secureUrl;
    cert.publicId = publicId;
    cert.filePath = certDoc.filePath;
  }

  // Save updated json
  fs.writeFileSync('all_certificates_ready.json', JSON.stringify(certsList, null, 2), 'utf8');

  const count = await collection.countDocuments();
  console.log(`\n=== Sync Complete ===`);
  console.log(`Total verified certificates in MongoDB Atlas: ${count}`);

  await client.close();
}

run().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
