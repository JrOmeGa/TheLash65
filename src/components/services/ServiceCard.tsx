interface ServiceCardProps {
  name: string;
  description: string | null;
  durationMinutes: number;
  priceTHB: number;
  durationLabel: string;
  categoryLabel?: string;
}

export function ServiceCard({
  name,
  description,
  durationMinutes: _durationMinutes,
  priceTHB,
  durationLabel,
  categoryLabel = 'Lash Extension',
}: ServiceCardProps) {
  return (
    <div
      data-testid="service-card"
      className="rounded-xl bg-[var(--color-surface-container-lowest)] p-6 shadow-ambient transition-shadow duration-200 hover:shadow-elevated active:scale-[0.98] transition-transform duration-100"
      style={{
        // No border per No-Line Rule — card containment via shadow only
        background: '#ffffff',
      }}
    >
      {/* Micro label: category eyebrow */}
      <p
        data-testid="service-category"
        className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em]"
        style={{
          fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
          color: 'rgba(117, 89, 68, 0.60)',
        }}
      >
        {categoryLabel}
      </p>

      {/* Service name */}
      <h3
        data-testid="service-name"
        className="mb-2 text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--color-on-surface)]"
        style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
      >
        {name}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="text-[14px] font-normal leading-[1.5]"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'rgba(31, 27, 24, 0.75)',
          }}
        >
          {description}
        </p>
      )}

      {/* Spacer */}
      <div className="mt-4" />

      {/* Duration + Price row */}
      <div className="flex items-center justify-between">
        {/* Duration */}
        <div
          data-testid="service-duration"
          className="flex items-center gap-1.5"
        >
          {/* Schedule / clock icon (16px) */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ color: 'rgba(31, 27, 24, 0.60)', flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span
            className="text-[12px] font-normal"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: 'rgba(31, 27, 24, 0.60)',
            }}
          >
            {durationLabel}
          </span>
        </div>

        {/* Price */}
        <span
          data-testid="service-price"
          className="text-[14px] font-semibold"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: '#755944',
          }}
        >
          ฿{priceTHB}
        </span>
      </div>
    </div>
  );
}
