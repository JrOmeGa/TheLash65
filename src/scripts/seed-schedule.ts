/**
 * Seed script: insert default schedule rules (Mon–Sat, 10:00–18:00, 120-min slots)
 * Run: npx tsx src/scripts/seed-schedule.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { scheduleRules } from '../db/schema';

const defaults = [
  { dayOfWeek: 1, openTime: '10:00', closeTime: '18:00', slotDurationMinutes: 120, isActive: true },  // Mon
  { dayOfWeek: 2, openTime: '10:00', closeTime: '18:00', slotDurationMinutes: 120, isActive: true },  // Tue
  { dayOfWeek: 3, openTime: '10:00', closeTime: '18:00', slotDurationMinutes: 120, isActive: true },  // Wed
  { dayOfWeek: 4, openTime: '10:00', closeTime: '18:00', slotDurationMinutes: 120, isActive: true },  // Thu
  { dayOfWeek: 5, openTime: '10:00', closeTime: '18:00', slotDurationMinutes: 120, isActive: true },  // Fri
  { dayOfWeek: 6, openTime: '10:00', closeTime: '16:00', slotDurationMinutes: 120, isActive: true },  // Sat
  { dayOfWeek: 0, openTime: '10:00', closeTime: '14:00', slotDurationMinutes: 120, isActive: false }, // Sun (off)
];

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);
  await db.delete(scheduleRules);
  await db.insert(scheduleRules).values(defaults);
  console.log('✓ Seeded', defaults.length, 'schedule rules');
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
