import { MongoClient, Document } from "mongodb";
import { randomUUID } from "crypto";
import { Pool } from "pg";
import dotenv from "dotenv";

/**
 * One-time data migration: MongoDB → PostgreSQL. Re-runnable — truncates the
 * PostgreSQL tables first, so a re-run replaces (not duplicates) the data.
 * ObjectIds become fresh UUIDs (nothing references them across tables).
 * Usage: npm run migrate:data   (needs MONGODB_URI in .env)
 */

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
const PG_URI = process.env.DATABASE_URL;

if (!MONGO_URI || !PG_URI) {
  console.error("❌ MONGODB_URI and DATABASE_URL must be set in .env");
  process.exit(1);
}

interface TableSpec {
  table: string;
  collection: string;
  columns: string[];
  // Postgres columns that must never be NULL even if Mongo omits them.
  nullAsEmpty: string[];
}

const SPECS: TableSpec[] = [
  {
    table: "users",
    collection: "users",
    columns: ["email", "password", "role"],
    nullAsEmpty: [],
  },
  {
    table: "profiles",
    collection: "profiles",
    columns: [
      "userName", "title", "email", "address", "phone1", "phone2",
      "bio", "avatar", "aboutImage", "cv", "github", "linkedin", "cvContent",
    ],
    nullAsEmpty: ["phone2"],
  },
  {
    table: "skills",
    collection: "skills",
    columns: ["name", "imageUrl", "category", "yearsOfExperience", "createdAt", "updatedAt"],
    nullAsEmpty: [],
  },
  {
    table: "projects",
    collection: "projects",
    columns: [
      "title", "description", "imageUrl", "demoLink", "githubLink",
      "technologies", "order", "createdAt",
    ],
    nullAsEmpty: ["demoLink", "githubLink"],
  },
  {
    table: "education",
    collection: "educations",
    columns: [
      "degree", "institution", "startDate", "endDate",
      "description", "skills", "image", "createdAt",
    ],
    nullAsEmpty: [],
  },
  {
    table: "experience",
    collection: "experiences",
    columns: [
      "role", "company", "startDate", "endDate", "workType",
      "skills", "image", "description", "createdAt",
    ],
    nullAsEmpty: [],
  },
  {
    table: "recommendations",
    collection: "recommendations",
    columns: [
      "name", "role", "company", "avatar", "text", "relation", "date",
      "linkedinUrl", "featured", "order", "createdAt", "updatedAt",
    ],
    nullAsEmpty: ["date"],
  },
];

const run = async (): Promise<void> => {
  const mongo = new MongoClient(MONGO_URI!, { serverSelectionTimeoutMS: 20000 });
  const pg = new Pool({ connectionString: PG_URI });
  const counts: Record<string, number> = {};

  try {
    await mongo.connect();
    console.log("✅ Connected to MongoDB");
    await pg.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL");

    const db = mongo.db();

    // Start from a clean slate so re-runs replace rather than duplicate.
    // users included — their password hashes are carried over verbatim.
    const allTables = SPECS.map((s) => `"${s.table}"`).join(", ");
    await pg.query(`TRUNCATE TABLE ${allTables} CASCADE`);
    console.log("🧹 Truncated all PostgreSQL tables\n");

    for (const spec of SPECS) {
      const docs: Document[] = await db
        .collection(spec.collection)
        .find({})
        .toArray();

      let inserted = 0;
      for (const doc of docs) {
        const values = spec.columns.map((col) => {
          const v = doc[col];
          if (v === undefined || v === null) {
            // Optional field missing in Mongo — use the table's intended null
            // representation (empty string where the API served one, else NULL).
            return spec.nullAsEmpty.includes(col) ? "" : null;
          }
          if (v instanceof Date) return v; // pg driver serialises Dates
          return v;
        });

        // Placeholders start at $2 — $1 is the generated UUID id.
        const placeholders = spec.columns.map((_, i) => `$${i + 2}`).join(", ");
        const colList = spec.columns.map((c) => `"${c}"`).join(", ");
        await pg.query(
          `INSERT INTO "${spec.table}" ("id", ${colList}) VALUES ($1, ${placeholders})`,
          [randomUUID(), ...values]
        );
        inserted++;
      }
      counts[spec.table] = inserted;
      console.log(`📦 ${spec.collection} → ${spec.table}: ${inserted} row(s)`);
    }

    console.log("\n🎉 Data migration complete:");
    for (const [table, n] of Object.entries(counts)) {
      console.log(`   ${table}: ${n}`);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongo.close();
    await pg.end();
  }
};

run();
