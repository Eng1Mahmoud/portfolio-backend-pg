-- extensions 
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users (auth) 
CREATE TABLE IF NOT EXISTS users (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"      TEXT NOT NULL UNIQUE,
  "password"   TEXT NOT NULL,
  "role"       TEXT NOT NULL DEFAULT 'user'
);

-- Profiles - one profile
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

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"              TEXT NOT NULL,
  "imageUrl"          TEXT NOT NULL,
  "category"          TEXT,
  "yearsOfExperience" INTEGER,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects 
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

-- Education 
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

-- Experience

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

-- Recommendations 
CREATE TABLE IF NOT EXISTS recommendations (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"        TEXT NOT NULL,
  "role"        TEXT NOT NULL,
  "company"     TEXT,
  "avatar"      TEXT,
  "text"        TEXT NOT NULL,
  "relation"    TEXT NOT NULL CHECK ("relation" IN ('Manager', 'Team Member', 'Freelance', 'College Friend')),
  "date"        TEXT NOT NULL DEFAULT '',
  "linkedinUrl" TEXT,
  "featured"    BOOLEAN NOT NULL DEFAULT FALSE,
  "order"       INTEGER NOT NULL DEFAULT 999,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);
