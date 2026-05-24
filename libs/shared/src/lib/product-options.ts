import { CATEGORY_DB_ALIASES } from './categories.js';

export interface ProductColorOption {
  name: string;
  hex: string;
}

export interface ProductOptionsConfig {
  colors: ProductColorOption[];
  sizes: string[];
  showSize: boolean;
}

const DEFAULT_COLORS: ProductColorOption[] = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f0' },
  { name: 'Champagne', hex: '#c9a962' },
];

const OPTIONS_BY_CATEGORY: Record<string, ProductOptionsConfig> = {
  shoes: {
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'White', hex: '#f5f5f0' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Tan', hex: '#c4a574' },
    ],
    sizes: ['7', '8', '9', '10', '11', '12'],
    showSize: true,
  },
  clothes: {
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Cream', hex: '#f0ebe3' },
      { name: 'Sage', hex: '#8a9a7b' },
      { name: 'Burgundy', hex: '#6b2d3a' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    showSize: true,
  },
  accessories: {
    colors: [
      { name: 'Gold', hex: '#c9a962' },
      { name: 'Silver', hex: '#b8bcc4' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
    sizes: ['One size'],
    showSize: true,
  },
  furniture: {
    colors: [
      { name: 'Oak', hex: '#c4a574' },
      { name: 'Walnut', hex: '#5c4033' },
      { name: 'Charcoal', hex: '#3d3d3d' },
    ],
    sizes: [],
    showSize: false,
  },
  electronics: {
    colors: [
      { name: 'Midnight', hex: '#1a1a1a' },
      { name: 'Silver', hex: '#d4d4d8' },
      { name: 'Rose', hex: '#e8b4b8' },
    ],
    sizes: [],
    showSize: false,
  },
};

function normalizeCategorySlug(category?: string | null): string {
  if (!category) return 'default';
  const lower = category.toLowerCase();
  if (OPTIONS_BY_CATEGORY[lower]) return lower;
  for (const [slug, aliases] of Object.entries(CATEGORY_DB_ALIASES)) {
    if (aliases.includes(lower)) return slug;
  }
  return lower;
}

/** Category-based defaults (used when admin has not set per-product options). */
export function getCategoryProductOptions(
  category?: string | null,
  productId?: number,
): ProductOptionsConfig & { defaultColor: string; defaultSize?: string } {
  const slug = normalizeCategorySlug(category);
  const config = OPTIONS_BY_CATEGORY[slug] ?? {
    colors: DEFAULT_COLORS,
    sizes: ['S', 'M', 'L', 'XL'],
    showSize: true,
  };
  const colorIdx = productId != null ? productId % config.colors.length : 0;
  const sizeIdx =
    productId != null && config.sizes.length ? productId % config.sizes.length : 0;

  return {
    ...config,
    defaultColor: config.colors[colorIdx]?.name ?? config.colors[0].name,
    defaultSize: config.sizes.length ? config.sizes[sizeIdx] : undefined,
  };
}

/** Resolved options for storefront (admin-defined or category fallback). */
export function getProductOptions(
  category?: string | null,
  productId?: number,
  stored?: {
    availableColors?: ProductColorOption[] | null;
    availableSizes?: string[] | null;
  },
): ProductOptionsConfig & { defaultColor: string; defaultSize?: string } {
  const defaults = getCategoryProductOptions(category, productId);
  const colors =
    stored?.availableColors != null && stored.availableColors.length > 0
      ? stored.availableColors
      : defaults.colors;
  const sizes =
    stored?.availableSizes != null ? stored.availableSizes : defaults.sizes;
  const showSize = sizes.length > 0;

  const colorIdx = productId != null ? productId % colors.length : 0;
  const sizeIdx = productId != null && sizes.length ? productId % sizes.length : 0;

  return {
    colors,
    sizes,
    showSize,
    defaultColor: colors[colorIdx]?.name ?? colors[0]?.name ?? '',
    defaultSize: sizes.length ? sizes[sizeIdx] : undefined,
  };
}

export function findColorOption(
  colors: ProductColorOption[],
  name: string,
): ProductColorOption | undefined {
  return colors.find((c) => c.name === name);
}
