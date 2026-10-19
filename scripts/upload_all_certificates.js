const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { MongoClient } = require('mongodb');

// Read environment
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
  console.log(`Starting Cloudinary upload and MongoDB sync for ${certsList.length} certificates...`);

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db('portfolio');
  const collection = db.collection('certificates');

  const certDir = path.join(process.cwd(), 'public', 'certificates');
  let successCount = 0;
  let failCount = 0;

  // Process sequentially or with slight delay to avoid saturating Cloudinary connections
  for (let i = 0; i < certsList.length; i++) {
    const cert = certsList[i];
    const filePath = path.join(certDir, cert.filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`[Skip] File not found: ${cert.filename}`);
      continue;
    }

    const safeBase = cert.filename
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 35);
    const publicId = `cert_${String(cert.displayOrder).padStart(2, '0')}_${safeBase}`;

    try {
      console.log(`[${i + 1}/${certsList.length}] Uploading: ${cert.filename} (${cert.title})...`);
      const uploadRes = await cloudinary.uploader.upload(filePath, {
        folder: 'portfolio/certificates',
        public_id: publicId,
        resource_type: 'auto',
        overwrite: true,
      });

      const certDoc = {
        id: cert.id,
        title: cert.title,
        issuer: cert.issuer,
        category: cert.category,
        issueDate: cert.issueDate,
        description: cert.description,
        skills: cert.skills || [],
        publicId: uploadRes.public_id,
        secureUrl: uploadRes.secure_url,
        resourceType: uploadRes.resource_type || 'image',
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

      // Keep record in memory for local fallback export
      cert.secureUrl = uploadRes.secure_url;
      cert.publicId = uploadRes.public_id;
      cert.filePath = certDoc.filePath;

      successCount++;
    } catch (err) {
      console.error(`Error uploading ${cert.filename}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n=== Cloudinary & MongoDB Complete ===`);
  console.log(`Successfully processed: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  // Write updated certificates with cloud URLs
  fs.writeFileSync('all_certificates_ready.json', JSON.stringify(certsList, null, 2), 'utf8');

  const totalInDb = await collection.countDocuments();
  console.log(`Total certificates in MongoDB Atlas: ${totalInDb}`);

  await client.close();
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
