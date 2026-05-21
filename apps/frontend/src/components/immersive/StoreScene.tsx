'use client';

import { type ReactNode } from 'react';
import Background3DAnimation from './Background3DAnimation';

interface StoreSceneProps {
  children: ReactNode;
  className?: string;
  /** Full animated canvas on home only */
  animatedBg?: boolean;
}

/** Wraps storefront pages with perspective, floor grid, and ambient depth. */
export default function StoreScene({
  children,
  className = '',
  animatedBg = false,
}: StoreSceneProps) {
  return (
    <div className={`store-scene ${className}`}>
      {animatedBg && (
        <Background3DAnimation variant="subtle" className="fixed inset-0 z-0 opacity-90" />
      )}
      <div className="store-scene__vignette" aria-hidden />
      <div className="store-scene__grid" aria-hidden />
      <div className="store-scene__floor" aria-hidden />
      <div className="store-scene__glow store-scene__glow--left" aria-hidden />
      <div className="store-scene__glow store-scene__glow--right" aria-hidden />
      <div className="store-scene__content">{children}</div>
    </div>
  );
}
