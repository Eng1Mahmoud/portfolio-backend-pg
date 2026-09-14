# Portfolio Backend — PostgreSQL version

Same Express + TypeScript API as `../portfolio-backend`, backed by **PostgreSQL
via [node-postgres](https://node-postgres.com/)** (`pg`) instead of MongoDB +
Mongoose. The MongoDB backend stays untouched so both versions run side-by-side
(this one defaults to port **4000**, the Mongo one to **3000**).

The REST contract is unchanged — same routes, same response shapes — so the
frontend needs no changes beyond pointing at this server's URL/port.

## Setup

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL etc.
```

Create the database and tables:

```sql
-- in psql
CREATE DATABASE portfolio;
```

```bash
npm run migrate           # applies sql/schema.sql (idempotent, safe to re-run)
```

Run:

```bash
npm run dev               # nodemon + tsx, type-checks on each change
npm run build && npm start
```

## Environment variables

See `.env.example`. `DATABASE_URL` is the PostgreSQL connection string, e.g.
`postgresql://postgres:postgres@localhost:5432/portfolio`.

## How the conversion maps

| MongoDB version            | PostgreSQL version                       |
| -------------------------- | ---------------------------------------- |
| `src/models/*.ts` (Mongoose schemas) | `sql/schema.sql` (7 tables)     |
| `src/config/db.ts` (`mongoose.connect`) | `pg.Pool` + `connectDB()` check |
| Mongoose queries in services | Parameterized SQL in the same services |
| `new Model(req.body)`      | `buildInsert()` — inserts only known columns |
| `findByIdAndUpdate(id, body)` | `buildUpdate()` — dynamic partial update |
| `timestamps: true`         | `createdAt`/`updatedAt` columns (updated on write) |
| `enum` on `relation`       | `CHECK` constraint on `recommendations.relation` |
| `_id` (ObjectId hex)       | UUID `id` (`gen_random_uuid()`)          |

Notes:

* Columns are **quoted camelCase**, so pg rows already carry the exact keys the
  frontend expects (`imageUrl`, `yearsOfExperience`, …) — no snake_case mapping.
* Array fields (`skills`, `technologies`) are Postgres `text[]`.
* `/api/chat`, `/api/upload`, `/api/auth` behave identically; only the data
  layer changed.
