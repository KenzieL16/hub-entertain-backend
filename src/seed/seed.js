import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { categories } from '../data/categories.js';
import { demoReviewers, demoReviews } from '../data/dummyData.js';
import { Category } from '../models/Category.js';
import { Content } from '../models/Content.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { buildContents } from './build.js';

const destroy = process.argv.includes('--destroy');
const force = process.argv.includes('--force');

function assertSeedUser() {
  const { email, password } = env.seedUser;
  if (!email || !password) {
    throw new Error('Set SEED_USER_EMAIL and SEED_USER_PASSWORD in .env to create your account.');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('SEED_USER_EMAIL is not a valid email address.');
  if (password.length < 8 || !/\d/.test(password)) {
    throw new Error('SEED_USER_PASSWORD must be at least 8 characters and include a number.');
  }
}

/** Buat akun dari .env; jika sudah ada, nama/password/role disamakan dengan .env. */
async function upsertSeedUser() {
  const { fullName, email, password, role } = env.seedUser;
  const user = (await User.findOne({ email })) || new User({ email });
  const isNew = user.isNew;
  Object.assign(user, { fullName, password, role }); // password di-hash oleh hook pre-save
  await user.save();
  console.log(`${isNew ? 'Created' : 'Updated'} account: ${email} (${role})`);
}

async function importData() {
  assertSeedUser();

  // Upsert berdasarkan slug, jadi _id konten tetap dan review yang sudah ada tidak yatim.
  await Category.bulkWrite(
    categories.map((c) => ({ updateOne: { filter: { slug: c.slug }, update: { $set: c }, upsert: true } }))
  );

  const contents = buildContents();
  await Content.bulkWrite(
    contents.map((c) => ({ updateOne: { filter: { slug: c.slug }, update: { $set: c }, upsert: true } }))
  );

  await upsertSeedUser();

  // Penulis review contoh (password acak, tidak bisa login)
  const reviewers = {};
  for (const u of demoReviewers) {
    reviewers[u.email] =
      (await User.findOne({ email: u.email })) ||
      (await User.create({ ...u, password: crypto.randomBytes(24).toString('hex') }));
  }

  // Review contoh: dibuat ulang setiap seed
  await Review.deleteMany({ user: { $in: Object.values(reviewers).map((u) => u._id) } });
  for (const r of demoReviews) {
    const content = await Content.findOne({ slug: r.slug }).select('_id');
    const createdAt = new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000);
    await Review.create({
      content: content._id,
      user: reviewers[r.email]._id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      createdAt,
      updatedAt: createdAt,
    });
  }

  console.log(`Seeded ${categories.length} categories, ${contents.length} contents, ${demoReviews.length} sample reviews.`);
}

async function destroyData() {
  await Review.deleteMany({});
  await Content.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({ email: { $in: demoReviewers.map((u) => u.email) } });
  console.log('Removed categories, contents, reviews, and sample reviewers. All real accounts (including yours) are kept.');
}

try {
  if (env.isProd && !force) {
    throw new Error('Refusing to run seed in production. Add --force if you really mean it.');
  }
  if (!destroy) assertSeedUser();
  await connectDB();
  await (destroy ? destroyData() : importData());
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}