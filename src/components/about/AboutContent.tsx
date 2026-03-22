import Image from 'next/image';
import { ContactInfo } from './ContactInfo';

interface AboutTranslations {
  title: string;
  contact: string;
  hours: string;
  bookCta: string;
}

interface AboutContentProps {
  locale: string;
  translations: AboutTranslations;
}

const bioTh =
  'ยินดีต้อนรับสู่ร้านต่อขนตาของเรา เราให้บริการต่อขนตาคุณภาพสูงด้วยวัสดุนำเข้าที่ปลอดภัย ด้วยประสบการณ์กว่า 5 ปี เราพร้อมดูแลให้คุณสวยงามและมั่นใจในทุกวัน';

const bioEn =
  'Welcome to our lash studio. We provide high-quality eyelash extensions using safe, imported materials. With over 5 years of experience, we are dedicated to making you look and feel your best every day.';

const hoursTh = 'จันทร์–เสาร์ 10:00 – 19:00';
const hoursEn = 'Mon–Sat 10:00 – 19:00';

export function AboutContent({ locale, translations }: AboutContentProps) {
  const bio = locale === 'th' ? bioTh : bioEn;
  const hoursText = locale === 'th' ? hoursTh : hoursEn;

  return (
    <div className="max-w-[640px] mx-auto">
      {/* Page heading */}
      <h1
        className="mb-8 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-on-surface)]"
        style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif' }}
      >
        {translations.title}
      </h1>

      {/* Owner photo */}
      <div className="relative mb-8 w-full md:w-80 aspect-[4/5] rounded-xl overflow-hidden">
        <Image
          src="/images/about/owner.jpg"
          alt={locale === 'th' ? 'ช่างต่อขนตา' : 'Lash technician'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
          priority
        />
      </div>

      {/* Bio */}
      <p
        className="mb-8 text-[14px] font-normal leading-[1.5]"
        style={{
          fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
          color: 'var(--color-on-surface)',
        }}
      >
        {bio}
      </p>

      {/* Contact section */}
      <div className="mb-8">
        <p
          className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em]"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'var(--color-on-surface)',
          }}
        >
          {translations.contact}
        </p>
        <ContactInfo />
      </div>

      {/* Hours section */}
      <div className="mb-10">
        <p
          className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em]"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'var(--color-on-surface)',
          }}
        >
          {translations.hours}
        </p>
        <p
          className="text-[14px] font-normal leading-[1.5]"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'var(--color-on-surface)',
          }}
        >
          {hoursText}
        </p>
      </div>

      {/* Booking CTA */}
      <div className="w-full md:w-auto">
        <a
          data-testid="book-cta"
          href="#"
          className="flex w-full md:inline-flex md:w-auto items-center justify-center min-h-[44px] rounded-[2px] px-6 py-3 text-[14px] font-semibold text-white transition-transform duration-100 active:scale-[0.98] hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944]"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            background: 'linear-gradient(135deg, #755944 0%, #9c7660 100%)',
          }}
        >
          {translations.bookCta}
        </a>
      </div>
    </div>
  );
}
