import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { services } from '../db/schema';

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);
  await db.delete(services);
  await db.insert(services).values([
    { nameTh: 'ต่อขนตาคลาสสิก', nameEn: 'Classic Lash Extensions', descriptionTh: 'ต่อขนตาแบบ 1:1 เส้นตาสวยธรรมชาติ', descriptionEn: '1:1 natural look lash extensions', durationMinutes: 120, priceTHB: 1200, isActive: true, sortOrder: 1 },
    { nameTh: 'ต่อขนตาวอลลุ่ม', nameEn: 'Volume Lash Extensions', descriptionTh: 'ต่อขนตาแบบวอลลุ่ม เพิ่มความหนาแน่น', descriptionEn: 'Full, dense volume lash set', durationMinutes: 120, priceTHB: 1800, isActive: true, sortOrder: 2 },
    { nameTh: 'ต่อขนตาเมกะวอลลุ่ม', nameEn: 'Mega Volume Lash Extensions', descriptionTh: 'ต่อขนตาวอลลุ่มสูงสุด ดรามาติกมาก', descriptionEn: 'Maximum drama mega volume set', durationMinutes: 120, priceTHB: 2400, isActive: true, sortOrder: 3 },
  ]);
  console.log('✓ Seeded 3 services');
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
