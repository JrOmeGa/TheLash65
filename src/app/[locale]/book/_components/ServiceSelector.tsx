'use client';

import { useTranslations } from 'next-intl';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { ServiceCard } from '@/components/services/ServiceCard';

type ServiceSelectorProps = {
  services: Array<{
    id: number;
    nameTh: string;
    nameEn: string;
    descriptionTh: string | null;
    descriptionEn: string | null;
    durationMinutes: number;
    priceTHB: number;
  }>;
  locale: string;
};

export function ServiceSelector({ services, locale }: ServiceSelectorProps) {
  const t = useTranslations('booking');
  const tServices = useTranslations('services');
  const selectedServiceId = useBookingStore((s) => s.selectedServiceId);

  function handleServiceSelect(serviceId: number) {
    useBookingStore.getState().setService(serviceId);
  }

  return (
    <div>
      <h2
        className="text-[20px] font-semibold leading-[1.2] mb-4"
        style={{ fontFamily: 'var(--font-noto-serif), var(--font-sarabun), serif', color: '#1F1B18' }}
      >
        {t('stepService')}
      </h2>

      <div className="flex flex-col gap-6">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;
          const name = locale === 'th' ? service.nameTh : service.nameEn;
          const description = locale === 'th' ? service.descriptionTh : service.descriptionEn;
          const durationLabel = tServices('duration', { minutes: service.durationMinutes });

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceSelect(service.id)}
              className="w-full text-left active:scale-[0.98] transition-transform duration-100"
              style={{
                outline: isSelected ? '2px solid #755944' : 'none',
                borderRadius: '12px',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <ServiceCard
                name={name}
                description={description}
                durationMinutes={service.durationMinutes}
                priceTHB={service.priceTHB}
                durationLabel={durationLabel}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
