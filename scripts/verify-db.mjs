import "dotenv/config";
import pg from "pg";

import { resolveDirectUrl } from "./neon-url.mjs";

const directUrl = resolveDirectUrl();
const pooledUrl = process.env.DATABASE_URL?.trim();

async function tryConnect(label, connectionString) {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    const db = await client.query(
      "SELECT current_database() AS db, current_user AS usr",
    );
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log(`\n[${label}] Conexión OK:`, db.rows[0]);
    console.log(
      `[${label}] Tablas:`,
      tables.rows.length
        ? tables.rows.map((r) => r.table_name).join(", ")
        : "(ninguna — corré npx prisma migrate deploy)",
    );
    return true;
  } catch (err) {
    console.error(`\n[${label}] Falló:`, err.code ?? "", err.message ?? err);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

console.log("Direct host:", new URL(directUrl.replace(/^postgresql:/, "http:")).hostname);
if (pooledUrl) {
  console.log(
    "Pooled host:",
    new URL(pooledUrl.replace(/^postgresql:/, "http:")).hostname,
  );
}

const directOk = await tryConnect("DIRECT (Studio/migrate)", directUrl);
if (pooledUrl && pooledUrl !== directUrl) {
  await tryConnect("POOLED (app)", pooledUrl);
}

if (!directOk) {
  console.error(`
Si ambas fallan con ETIMEDOUT:
  • Abrí el proyecto en console.neon.tech (despierta el compute)
  • Probá sin VPN / otra red (muchas redes bloquean el puerto 5432)
  • Copiá de nuevo la URL desde Neon (sin channel_binding en .env)
`);
  process.exit(1);
}
