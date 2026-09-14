-- ─────────────────────────────────────────────────────────────────────────────
-- Portfolio schema (PostgreSQL) — replaces the Mongoose models 1:1.
--
-- Conventions:
--   * Columns use quoted camelCase so pg rows come back with exactly the keys
--     the frontend already expects (imageUrl, yearsOfExperience, ...).
--   * ids are UUIDs (gen_random_uuid needs PostgreSQL 13+, or the pgcrypto
--     extension which this script enables as a fallback).
--   * created_at / updated_at mirror Mongoose `{ timestamps: true }`.
--   * Array fields (skills, technologies) are text[].
--
-- Safe to re-run: everything is IF NOT EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Users (auth) ────────────────────────────────────────────────────────────
-- Was models/User.ts. Registration is admin-only; login is rate-limited.
CREATE TABLE IF NOT EXISTS users (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"      TEXT NOT NULL UNIQUE,
  "password"   TEXT NOT NULL,
  "role"       TEXT NOT NULL DEFAULT 'user'
);

-- ── Profile (single row) ────────────────────────────────────────────────────
-- Was models/Profile.ts. The API upserts the one and only profile row.
CREATE TABLE IF NOT EXISTS profiles (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userName"   TEXT NOT NULL,
  "title"      TEXT NOT NULL,
  "email"      TEXT NOT NULL,
  "address"    TEXT NOT NULL,
  "phone1"     TEXT NOT NULL,
  "phone2"     TEXT,
  "bio"        TEXT NOT NULL,
  "avatar"     TEXT NOT NULL,
  "aboutImage" TEXT NOT NULL,
  "cv"         TEXT NOT NULL,
  "github"     TEXT NOT NULL,
  "linkedin"   TEXT NOT NULL,
  -- Extracted CV text, used as chat context by the AI endpoint.
  "cvContent"  TEXT
);

-- ── Skills ──────────────────────────────────────────────────────────────────
-- Was models/Skill.ts (collection "Skills", timestamps: true).
CREATE TABLE IF NOT EXISTS skills (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"              TEXT NOT NULL,
  "imageUrl"          TEXT NOT NULL,
  -- Free-form group for the skills page; NULL behaves like "Other" in the UI.
  "category"          TEXT,
  "yearsOfExperience" INTEGER,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Projects ────────────────────────────────────────────────────────────────
-- Was models/Project.ts (collection "Projects").
CREATE TABLE IF NOT EXISTS projects (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"        TEXT NOT NULL,
  "description"  TEXT NOT NULL,
  "imageUrl"     TEXT NOT NULL,
  "demoLink"     TEXT,
  "githubLink"   TEXT,
  "technologies" TEXT[] NOT NULL DEFAULT '{}',
  "order"        INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Education ───────────────────────────────────────────────────────────────
-- Was models/Education.ts.
CREATE TABLE IF NOT EXISTS education (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "degree"      TEXT NOT NULL,
  "institution" TEXT NOT NULL,
  "startDate"   TEXT NOT NULL,
  "endDate"     TEXT NOT NULL,
  "description" TEXT,
  "skills"      TEXT[] NOT NULL DEFAULT '{}',
  "image"       TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Experience ──────────────────────────────────────────────────────────────
-- Was models/Experience.ts.
CREATE TABLE IF NOT EXISTS experience (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "role"        TEXT NOT NULL,
  "company"     TEXT NOT NULL,
  "startDate"   TEXT NOT NULL,
  "endDate"     TEXT NOT NULL,
  "workType"    TEXT,
  "skills"      TEXT[] NOT NULL DEFAULT '{}',
  "image"       TEXT,
  "description" TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Recommendations ─────────────────────────────────────────────────────────
-- Was models/Recommendation.ts (timestamps: true).
-- `relation` mirrors the mongoose enum with a CHECK constraint, so a bad value
-- is rejected by the database on create AND update (the mongoose update path
-- needed runValidators for the same reason).
CREATE TABLE IF NOT EXISTS recommendations (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"        TEXT NOT NULL,
  "role"        TEXT NOT NULL,
  "company"     TEXT,
  "avatar"      TEXT,
  "text"        TEXT NOT NULL,
  "relation"    TEXT NOT NULL CHECK ("relation" IN ('Manager', 'Team Member', 'Freelance', 'College Friend')),
  -- "YYYY-MM-DD" from the dashboard date picker, empty string when omitted —
  -- ISO dates already sort correctly as text.
  "date"        TEXT NOT NULL DEFAULT '',
  "linkedinUrl" TEXT,
  -- Pins the entry to the top of its group and onto the home page.
  "featured"    BOOLEAN NOT NULL DEFAULT FALSE,
  -- Manual position, lowest first. Defaults high (like DEFAULT_RECOMMENDATION_ORDER = 999)
  -- so unordered entries sit behind explicitly ordered ones.
  "order"       INTEGER NOT NULL DEFAULT 999,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);
