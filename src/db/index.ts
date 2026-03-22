import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Uses Supabase session-mode connection string (port 5432 per D-22).
// Transaction-mode (port 6543) must NOT be used — Drizzle uses prepared
// statements that require a persistent session.
//
// Lazy client: the postgres() call is deferred until the first query so that
// pages importing from @/db do not throw during Next.js static build when
// DATABASE_URL contains placeholder values or is absent.
function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const client = postgres(url);
  return drizzle(client, { schema });
}

// Singleton cache — re-use the same db instance across requests in one process.
let _db: ReturnType<typeof getDb> | undefined;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    if (!_db) _db = getDb();
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
