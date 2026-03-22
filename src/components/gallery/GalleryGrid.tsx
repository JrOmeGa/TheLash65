'use client';

import * as React from 'react';
import Image from 'next/image';
import { GalleryLightbox } from './GalleryLightbox';

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  closeLabel: string;
  emptyLabel?: string;
}

export function GalleryGrid({ images, closeLabel, emptyLabel }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  function openLightbox(image: GalleryImage) {
    setSelectedImage(image);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    setSelectedImage(null);
  }

  if (images.length === 0) {
    return (
      <div
        data-testid="gallery-grid"
        className="flex min-h-[120px] w-full items-center justify-center rounded-xl bg-[var(--color-surface-container-lowest)] shadow-ambient"
      >
        <p
          className="text-center text-[14px] font-normal leading-[1.5]"
          style={{
            fontFamily: 'var(--font-manrope), var(--font-sarabun), sans-serif',
            color: 'rgba(31, 27, 24, 0.60)',
          }}
        >
          {emptyLabel ?? 'No portfolio photos yet.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        data-testid="gallery-grid"
        className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-[12px]"
      >
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => openLightbox(image)}
            className="relative aspect-[4/5] overflow-hidden rounded-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#755944] hover:scale-[1.02] transition-transform duration-200 active:scale-[0.98] active:transition-transform active:duration-100"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              loading="lazy"
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {selectedImage && (
        <GalleryLightbox
          src={selectedImage.src}
          alt={selectedImage.alt}
          open={lightboxOpen}
          onClose={closeLightbox}
          closeLabel={closeLabel}
        />
      )}
    </>
  );
}
