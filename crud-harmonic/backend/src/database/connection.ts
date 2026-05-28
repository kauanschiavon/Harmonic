import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

export const db = knex({
    client: "pg",
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
});