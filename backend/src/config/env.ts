import { config } from 'dotenv';

config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: toNumber(process.env.PORT, 5000),
  MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/veda-ai',
  REDIS_HOST: process.env.REDIS_HOST ?? '127.0.0.1',
  REDIS_PORT: toNumber(process.env.REDIS_PORT, 6379),
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:3000',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};