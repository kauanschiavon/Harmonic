import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.DATABASE_URL || "";
console.log("DATABASE_URL carregada:", url.replace(/:[^:@]+@/, ":****@"));

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => {
    console.log("✅ Conectou com sucesso!");
    return client.end();
  })
  .catch((err) => {
    console.error("❌ Falhou:", err.message);
  });