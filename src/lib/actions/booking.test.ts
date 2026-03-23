import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

// Mock auth — always returns a valid session
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: 'test-user-id', email: 'test@example.com' },
        }),
      ),
    },
  },
}));

// The key mock: controls what .returning() resolves to for each test
const mockReturning = vi.fn();

// Build a fresh mock db chain — used in vi.mock factory and re-setup in beforeEach
function makeMockDb() {
  return {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoNothing: vi.fn(() => ({
          returning: mockReturning,
        })),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        // Return a mock active service so the service validation passes
        where: vi.fn().mockResolvedValue([{ id: 1, isActive: true }]),
      })),
    })),
  };
}

// Mock db module — vi.mock hoisted to top by vitest
vi.mock('@/db', () => ({
  db: makeMockDb(),
}));

// Mock schema — table references only
vi.mock('@/db/schema', () => ({
  bookings: { scheduledAt: 'scheduledAt' },
  services: { id: 'id', isActive: 'isActive' },
  scheduleRules: {},
  scheduleExceptions: {},
}));

describe('createBooking - BOOK-06 atomic reservation', () => {
  beforeEach(() => {
    // Only reset the returning mock — the outer db chain mock stays intact
    vi.clearAllMocks();
  });

  it('returns slot_unavailable when DB conflict fires (onConflictDoNothing returns [])', async () => {
    // Simulate: the unique constraint on scheduledAt fires, onConflictDoNothing returns empty array
    mockReturning.mockResolvedValueOnce([]);

    const { createBooking } = await import('@/lib/actions/booking');
    const result = await createBooking({
      serviceId: 1,
      scheduledAt: '2026-04-01T10:00:00.000Z',
    });

    expect(result).toEqual({ error: 'slot_unavailable' });
  });

  it('returns bookingId on successful insert (no conflict)', async () => {
    mockReturning.mockResolvedValueOnce([{ id: 'new-booking-uuid' }]);

    const { createBooking } = await import('@/lib/actions/booking');
    const result = await createBooking({
      serviceId: 1,
      scheduledAt: '2026-04-01T10:00:00.000Z',
    });

    expect(result).toEqual({ bookingId: 'new-booking-uuid' });
  });
});
