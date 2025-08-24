import { config } from "dotenv"
import { z } from "zod"
config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    PORT: z.coerce.number().default(3000),

    MONGODB_URI: z.string().url(),

    JWT_ACCESS_SECRET: z.string().min(20),
    JWT_REFRESH_SECRET: z.string().min(20),
    JWT_ACCESS_EXPIRES: z.coerce.number().default(900),
    JWT_REFRESH_EXPIRES: z.coerce.number().default(2592000),

    UPLOAD_DIR: z.string().default("uploads"),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().optional(),

    FRONTEND_URL: z.string().optional().default("http://localhost:3000"),

});

export const env = envSchema.parse(process.env);