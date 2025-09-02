import { config } from "dotenv"
import { z } from "zod"
config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    FRONTEND_URL: z.string().default("http://localhost:3000"),

    PORT: z.coerce.number().default(4000),

    API_PREFIX: z.string().default("api/v1"),

    MONGODB_URI: z.string().url(),

    JWT_ACCESS_SECRET: z.string().min(20),
    JWT_REFRESH_SECRET: z.string().min(20),
    JWT_ACCESS_EXPIRES: z.coerce.number().default(900),
    JWT_REFRESH_EXPIRES: z.coerce.number().default(2592000),


    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().optional(),


    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    CLOUDINARY_FOLDER: z.string().default('uploads'),

    // Cookies (dùng cho setAuthCookies/clearAuthCookies)
    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    COOKIE_SECURE: z.coerce.boolean().default(false),


});

export const env = envSchema.parse(process.env);