/**
 * Reproduces mongoose's write semantics in SQL:
 * - buildInsert  → `new Model(req.body)` / `Model.create(req.body)`
 * - buildUpdate  → `findByIdAndUpdate(id, req.body, { new: true })`
 *
 * Unknown body keys are ignored (as a mongoose schema would) and updates
 * are partial — omitted fields keep their current value.
 */

export type Row = Record<string, unknown>;

export const isValidUuid = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function buildInsert(table: string, data: Row, allowedColumns: string[]) {
  const cols = allowedColumns.filter((c) => data[c] !== undefined);
  if (cols.length === 0) {
    throw new Error("No valid fields provided");
  }
  const placeholders = cols.map((_, i) => `$${i + 1}`);
  const values = cols.map((c) => data[c]);
  return {
    text: `INSERT INTO ${table} (${cols.map((c) => `"${c}"`).join(", ")})
           VALUES (${placeholders.join(", ")})
           RETURNING *`,
    values,
  };
}

export function buildUpdate(
  table: string,
  id: string,
  data: Row,
  allowedColumns: string[],
  options: { touchUpdatedAt?: boolean } = {}
) {
  const cols = allowedColumns.filter((c) => data[c] !== undefined);
  if (cols.length === 0 && !options.touchUpdatedAt) {
    throw new Error("No valid fields provided");
  }

  const setClauses = cols.map((c, i) => `"${c}" = $${i + 1}`);
  const values: unknown[] = cols.map((c) => data[c]);

  if (options.touchUpdatedAt) {
    setClauses.push(`"updatedAt" = now()`);
  }

  values.push(id);

  return {
    text: `UPDATE ${table}
           SET ${setClauses.join(", ")}
           WHERE "id" = $${values.length}
           RETURNING *`,
    values,
  };
}

