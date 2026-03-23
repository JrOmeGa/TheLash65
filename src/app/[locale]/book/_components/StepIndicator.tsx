'use client';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  labels: string[];
}

export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  const steps = [1, 2, 3, 4] as const;

  return (
    <div className="flex items-center w-full mb-6">
      {steps.map((step, index) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        const isUpcoming = step > currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Dot */}
            <div className="flex flex-col items-center">
              <div
                className="w-[10px] h-[10px] rounded-full flex-shrink-0"
                style={{
                  backgroundColor: isActive
                    ? '#755944'
                    : isCompleted
                      ? '#9c7660'
                      : 'transparent',
                  border: isUpcoming ? '1px solid rgba(117, 89, 68, 0.30)' : 'none',
                }}
                aria-label={
                  isActive
                    ? `Step ${step} of 4: ${labels[index] ?? ''}`
                    : undefined
                }
              />
              {/* Step label — hidden on mobile */}
              <span
                className="hidden md:block mt-1 text-[14px] font-semibold leading-[1.3]"
                style={{
                  fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
                  color: 'rgba(31, 27, 24, 0.60)',
                }}
              >
                {labels[index]}
              </span>
            </div>

            {/* Connecting line (not after last step) */}
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-1"
                style={{ border: 'none', borderTop: '1px solid rgba(117, 89, 68, 0.20)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
