// import { z } from 'zod';
// import dotenv from 'dotenv';

// dotenv.config({ path: '../../packages/env/.env.local', quiet: true });

// const envSchema = z.object({
//   // Node Environment
//   NODE_ENV: z
//     .enum(['development', 'staging', 'production'])
//     .default('development'),

//   VITE_BASE_BACKEND_URL: z.string(),

//   // Application
//   ALLOWED_ORIGINS: z
//     .string()
//     .transform((val) => val.split(',').map((origin) => origin.trim())),

//   // Database
//   DATABASE_URL: z.string(),

//   // Port
//   PORT: z
//     .string()
//     .default('5000')
//     .transform((val) => parseInt(val, 10)),

//   // Jwt Secret Keys
//   ACCESS_SECRET: z.string(),
//   ACCESS_SECRET_TTL: z.string(),
//   ACCESS_SECRET_TTL_S: z.string(),

//   // SMTP Configuration
//   SMTP_NAME: z.string(),
//   SMTP_MAIL: z.string(),
//   SMTP_REPLY_TO: z.string(),
//   SMTP_HOST: z.string(),
//   SMTP_PORT: z
//     .string()
//     .default('587')
//     .transform((val) => parseInt(val, 10)),
//   SMTP_USERNAME: z.string(),
//   SMTP_PASSWORD: z.string(),

//   // Aws S3 Credentials
//   AWS_REGION: z.string(),
//   AWS_ACCESS_KEY_ID: z.string(),
//   AWS_SECRET_ACCESS_KEY: z.string(),
//   BUCKET_NAME: z.string(),

//   // Github OAuth Credentials
//   GITHUB_CLIENT_ID: z.string(),
//   GITHUB_CLIENT_SECRET: z.string(),
//   GITHUB_REDIRECT_URI: z.string(),
//   // Google OAuth Credentials
//   GOOGLE_CLIENT_ID: z.string(),
//   GOOGLE_CLIENT_SECRET: z.string(),
//   GOOGLE_REDIRECT_URI: z.string(),
// });

// const { data, success, error } = envSchema.safeParse(process.env);

// if (!success || !data) {
//   console.error(error);
//   process.exit(1);
// }

// const env = data;

// export default env;


import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import dotenv from 'dotenv';

dotenv.config({ path: '../../packages/env/.env.local', quiet: true });

const env = createEnv({
   server: {
          // Node Environment
        NODE_ENV: z
          .enum(['development', 'staging', 'production'])
          .default('development'),

        VITE_BASE_BACKEND_URL: z.string(),

        // Application
        ALLOWED_ORIGINS: z
          .string()
          .transform((val) => val.split(',').map((origin) => origin.trim())),

        // Database
        DATABASE_URL: z.string(),

        // Port
        PORT: z
          .string()
          .default('5000')
          .transform((val) => parseInt(val, 10)),

        // Jwt Secret Keys
        ACCESS_SECRET: z.string(),
        ACCESS_SECRET_TTL: z.string(),
        ACCESS_SECRET_TTL_S: z.string(),

        // SMTP Configuration
        SMTP_NAME: z.string(),
        SMTP_MAIL: z.string(),
        SMTP_REPLY_TO: z.string(),
        SMTP_HOST: z.string(),
        SMTP_PORT: z
          .string()
          .default('587')
          .transform((val) => parseInt(val, 10)),
        SMTP_USERNAME: z.string(),
        SMTP_PASSWORD: z.string(),

        // Aws S3 Credentials
        AWS_REGION: z.string(),
        AWS_ACCESS_KEY_ID: z.string(),
        AWS_SECRET_ACCESS_KEY: z.string(),
        BUCKET_NAME: z.string(),

        // Github OAuth Credentials
        GITHUB_CLIENT_ID: z.string(),
        GITHUB_CLIENT_SECRET: z.string(),
        GITHUB_REDIRECT_URI: z.string(),
        // Google OAuth Credentials
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
        GOOGLE_REDIRECT_URI: z.string(),
  },

  runtimeEnv: process.env,
})

export default env;