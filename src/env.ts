import { config } from "dotenv"
import { z } from "zod"
config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    PORT: z.coerce.number().default(3000),

    PG_HOST: z.string(),
    PG_PORT: z.coerce.number().default(5432),
    PG_USER: z.string(),
    PG_PASSWORD: z.string(),
    PG_DB: z.string(),

    JWT_ACCESS_SECRET: z.string().min(20),
    JWT_REFRESH_SECRET: z.string().min(20),
    JWT_ACCESS_EXPIRES: z.coerce.number().default(900),
    JWT_REFRESH_EXPIRES: z.coerce.number().default(2592000),

    UPLOAD_DIR: z.string().default("uploads"),
});

export const env = envSchema.parse(process.env);