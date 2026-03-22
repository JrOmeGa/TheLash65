'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function StickyMandateBar() {
  const t = useTranslations('stickyBar');

  return (
    <div
      className="md:hidden fixed left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-4 px-5 active:scale-[0.98] transition-transform duration-100"
      style={{
        bottom: '16px',
        height: '52px',
        borderRadius: '26px',
        backgroundColor: '#755944',
        boxShadow: '0 10px 40px rgba(31, 27, 24, 0.18)',
        minWidth: '220px',
        maxWidth: 'calc(100vw - 32px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Label */}
      <Link
        href="#"
        className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label={t('label')}
      >
        <span
          className="font-normal whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            fontSize: '14px',
            color: '#fff8f5',
          }}
        >
          {t('label')}
        </span>

        {/* Circular action button */}
        <span
          className="flex items-center justify-center shrink-0"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            color: '#755944',
          }}
          aria-hidden="true"
        >
          <ArrowIcon />
        </span>
      </Link>
    </div>
  );
}
