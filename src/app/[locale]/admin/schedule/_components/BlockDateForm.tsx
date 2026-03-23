'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blockDate, unblockDate } from '@/lib/actions/schedule';
import { formatDateGregorian } from '@/lib/date-utils';

type ExceptionItem = {
  id: number;
  exceptionDate: string; // ISO string (serialized from Date on server)
  isClosed: boolean;
  reason: string | null;
};

type BlockDateFormProps = {
  exceptions: ExceptionItem[];
};

export function BlockDateForm({ exceptions: initialExceptions }: BlockDateFormProps) {
  const t = useTranslations('admin');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState('');
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(initialExceptions);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [blockingInProgress, setBlockingInProgress] = useState(false);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Today's date in YYYY-MM-DD format for min attribute
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBlockDate = async () => {
    if (!selectedDate) return;
    setBlockingInProgress(true);
    try {
      await blockDate(selectedDate);
      showToast(t('blockDateSuccess'));
      setSelectedDate('');
      // Refresh server data and add optimistically
      router.refresh();
      // Optimistic update: add a placeholder exception with the new date
      const newException: ExceptionItem = {
        id: Date.now(), // temporary id until refresh
        exceptionDate: `${selectedDate}T12:00:00.000Z`,
        isClosed: true,
        reason: null,
      };
      setExceptions((prev) => [...prev, newException]);
    } catch {
      // no toast on block error — router.refresh() will restore state
    } finally {
      setBlockingInProgress(false);
    }
  };

  const handleUnblock = async (exceptionId: number) => {
    setUnblockingId(exceptionId);
    try {
      await unblockDate(exceptionId);
      setExceptions((prev) => prev.filter((e) => e.id !== exceptionId));
      setConfirmingId(null);
    } catch {
      // If unblock fails, just close the confirm state
      setConfirmingId(null);
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div>
      {/* Block date form */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          type="date"
          value={selectedDate}
          min={todayStr}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-[14px] rounded px-2 py-1 border border-[rgba(31,27,24,0.15)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] focus:outline-2 focus:outline-[#755944]"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
          }}
          aria-label="Select date to block"
        />
        <Button
          type="button"
          onClick={handleBlockDate}
          disabled={!selectedDate || blockingInProgress}
          className="h-11"
        >
          {t('blockDate')}
        </Button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="mt-3 rounded-lg px-4 py-2 text-[14px]"
          style={{
            background: 'rgba(117, 89, 68, 0.10)',
            color: '#755944',
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
          }}
        >
          {toast}
        </div>
      )}

      {/* Blocked dates chip list */}
      {exceptions.length > 0 && (
        <div role="list" className="flex flex-wrap gap-2 mt-4">
          {exceptions.map((exception) => {
            const formattedDate = formatDateGregorian(new Date(exception.exceptionDate), locale, {
              month: 'short',
              day: 'numeric',
            });
            const isConfirming = confirmingId === exception.id;

            return (
              <div key={exception.id} role="listitem">
                {!isConfirming ? (
                  /* Chip */
                  <div
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[14px] font-medium"
                    style={{
                      background: 'rgba(185, 28, 28, 0.08)',
                      color: '#b91c1c',
                      fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                    }}
                  >
                    <span>{formattedDate}</span>
                    <button
                      type="button"
                      aria-label={`Remove blocked date ${formattedDate}`}
                      onClick={() => setConfirmingId(exception.id)}
                      className="ml-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#b91c1c] rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  /* Inline unblock confirmation — expands in place, no modal */
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[14px]"
                    style={{
                      background: 'rgba(185, 28, 28, 0.08)',
                      fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                    }}
                  >
                    <span style={{ color: '#b91c1c' }}>
                      {t('unblockConfirm', { date: formattedDate })}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8"
                      disabled={unblockingId === exception.id}
                      onClick={() => handleUnblock(exception.id)}
                    >
                      {t('yesUnblock')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => setConfirmingId(null)}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
