import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Uses Supabase session-mode connection string (port 5432 per D-22).
// Transaction-mode (port 6543) must NOT be used — Drizzle uses prepared
// statements that require a persistent session.
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });
