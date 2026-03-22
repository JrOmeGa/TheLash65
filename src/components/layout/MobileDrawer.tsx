'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

export function MobileDrawer() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: '/portfolio', label: t('portfolio') },
    { href: '/services', label: t('services') },
    { href: '/about', label: t('about') },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#1F1B18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]"
          aria-label={t('openMenu')}
        >
          <HamburgerIcon />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="bg-[rgba(255,248,245,0.80)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.2)] rounded-t-2xl pb-8"
        aria-label="Navigation menu"
      >
        <nav className="flex flex-col pt-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center min-h-[44px] px-2 text-sm font-normal text-[#1F1B18] hover:text-[#755944] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]"
              style={{ fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif' }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
