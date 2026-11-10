import fs from 'fs';
import path from 'path';
import dns from 'dns';
import readline from 'readline';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  }
}

function getArgValue(flag: string): string {
  const prefix = `${flag}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return '';
}

function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const queuedLines: string[] = [];
  let pendingResolver: ((line: string | null) => void) | null = null;
  let closed = false;

  rl.on('line', (line) => {
    if (pendingResolver) {
      const resolve = pendingResolver;
      pendingResolver = null;
      resolve(line);
    } else {
      queuedLines.push(line);
    }
  });

  rl.on('close', () => {
    closed = true;
    if (pendingResolver) {
      const resolve = pendingResolver;
      pendingResolver = null;
      resolve(null);
    }
  });

  return {
    async ask(prompt: string): Promise<string> {
      process.stdout.write(prompt);
      if (queuedLines.length > 0) {
        return queuedLines.shift() ?? '';
      }
      if (closed) return '';
      return new Promise<string>((resolve) => {
        pendingResolver = (val) => resolve(val ?? '');
      });
    },
    close() {
      rl.close();
    },
  };
}

async function syncAdmin() {
  loadEnv();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Error: MONGODB_URI is not set.');
    process.exit(1);
  }

  let adminEmail = (getArgValue('--email') || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  let adminPassword = getArgValue('--password') || process.env.ADMIN_PASSWORD || '';
  const adminName = (getArgValue('--name') || process.env.ADMIN_NAME || 'System Administrator').trim();

  if (!adminEmail || !adminPassword) {
    const prompter = createPrompter();
    try {
      if (!adminEmail) {
        adminEmail = (await prompter.ask('Enter admin email: ')).toLowerCase().trim();
      }
      if (!adminPassword) {
        adminPassword = (await prompter.ask('Enter new admin password: ')).trim();
      }
    } finally {
      prompter.close();
    }
  }

  if (!adminEmail || !adminPassword) {
    console.error('Error: Both email and password are required.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });

  try {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { role: 'admin' }],
    });

    if (existingAdmin) {
      await User.updateOne(
        { _id: existingAdmin._id },
        {
          $set: {
            email: adminEmail,
            passwordHash,
            name: adminName,
            role: 'admin',
            accountStatus: 'active',
            onboardingCompleted: true,
            failedLoginAttempts: 0,
            lockoutUntil: null,
          },
        }
      );
      console.log(`Updated admin account: ${adminEmail}`);
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        accountStatus: 'active',
        onboardingCompleted: true,
        onboardingStep: 3,
      });
      console.log(`Created admin account: ${adminEmail}`);
    }

    const verifiedUser = await User.findOne({
      email: adminEmail,
      role: 'admin',
      accountStatus: 'active',
    });
    const matches = verifiedUser?.passwordHash
      ? await bcrypt.compare(adminPassword, verifiedUser.passwordHash)
      : false;
    console.log(`Verification passed: ${matches}`);

    if (!matches) {
      throw new Error('Admin password hash verification failed.');
    }
  } finally {
    await mongoose.disconnect();
  }
}

syncAdmin().catch((err) => {
  console.error('Failed to sync admin user:', err.message);
  process.exit(1);
});
