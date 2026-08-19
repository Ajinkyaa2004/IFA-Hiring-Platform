// Seeds (or resets the password of) the two local-auth accounts:
//   node scripts/seedAuthUsers.js <adminEmail> <adminPassword> <applicantEmail> <applicantPassword>
// Safe to re-run — upserts by email and only touches these two accounts.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../server/models/User.js';

dotenv.config();

const [adminEmail, adminPassword, applicantEmail, applicantPassword] = process.argv.slice(2);
if (!adminEmail || !adminPassword || !applicantEmail || !applicantPassword) {
  console.error('Usage: node scripts/seedAuthUsers.js <adminEmail> <adminPassword> <applicantEmail> <applicantPassword>');
  process.exit(1);
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const upsert = async (email, password, role, name) => {
  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email: normalized });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = role;
    await existing.save();
    console.log(`updated ${role}: ${normalized} (existing account, password set)`);
  } else {
    const id = newId();
    await User.create({
      id,
      googleId: `local:${id}`,
      email: normalized,
      name,
      role,
      passwordHash,
      createdAt: new Date(),
    });
    console.log(`created ${role}: ${normalized}`);
  }
};

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await upsert(adminEmail, adminPassword, 'admin', 'IFA Admin');
  await upsert(applicantEmail, applicantPassword, 'applicant', 'Test Candidate');
  await mongoose.disconnect();
  console.log('done');
};

main().catch((err) => { console.error(err); process.exit(1); });
