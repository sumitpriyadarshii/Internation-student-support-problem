import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const env = fs.readFileSync('.env.local', 'utf-8');
let uri = '';
env.split(/\r?\n/).forEach(line => {
  if (line.startsWith('MONGODB_URI=')) {
    uri = line.slice('MONGODB_URI='.length).trim();
  }
});

const adminEmail = 'sumit@admin.com';
const adminPassword = '@Sumit20';
const adminName = 'Sumit Priyadarshi (Administrator)';

async function syncAllDatabases() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const targetDbs = ['test', 'farfromhome'];

  for (const dbName of targetDbs) {
    const db = mongoose.connection.client.db(dbName);
    const usersCol = db.collection('users');

    // Check if sumit@admin.com exists
    const existing = await usersCol.findOne({ email: adminEmail });

    if (existing) {
      await usersCol.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: adminName,
            passwordHash,
            role: 'admin',
            accountStatus: 'active',
            onboardingCompleted: true,
            failedLoginAttempts: 0,
            lockoutUntil: null,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`[${dbName}] Updated admin: ${adminEmail}`);
    } else {
      await usersCol.insertOne({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        accountStatus: 'active',
        onboardingCompleted: true,
        onboardingStep: 3,
        failedLoginAttempts: 0,
        lockoutUntil: null,
        profile: {
          languagesSpoken: ['English', 'Hindi'],
          interests: ['Administration'],
          supportPreferences: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[${dbName}] Created admin: ${adminEmail}`);
    }

    // Also update admin@farfromhome.com with the same password so both credentials work!
    const legacyAdmin = await usersCol.findOne({ email: 'admin@farfromhome.com' });
    if (legacyAdmin) {
      await usersCol.updateOne(
        { _id: legacyAdmin._id },
        {
          $set: {
            passwordHash,
            accountStatus: 'active',
            failedLoginAttempts: 0,
            lockoutUntil: null,
          },
        }
      );
      console.log(`[${dbName}] Updated legacy admin password: admin@farfromhome.com`);
    }

    // Verify
    const verifyUser = await usersCol.findOne({ email: adminEmail });
    const matches = await bcrypt.compare(adminPassword, verifyUser.passwordHash);
    console.log(`[${dbName}] Verification for ${adminEmail}: ${matches ? 'PASSED ✅' : 'FAILED ❌'}`);
  }

  await mongoose.disconnect();
}

syncAllDatabases().catch(console.error);
