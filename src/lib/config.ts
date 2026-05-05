export {};

const REQUIRED_ENV_VARS = [
  "STRIPE_API_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "DATABASE_URL",
  "EXTENSION_SECRET",
];

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
