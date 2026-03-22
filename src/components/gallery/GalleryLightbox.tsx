'use client';

import * as React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

interface GalleryLightboxProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
  closeLabel: string;
}

export function GalleryLightbox({
  src,
  alt,
  open,
  onClose,
  closeLabel,
}: GalleryLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="fixed inset-0 z-50 flex items-center justify-center p-0 max-w-none w-screen h-screen rounded-none border-none bg-black/90"
        style={{ background: 'rgba(0,0,0,0.90)' }}
      >
        {/* Custom close button — accessible, 44x44px tap target, white on dark */}
        <DialogClose
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-50 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm text-white opacity-90 transition-opacity hover:opacity-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {/* Material Symbols close icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </DialogClose>

        {/* Full-screen image container */}
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
