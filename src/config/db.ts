import dotenv from "dotenv";
import { Pool, QueryResult, QueryResultRow } from "pg";

// Loaded here because this module is imported before app.ts runs its own dotenv.config().
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export const query = async <T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> => pool.query<T>(text, params);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    // The pool connects lazily — force a round trip so a bad URL fails at startup.
    await query("SELECT 1");
    isConnected = true;
    console.log("✅ PostgreSQL connected");
  } catch (error) {
    isConnected = false;
    console.error("❌ PostgreSQL connection error:", error);
    throw error;
  }
};

export default connectDB;

