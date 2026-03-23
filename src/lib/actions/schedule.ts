'use server';

import { db } from '@/db';
import { scheduleRules, scheduleExceptions } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const scheduleRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMinutes: z.number().int().positive().default(120),
  isActive: z.boolean(),
});

const bulkScheduleSchema = z.array(scheduleRuleSchema);

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function upsertScheduleRules(input: z.infer<typeof bulkScheduleSchema>) {
  await requireAdmin();
  const validated = bulkScheduleSchema.parse(input);

  // Delete all existing rules and insert fresh — simpler than 7 individual upserts
  await db.delete(scheduleRules);
  if (validated.length > 0) {
    await db.insert(scheduleRules).values(
      validated.map((rule) => ({
        dayOfWeek: rule.dayOfWeek,
        openTime: rule.openTime,
        closeTime: rule.closeTime,
        slotDurationMinutes: rule.slotDurationMinutes,
        isActive: rule.isActive,
      })),
    );
  }

  return { success: true };
}

export async function blockDate(dateStr: string) {
  await requireAdmin();
  // dateStr is "YYYY-MM-DD" — store as noon UTC to avoid timezone boundary issues (Pitfall 2)
  const exceptionDate = new Date(`${dateStr}T12:00:00Z`);

  await db.insert(scheduleExceptions).values({
    exceptionDate,
    isClosed: true,
  });

  return { success: true };
}

export async function unblockDate(exceptionId: number) {
  await requireAdmin();
  await db.delete(scheduleExceptions).where(eq(scheduleExceptions.id, exceptionId));
  return { success: true };
}

export async function getScheduleData() {
  const [rules, exceptions] = await Promise.all([
    db.select().from(scheduleRules),
    db.select().from(scheduleExceptions).where(eq(scheduleExceptions.isClosed, true)),
  ]);
  return { rules, exceptions };
}
