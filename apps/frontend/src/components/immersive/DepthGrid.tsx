'use client';

import { type ReactNode } from 'react';

/** Product grid with staggered Z-depth for aisle-like layering. */
export default function DepthGrid({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`depth-grid ${className}`}>{children}</div>;
}
