import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env variable(s): ${missing.join(', ')}. Copy .env.example to .env first.`);
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '30d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
  seedUser: {
    fullName: process.env.SEED_USER_NAME || 'Admin',
    email: (process.env.SEED_USER_EMAIL || '').trim().toLowerCase(),
    password: process.env.SEED_USER_PASSWORD || '',
    role: process.env.SEED_USER_ROLE === 'admin' ? 'admin' : 'user',
  },
};
