import { PRODUCT_CATEGORIES } from '@shopping/shared';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Label for empty value (e.g. "All Categories" on filters). */
  emptyLabel?: string;
}

export default function CategorySelect({
  value,
  onChange,
  className,
  emptyLabel = 'Select a category',
}: CategorySelectProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">{emptyLabel}</option>
      {PRODUCT_CATEGORIES.filter((c) => c.value).map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
