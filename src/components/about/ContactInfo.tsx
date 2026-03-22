interface ContactInfoProps {
  lineId?: string;
  phone?: string;
}

export function ContactInfo({
  lineId = '@lash.booking',
  phone = '099-XXX-XXXX',
}: ContactInfoProps) {
  return (
    <div data-testid="contact-info" className="space-y-1">
      {/* Line ID row */}
      <div className="flex items-center gap-3 min-h-[44px]">
        {/* call_to_action icon (chat/Line icon) — 20px, accent color */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: '#755944', flexShrink: 0 }}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span
          className="text-[12px] font-normal"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'var(--color-on-surface)',
          }}
        >
          {lineId}
        </span>
      </div>

      {/* Phone row */}
      <div className="flex items-center gap-3 min-h-[44px]">
        {/* call icon — 20px, accent color */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: '#755944', flexShrink: 0 }}
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.39a2 2 0 0 1 1.995-2.185h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span
          className="text-[12px] font-normal"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'var(--color-on-surface)',
          }}
        >
          {phone}
        </span>
      </div>
    </div>
  );
}
