import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function LineIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function PhoneIcon() {
  return (
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
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.42 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full py-6"
      style={{ backgroundColor: '#f5ede6' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop: single row. Mobile: stacked */}
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]"
            style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
          >
            <span className="font-semibold text-[#1F1B18]" style={{ fontSize: '14px' }}>
              Lash Booking
            </span>
          </Link>

          {/* Copyright */}
          <p
            className="text-xs font-normal text-center"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: 'rgba(31, 27, 24, 0.50)',
            }}
          >
            &copy; {currentYear} Lash Booking. {t('copyright')}
          </p>

          {/* Contact icons */}
          <div className="flex items-center gap-4" style={{ color: 'rgba(31, 27, 24, 0.50)' }}>
            <a
              href="#"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]"
              aria-label="Line"
            >
              <LineIcon />
            </a>
            <a
              href="#"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]"
              aria-label="Phone"
            >
              <PhoneIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
