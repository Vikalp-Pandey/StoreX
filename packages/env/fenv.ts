import { z } from 'zod';
import dotenv from 'dotenv';

if (typeof window === 'undefined') {
  dotenv.config({ path: '../../packages/env/.env.local', quiet: true });
}

const withVite = (key: string) =>
  z.preprocess((val) => {
    if (val) return val;
    if (typeof window !== 'undefined') {
      return (import.meta as any).env[`VITE_${key}`];
    }
    return undefined;
  }, z.string());

const fenvSchema = z.object({
  BASE_BACKEND_URL: withVite('BASE_BACKEND_URL'),
  BASE_FRONTEND_URL: withVite('BASE_FRONTEND_URL'),

  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map((origin) => origin.trim())),
});

const getEnvSource = () => {
  if (typeof window !== 'undefined') {
    return (import.meta as any).env;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  return {};
};

const { data, success, error } = fenvSchema.safeParse(getEnvSource());

if (!success || !data) {
  console.error(error);
}

export const env = data;
export default env;
