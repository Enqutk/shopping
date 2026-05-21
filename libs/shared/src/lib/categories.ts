/** Canonical storefront category slugs (stored in `products.category`). */
export const PRODUCT_CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'clothes', label: 'Clothes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'electronics', label: 'Electronics' },
] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]['value'];

/** Legacy DB values still matched when filtering by slug. */
export const CATEGORY_DB_ALIASES: Record<string, string[]> = {
  shoes: ['shoes', 'footwear'],
  clothes: ['clothes', 'clothing'],
  accessories: ['accessories'],
  furniture: ['furniture'],
  electronics: ['electronics'],
};

export function categoryFilterValues(slug: string): string[] | null {
  if (!slug) return null;
  return CATEGORY_DB_ALIASES[slug] ?? [slug];
}

export function getCategoryLabel(slug: string | null | undefined): string {
  if (!slug) return 'All';
  const found = PRODUCT_CATEGORIES.find((c) => c.value === slug);
  if (found) return found.label;
  const alias = Object.entries(CATEGORY_DB_ALIASES).find(([, values]) =>
    values.includes(slug),
  );
  if (alias) {
    return PRODUCT_CATEGORIES.find((c) => c.value === alias[0])?.label ?? slug;
  }
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
