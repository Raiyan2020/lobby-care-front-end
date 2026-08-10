import type { StaticImageData } from 'next/image';

/**
 * Normalizes a product/category image value (which may be a URL string
 * or a Next.js StaticImageData object from a local import) to a plain string URL.
 */
export function getImageSrc(image: string | StaticImageData | undefined | null): string {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.src;
}
