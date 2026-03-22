'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileDrawer } from './MobileDrawer';

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={[
        'relative flex items-center min-h-[44px] px-1 text-xs font-normal transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]',
        'group',
      ].join(' ')}
      style={{
        fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
        color: isActive ? '#755944' : '#1F1B18',
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
      {/* Hover underline sliding from left */}
      <span
        className={[
          'absolute bottom-2 left-0 h-[1px] bg-[#755944] transition-[width] duration-200 ease-in-out',
          isActive ? 'w-full' : 'w-0 group-hover:w-full',
        ].join(' ')}
        aria-hidden="true"
      />
    </Link>
  );
}

export function Header() {
  const t = useTranslations('nav');

  const navLinks = [
    { href: '/portfolio', label: t('portfolio') },
    { href: '/services', label: t('services') },
    { href: '/about', label: t('about') },
  ] as const;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14"
      style={{
        background: 'rgba(255, 248, 245, 0.80)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]"
          style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
        >
          <span className="text-xl font-semibold text-[#1F1B18]" style={{ fontSize: '20px' }}>
            Lash Booking
          </span>
        </Link>

        {/* Desktop center nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} />
          ))}
        </nav>

        {/* Right side: LocaleSwitcher + Book CTA (desktop) + MobileDrawer (mobile) */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher />

          {/* Desktop Book CTA */}
          <Link
            href="#"
            className={[
              'hidden md:inline-flex items-center justify-center min-h-[44px] px-6 py-3',
              'text-sm font-semibold text-white',
              'active:scale-[0.98] transition-transform duration-100',
              'hover:brightness-[1.08]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]',
            ].join(' ')}
            style={{
              background: 'linear-gradient(135deg, #755944 0%, #9c7660 100%)',
              borderRadius: '2px',
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            }}
          >
            {t('book')}
          </Link>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <MobileDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
