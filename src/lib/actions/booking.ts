'use server';

import { db } from '@/db';
import { bookings, services, scheduleRules, scheduleExceptions } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { and, eq, gte, lte, ne } from 'drizzle-orm';
import { z } from 'zod';

const bookingSchema = z.object({
  serviceId: z.number().int().positive(),
  scheduledAt: z.string().datetime(), // ISO 8601 string — never pass Date objects across Server Action boundary
});

export async function createBooking(input: { serviceId: number; scheduledAt: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'unauthorized' as const };

  const validated = bookingSchema.safeParse(input);
  if (!validated.success) return { error: 'invalid_input' as const };

  const { serviceId, scheduledAt } = validated.data;

  // Verify service exists and is active
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.isActive, true)));
  if (!service) return { error: 'invalid_service' as const };

  const result = await db
    .insert(bookings)
    .values({
      userId: session.user.id,
      serviceId,
      scheduledAt: new Date(scheduledAt),
      status: 'pending',
    })
    .onConflictDoNothing({ target: bookings.scheduledAt })
    .returning({ id: bookings.id });

  // onConflictDoNothing returns [] if constraint fired (slot taken)
  if (result.length === 0) return { error: 'slot_unavailable' as const };

  return { bookingId: result[0].id };
}

export async function getAvailabilityData(windowStart: Date, windowEnd: Date) {
  const [rules, exceptions, booked] = await Promise.all([
    db.select().from(scheduleRules).where(eq(scheduleRules.isActive, true)),
    db.select().from(scheduleExceptions).where(
      and(
        gte(scheduleExceptions.exceptionDate, windowStart),
        lte(scheduleExceptions.exceptionDate, windowEnd),
        eq(scheduleExceptions.isClosed, true),
      ),
    ),
    db
      .select({ scheduledAt: bookings.scheduledAt })
      .from(bookings)
      .where(
        and(
          gte(bookings.scheduledAt, windowStart),
          lte(bookings.scheduledAt, windowEnd),
          ne(bookings.status, 'cancelled'),
        ),
      ),
  ]);
  return { rules, exceptions, booked };
}

export async function getBookingById(bookingId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, session.user.id)));

  if (!booking) return null;

  // Also fetch the service details
  const [service] = booking.serviceId
    ? await db.select().from(services).where(eq(services.id, booking.serviceId))
    : [null];

  return { booking, service };
}
