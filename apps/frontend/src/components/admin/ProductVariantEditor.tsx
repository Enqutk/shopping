'use client';

import { useState } from 'react';
import type { ProductColorOption } from '@shopping/shared';
import { getCategoryProductOptions } from '@shopping/shared';

type Props = {
  category: string;
  colors: ProductColorOption[];
  sizes: string[];
  onColorsChange: (colors: ProductColorOption[]) => void;
  onSizesChange: (sizes: string[]) => void;
};

export default function ProductVariantEditor({
  category,
  colors,
  sizes,
  onColorsChange,
  onSizesChange,
}: Props) {
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#c9a962');
  const [newSize, setNewSize] = useState('');

  function loadCategoryDefaults() {
    const defaults = getCategoryProductOptions(category || undefined);
    onColorsChange(defaults.colors.map((c) => ({ ...c })));
    onSizesChange([...defaults.sizes]);
  }

  function addColor() {
    const name = newColorName.trim();
    if (!name) return;
    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    onColorsChange([...colors, { name, hex: newColorHex }]);
    setNewColorName('');
  }

  function addSize() {
    const value = newSize.trim();
    if (!value) return;
    if (sizes.some((s) => s.toLowerCase() === value.toLowerCase())) return;
    onSizesChange([...sizes, value]);
    setNewSize('');
  }

  return (
    <div className="space-y-6 border border-white/10 rounded-xl p-5 bg-femme-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-arctic-deep">Colors &amp; sizes</h3>
          <p className="text-xs text-arctic-light mt-1 normal-case tracking-normal">
            Shoppers choose from these on the product page. Leave empty to use category defaults.
          </p>
        </div>
        <button
          type="button"
          onClick={loadCategoryDefaults}
          className="text-[10px] font-bold uppercase tracking-[0.12em] text-femme-champagne hover:text-femme-champagne-light"
        >
          Load category defaults
        </button>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-arctic-light mb-3">
          Available colors
        </p>
        {colors.length > 0 && (
          <ul className="space-y-2 mb-3">
            {colors.map((c, i) => (
              <li
                key={`${c.name}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2"
              >
                <span
                  className="w-8 h-8 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden
                />
                <span className="text-sm text-arctic-deep flex-1">{c.name}</span>
                <span className="text-xs text-arctic-light font-mono">{c.hex}</span>
                <button
                  type="button"
                  onClick={() => onColorsChange(colors.filter((_, idx) => idx !== i))}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] uppercase tracking-wider text-arctic-light mb-1">
              Name
            </label>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Champagne"
              className="w-full auth-input"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-arctic-light mb-1">
              Swatch
            </label>
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="h-10 w-14 rounded cursor-pointer border border-white/20 bg-transparent"
            />
          </div>
          <button
            type="button"
            onClick={addColor}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] border border-femme-champagne/50 text-femme-champagne rounded-lg hover:bg-femme-champagne/10"
          >
            Add color
          </button>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-arctic-light mb-3">
          Available sizes
        </p>
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {sizes.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 text-sm text-arctic-deep"
              >
                {s}
                <button
                  type="button"
                  onClick={() => onSizesChange(sizes.filter((_, idx) => idx !== i))}
                  className="text-arctic-light hover:text-rose-400 text-xs"
                  aria-label={`Remove size ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] uppercase tracking-wider text-arctic-light mb-1">
              Size label
            </label>
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="M, 10, One size…"
              className="w-full auth-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSize();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={addSize}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] border border-femme-champagne/50 text-femme-champagne rounded-lg hover:bg-femme-champagne/10"
          >
            Add size
          </button>
        </div>
      </div>
    </div>
  );
}
