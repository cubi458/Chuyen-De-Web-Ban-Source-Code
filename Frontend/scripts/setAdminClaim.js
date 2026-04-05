const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const uid = process.argv[2];
const customServiceAccountPath = process.argv[3];

if (!uid) {
  console.error('Usage: node scripts/setAdminClaim.js <UID> [path-to-service-account.json]');
  process.exit(1);
}

const defaultServiceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccountPath =
  customServiceAccountPath || process.env.FIREBASE_ADMIN_SA || defaultServiceAccountPath;

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account json not found at: ${serviceAccountPath}`);
  console.error('Download a Firebase Admin SDK service account key and pass its path.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

(async () => {
  try {
    const user = await admin.auth().getUser(uid);
    const currentClaims = user.customClaims || {};
    if (currentClaims.role === 'admin') {
      console.log(`User ${uid} is already an admin.`);
      return;
    }

    const updatedClaims = { ...currentClaims, role: 'admin' };
    await admin.auth().setCustomUserClaims(uid, updatedClaims);
    await admin.auth().revokeRefreshTokens(uid);

    console.log(`Admin role assigned to user ${uid}.`);
    console.log('Have the user sign out and sign in again so the new claim takes effect.');
  } catch (error) {
    console.error('Failed to assign admin role:', error);
    process.exitCode = 1;
  }
})();
