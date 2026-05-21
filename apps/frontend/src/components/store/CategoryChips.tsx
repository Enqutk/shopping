'use client';

import { PRODUCT_CATEGORIES } from '@shopping/shared';

interface CategoryChipsProps {
  value: string;
  onChange: (category: string) => void;
  className?: string;
}

export default function CategoryChips({ value, onChange, className = '' }: CategoryChipsProps) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}
      role="tablist"
      aria-label="Product categories"
    >
      {PRODUCT_CATEGORIES.map((cat) => {
        const active = value === cat.value;
        return (
          <button
            key={cat.value || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(cat.value)}
            className={active ? 'btn-filter-active shrink-0' : 'btn-filter shrink-0'}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
