"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/products";

/**
 * next/image with a graceful fallback if the remote source 404s,
 * so a broken Unsplash URL never leaves a blank card.
 */
export function SmartImage({ src, alt, ...props }: ImageProps) {
  const [current, setCurrent] = useState(src);
  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      onError={() => setCurrent(FALLBACK_IMAGE)}
    />
  );
}
