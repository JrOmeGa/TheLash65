import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// ────────────────────────────────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────────────────────────────────

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
]);

// ────────────────────────────────────────────────────────────────────────────────
// Users — Better Auth compatible schema
// ────────────────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ────────────────────────────────────────────────────────────────────────────────
// Services — The lash extension service menu
// ────────────────────────────────────────────────────────────────────────────────

export const services = pgTable('services', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  nameTh: text('name_th').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionTh: text('description_th'),
  descriptionEn: text('description_en'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceTHB: integer('price_thb').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ────────────────────────────────────────────────────────────────────────────────
// Bookings — Client appointment records
// ────────────────────────────────────────────────────────────────────────────────

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => users.id),
    serviceId: integer('service_id').references(() => services.id),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    status: bookingStatusEnum('status').default('pending').notNull(),
    paymentConfirmedAt: timestamp('payment_confirmed_at', {
      withTimezone: true,
    }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('bookings_user_id_idx').on(table.userId),
    index('bookings_scheduled_at_idx').on(table.scheduledAt),
  ],
);

// ────────────────────────────────────────────────────────────────────────────────
// Schedule Rules — Weekly recurring availability (per D-22)
// ────────────────────────────────────────────────────────────────────────────────

export const scheduleRules = pgTable('schedule_rules', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  openTime: text('open_time').notNull(), // "HH:MM" format
  closeTime: text('close_time').notNull(), // "HH:MM" format
  slotDurationMinutes: integer('slot_duration_minutes').default(120).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ────────────────────────────────────────────────────────────────────────────────
// Schedule Exceptions — Date-specific closures or overrides
// ────────────────────────────────────────────────────────────────────────────────

export const scheduleExceptions = pgTable('schedule_exceptions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  exceptionDate: timestamp('exception_date', { withTimezone: true }).notNull(),
  isClosed: boolean('is_closed').default(true).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
