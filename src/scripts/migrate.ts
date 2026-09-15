import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

/**
 * Applies sql/schema.sql to the database. Idempotent — safe to run on every deploy.
 * Usage: npm run migrate
 */

dotenv.config();

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, "../../sql/schema.sql");

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined in environment variables");
    process.exit(1);
  }

  const schema = readFileSync(schemaPath, "utf8");

  try {
    await pool.query(schema);
    console.log("✅ Migration applied:", schemaPath);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
