import "reflect-metadata"
import { DataSource } from "typeorm"
import { env } from "./env"


export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.PG_HOST,
    port: env.PG_PORT,
    username: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DB,
    entities: [],
    synchronize: env.NODE_ENV === "development",
    logging: env.NODE_ENV === "development",
})