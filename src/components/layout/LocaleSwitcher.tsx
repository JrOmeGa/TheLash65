'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    router.replace({ pathname }, { locale: newLocale });
  }

  return (
    <div
      className="flex items-center gap-1"
      aria-label="Language switcher"
    >
      <button
        onClick={() => switchLocale('th')}
        className={[
          'min-h-[44px] min-w-[44px] px-1 text-xs transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]',
          locale === 'th'
            ? 'font-semibold text-[#755944]'
            : 'font-normal text-[#1F1B18] opacity-50',
        ].join(' ')}
        aria-current={locale === 'th' ? 'true' : undefined}
      >
        TH
      </button>
      <span aria-hidden="true" className="text-xs text-[#1F1B18] opacity-30 select-none">
        |
      </span>
      <button
        onClick={() => switchLocale('en')}
        className={[
          'min-h-[44px] min-w-[44px] px-1 text-xs transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]',
          locale === 'en'
            ? 'font-semibold text-[#755944]'
            : 'font-normal text-[#1F1B18] opacity-50',
        ].join(' ')}
        aria-current={locale === 'en' ? 'true' : undefined}
      >
        EN
      </button>
    </div>
  );
}
