import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { bookings, services, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const rows = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      scheduledAt: bookings.scheduledAt,
      createdAt: bookings.createdAt,
      userId: bookings.userId,
      serviceId: bookings.serviceId,
      serviceName: services.nameEn,
      priceTHB: services.priceTHB,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .orderBy(desc(bookings.createdAt))
    .limit(5);

  console.log('\n=== Latest Bookings ===');
  for (const r of rows) {
    console.log(`
  ID:        ${r.id}
  Status:    ${r.status}
  Service:   ${r.serviceName} (฿${r.priceTHB})
  Scheduled: ${r.scheduledAt}
  Created:   ${r.createdAt}
  User:      ${r.userId}`);
  }
  console.log(`\nTotal found: ${rows.length}`);
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
