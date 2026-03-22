import { services } from '@/db/schema';
import { ServiceCard } from './ServiceCard';

type ServiceData = typeof services.$inferSelect;

interface ServiceListProps {
  services: ServiceData[];
  locale: string;
  emptyMessage: string;
  durationTemplate: string;
}

function formatDuration(template: string, minutes: number): string {
  return template.replace('{minutes}', String(minutes));
}

function getCategoryLabel(locale: string): string {
  return locale === 'th' ? 'ต่อขนตา' : 'Lash Extension';
}

export function ServiceList({
  services: serviceList,
  locale,
  emptyMessage,
  durationTemplate,
}: ServiceListProps) {
  if (serviceList.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div
          className="flex min-h-[120px] w-full items-center justify-center rounded-xl bg-[var(--color-surface-container-lowest)] shadow-ambient"
        >
          <p
            className="text-center text-[14px] font-normal leading-[1.5]"
            style={{
              fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
              color: 'rgba(31, 27, 24, 0.60)',
            }}
          >
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {serviceList.map((service) => (
        <ServiceCard
          key={service.id}
          name={locale === 'th' ? service.nameTh : service.nameEn}
          description={locale === 'th' ? service.descriptionTh : service.descriptionEn}
          durationMinutes={service.durationMinutes}
          priceTHB={service.priceTHB}
          durationLabel={formatDuration(durationTemplate, service.durationMinutes)}
          categoryLabel={getCategoryLabel(locale)}
        />
      ))}
    </div>
  );
}
