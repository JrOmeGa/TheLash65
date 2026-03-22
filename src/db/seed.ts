import { db } from './index';
import { services } from './schema';

async function seed() {
  console.log('Seeding services...');
  await db.insert(services).values([
    {
      nameTh: 'คลาสสิค',
      nameEn: 'Classic',
      descriptionTh: 'ต่อขนตาแบบเส้นต่อเส้น ดูเป็นธรรมชาติ',
      descriptionEn: 'One extension per natural lash for a natural look',
      durationMinutes: 90,
      priceTHB: 800,
      sortOrder: 1,
    },
    {
      nameTh: 'ไฮบริด',
      nameEn: 'Hybrid',
      descriptionTh: 'ผสมระหว่างคลาสสิคและวอลลุ่ม',
      descriptionEn: 'Mix of classic and volume for added texture',
      durationMinutes: 120,
      priceTHB: 1100,
      sortOrder: 2,
    },
    {
      nameTh: 'วอลลุ่ม',
      nameEn: 'Volume',
      descriptionTh: 'ขนตาเต็มหนาดูอลังการ',
      descriptionEn: 'Full, dramatic lashes with mega volume fans',
      durationMinutes: 150,
      priceTHB: 1400,
      sortOrder: 3,
    },
  ]);
  console.log('Seeded 3 services.');
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
